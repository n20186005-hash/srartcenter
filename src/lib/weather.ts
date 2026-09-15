/**
 * Live weather for the guide.
 *
 * The conditions block is rendered on the server so that no weather data is
 * requested from the visitor's browser. Two cache layers keep the upstream
 * calls rare:
 *
 *   1. an in-isolate memory cache (30 minutes)
 *   2. the edge cache of the platform runtime, applied to the upstream call
 *
 * If the upstream service cannot be reached, `ok: false` is returned and the
 * page falls back to the long-term climate summary.
 *
 * The payload is deliberately wider than a classic city forecast: gusts,
 * visibility, apparent temperature and per-hour precipitation are what the
 * advice engine in `lib/advice.ts` needs in order to say something useful
 * about a street market that is only open in the evening.
 */
import { attraction } from '../config/site';

const TIMEZONE = 'Asia/Phnom_Penh';
const CACHE_TTL_SECONDS = 1800;
const REQUEST_TIMEOUT_MS = 5000;

const ENDPOINT = 'https://api.open-meteo.com/v1/forecast';
const CURRENT_FIELDS = [
  'temperature_2m',
  'relative_humidity_2m',
  'apparent_temperature',
  'is_day',
  'precipitation',
  'weather_code',
  'wind_speed_10m',
  'wind_gusts_10m',
  'visibility',
];
const HOURLY_FIELDS = [
  'temperature_2m',
  'apparent_temperature',
  'relative_humidity_2m',
  'precipitation_probability',
  'precipitation',
  'weather_code',
  'wind_speed_10m',
  'wind_gusts_10m',
  'visibility',
];
const DAILY_FIELDS = [
  'weather_code',
  'temperature_2m_max',
  'temperature_2m_min',
  'apparent_temperature_max',
  'precipitation_probability_max',
  'precipitation_sum',
  'wind_speed_10m_max',
  'wind_gusts_10m_max',
  'uv_index_max',
  'sunrise',
  'sunset',
];

/** Fallback for a missing visibility value: far enough to mean "no fog". */
const CLEAR_VISIBILITY_M = 24000;

export interface WeatherCurrent {
  temp: number;
  feels: number;
  humidity: number;
  wind: number;
  gust: number;
  /** Horizontal visibility in metres. */
  visibility: number;
  /** Precipitation of the current interval, in millimetres. */
  precipitation: number;
  code: number;
  isDay: boolean;
}

export interface WeatherDay {
  date: string;
  code: number;
  min: number;
  max: number;
  /** Daytime peak of the apparent temperature. */
  feelsMax: number;
  /** Highest chance of precipitation, in percent. */
  pop: number;
  /** Total precipitation, in millimetres. */
  precip: number;
  windMax: number;
  gustMax: number;
  uvMax: number;
}

/** Aggregated conditions for the hours the market is open (16:00–23:00). */
export interface WeatherWindow {
  min: number;
  max: number;
  feelsMax: number;
  pop: number;
  precip: number;
  windMax: number;
  gustMax: number;
  humidity: number;
  /** A thunderstorm appears anywhere in the window. */
  thunder: boolean;
  /** Lowest visibility inside the window, in metres. */
  visibility: number;
}

export interface WeatherData {
  ok: boolean;
  /** Local observation time of the current reading, e.g. "2026-09-15T18:20". */
  observedAt: string;
  /** True when the values come from an earlier successful reading. */
  stale: boolean;
  current: WeatherCurrent | null;
  today: {
    min: number;
    max: number;
    pop: number;
    uvMax: number;
    sunrise: string;
    sunset: string;
    /** Total precipitation for the local day, in millimetres. */
    precip: number;
    windMax: number;
    gustMax: number;
    feelsMax: number;
    /** A thunderstorm appears anywhere in the local day. */
    thunder: boolean;
  } | null;
  /** Market opening window (16:00–23:00) for the current day. */
  evening: WeatherWindow | null;
  days: WeatherDay[];
}

const EMPTY: WeatherData = {
  ok: false,
  observedAt: '',
  stale: false,
  current: null,
  today: null,
  evening: null,
  days: [],
};

interface CacheEntry {
  data: WeatherData;
  storedAt: number;
}

// Survives between requests inside the same runtime isolate.
let memoryCache: CacheEntry | null = null;
let inFlight: Promise<WeatherData> | null = null;

/** Map a WMO weather code to the short label key used by the UI. */
export function weatherCodeKey(code: number): string {
  if (code === 0) return 'clear';
  if (code === 1) return 'mostlyClear';
  if (code === 2) return 'partly';
  if (code === 3) return 'overcast';
  if (code === 45 || code === 48) return 'fog';
  if (code >= 51 && code <= 57) return 'drizzle';
  if (code >= 61 && code <= 67) return 'rain';
  if (code >= 71 && code <= 77) return 'snow';
  if (code >= 80 && code <= 82) return 'showers';
  if (code >= 85 && code <= 86) return 'showers';
  if (code >= 95) return 'thunder';
  return 'partly';
}

/** Emoji used next to the condition label (decorative, hidden from screen readers). */
export function weatherIcon(code: number, isDay = true): string {
  const key = weatherCodeKey(code);
  switch (key) {
    case 'clear':
      return isDay ? '☀️' : '🌙';
    case 'mostlyClear':
      return isDay ? '🌤️' : '🌙';
    case 'partly':
      return '⛅';
    case 'overcast':
      return '☁️';
    case 'fog':
      return '🌫️';
    case 'drizzle':
      return '🌦️';
    case 'rain':
      return '🌧️';
    case 'showers':
      return '🌦️';
    case 'thunder':
      return '⛈️';
    case 'snow':
      return '🌨️';
    default:
      return '⛅';
  }
}

/** True for a WMO code that describes a thunderstorm. */
export function isThunderCode(code: number): boolean {
  return code >= 95;
}

function round(value: number | null | undefined, digits = 0): number {
  if (value === null || value === undefined || Number.isNaN(value)) return 0;
  const factor = 10 ** digits;
  return Math.round(value * factor) / factor;
}

/** Numeric extraction that keeps a sensible fallback instead of 0. */
function num(value: unknown, fallback = 0): number {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function maxOf(values: number[], fallback = 0): number {
  return values.length ? Math.max(...values) : fallback;
}

function sumOf(values: number[]): number {
  return values.reduce((total, value) => total + value, 0);
}

function buildUrl(): string {
  const params = new URLSearchParams({
    latitude: String(attraction.lat),
    longitude: String(attraction.lng),
    current: CURRENT_FIELDS.join(','),
    hourly: HOURLY_FIELDS.join(','),
    daily: DAILY_FIELDS.join(','),
    timezone: TIMEZONE,
    forecast_days: '7',
    wind_speed_unit: 'kmh',
  });
  return `${ENDPOINT}?${params.toString()}`;
}

function transform(payload: any): WeatherData {
  const currentRaw = payload?.current ?? {};
  const hourly = payload?.hourly ?? {};
  const daily = payload?.daily ?? {};

  const current: WeatherCurrent = {
    temp: round(currentRaw.temperature_2m),
    feels: round(currentRaw.apparent_temperature),
    humidity: round(currentRaw.relative_humidity_2m),
    wind: round(currentRaw.wind_speed_10m),
    gust: round(currentRaw.wind_gusts_10m),
    visibility: Math.round(num(currentRaw.visibility, CLEAR_VISIBILITY_M)),
    precipitation: round(currentRaw.precipitation, 1),
    code: Number(currentRaw.weather_code ?? 0),
    isDay: Number(currentRaw.is_day ?? 1) === 1,
  };

  const days: WeatherDay[] = (daily.time ?? []).map((date: string, i: number) => ({
    date,
    code: Number(daily.weather_code?.[i] ?? 0),
    min: round(daily.temperature_2m_min?.[i]),
    max: round(daily.temperature_2m_max?.[i]),
    feelsMax: round(daily.apparent_temperature_max?.[i]),
    pop: round(daily.precipitation_probability_max?.[i]),
    precip: round(daily.precipitation_sum?.[i], 1),
    windMax: round(daily.wind_speed_10m_max?.[i]),
    gustMax: round(daily.wind_gusts_10m_max?.[i]),
    uvMax: round(daily.uv_index_max?.[i], 1),
  }));

  const hourlyTimes: string[] = hourly.time ?? [];
  const todayKey = String(days[0]?.date ?? '');

  // Hourly slices for one local day: the whole day and the market window.
  const indicesFor = (predicate: (hour: number) => boolean) =>
    hourlyTimes
      .map((stamp, i) => ({ stamp, i }))
      .filter(({ stamp }) => !todayKey || stamp.startsWith(todayKey))
      .filter(({ stamp }) => predicate(Number(stamp.slice(11, 13))))
      .map(({ i }) => i);

  const pick = (field: string, indices: number[]) =>
    indices.map((i) => hourly[field]?.[i]).filter((v: unknown) => v !== null && v !== undefined);

  const dayIndices = indicesFor(() => true);
  const windowIndices = indicesFor((hour) => hour >= 16 && hour <= 23);

  const today = days[0]
    ? {
        min: days[0].min,
        max: days[0].max,
        pop: days[0].pop,
        uvMax: round(daily.uv_index_max?.[0], 1),
        sunrise: String(daily.sunrise?.[0] ?? '').slice(11, 16),
        sunset: String(daily.sunset?.[0] ?? '').slice(11, 16),
        precip: days[0].precip,
        windMax: days[0].windMax,
        gustMax: days[0].gustMax,
        feelsMax: days[0].feelsMax,
        thunder: pick('weather_code', dayIndices).some((code) => isThunderCode(Number(code))),
      }
    : null;

  // Market hours (16:00–23:00) for the current local day.
  let evening: WeatherWindow | null = null;
  if (windowIndices.length > 0) {
    const temps = pick('temperature_2m', windowIndices).map(Number);
    const feels = pick('apparent_temperature', windowIndices).map(Number);
    const pops = pick('precipitation_probability', windowIndices).map(Number);
    const precipHours = pick('precipitation', windowIndices).map(Number);
    const winds = pick('wind_speed_10m', windowIndices).map(Number);
    const gusts = pick('wind_gusts_10m', windowIndices).map(Number);
    const humidities = pick('relative_humidity_2m', windowIndices).map(Number);
    const visibilities = pick('visibility', windowIndices).map((v) => num(v, CLEAR_VISIBILITY_M));

    evening = {
      min: round(temps.length ? Math.min(...temps) : 0),
      max: round(maxOf(temps)),
      feelsMax: round(maxOf(feels)),
      pop: round(maxOf(pops)),
      precip: round(sumOf(precipHours), 1),
      windMax: round(maxOf(winds)),
      gustMax: round(maxOf(gusts)),
      humidity: round(humidities.length ? sumOf(humidities) / humidities.length : 0),
      thunder: pick('weather_code', windowIndices).some((code) => isThunderCode(Number(code))),
      visibility: Math.round(visibilities.length ? Math.min(...visibilities) : CLEAR_VISIBILITY_M),
    };
  }

  return {
    ok: true,
    observedAt: String(currentRaw.time ?? '').slice(0, 16),
    stale: false,
    current,
    today,
    evening,
    days,
  };
}

async function fetchWeather(): Promise<WeatherData> {
  const headers: Record<string, string> = { accept: 'application/json' };
  const init: RequestInit & { cf?: unknown } = {
    headers,
    signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
  };

  // Ask the platform runtime to keep the upstream answer at the edge as well.
  const runtimeCaches = (globalThis as any).caches;
  if (runtimeCaches && typeof runtimeCaches.default?.match === 'function') {
    (init as any).cf = { cacheTtl: CACHE_TTL_SECONDS, cacheEverything: true };
  }

  const response = await fetch(buildUrl(), init as RequestInit);
  if (!response.ok) throw new Error(`weather upstream responded ${response.status}`);

  const payload = await response.json();
  const data = transform(payload);
  if (!data.current || data.days.length === 0) throw new Error('weather payload incomplete');
  return data;
}

/**
 * Returns the current conditions plus a 7-day outlook.
 * Never throws: on failure the previous reading (if any) is reused, otherwise
 * `ok` is false and the caller renders the climate fallback.
 */
export async function getWeather(): Promise<WeatherData> {
  const now = Date.now();

  if (memoryCache && now - memoryCache.storedAt < CACHE_TTL_SECONDS * 1000) {
    return memoryCache.data;
  }

  if (inFlight) return inFlight;

  inFlight = (async () => {
    try {
      const data = await fetchWeather();
      memoryCache = { data, storedAt: Date.now() };
      return data;
    } catch (error) {
      if (memoryCache) {
        return { ...memoryCache.data, stale: true };
      }
      return EMPTY;
    } finally {
      inFlight = null;
    }
  })();

  return inFlight;
}
