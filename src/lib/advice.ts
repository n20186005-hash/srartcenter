/**
 * Conditional advice engine for the weather module.
 *
 * Why this file exists
 * --------------------
 * A temperature and a rain percentage are data, not advice. Visitors ask
 * "do I need an umbrella tonight", "should I still plan the lake trip",
 * "what do I put in my bag". This module turns the measured values into
 * those sentences, and returns *only* the sentences that apply, so the page
 * never shows an umbrella tip on a cloudless evening.
 *
 * Structure of the output
 * ----------------------
 *   alerts    – severe conditions (thunderstorm, torrential rain, gale,
 *               extreme heat, thick fog). Rendered first, in red.
 *   cautions  – noticeable conditions worth knowing (wet paving, strong
 *               wind, heat, humidity, boat services).
 *   clothing  – what to wear.
 *   activities– how to shape the evening.
 *   items     – what to carry.
 *
 * Site profile ("what kind of place is this?")
 * --------------------------------------------
 * The attraction is an urban night market in a monsoon city: a walkable,
 * paved town centre (urban / cultural), the Tonle Sap lake within reach
 * (inland water), and Buddhist temple grounds inside walking distance
 * (outdoor heritage). The rules below therefore cover urban walking, lake
 * boat trips and outdoor temple visits, plus the tropical specifics that
 * matter here — heat, humidity, short heavy showers, mosquitoes and wet
 * paving.
 *
 * Deliberately absent: tide tables, sea temperature, wave height, snow and
 * ice, forest-fire danger, pollen. There is no coastline and no freezing
 * season here, so those data points could only be invented, not measured.
 * Rain intensity, wind gusts, visibility and apparent temperature are the
 * measurements that actually change a visit to this place.
 */
import type { WeatherData, WeatherDay } from './weather';

/** Thresholds, kept in one place so they can be discussed and tuned. */
export const THRESHOLDS = {
  /** Chance of rain high enough that an umbrella is not optional. */
  popUmbrella: 60,
  /** Chance of rain worth a small umbrella in the bag. */
  popMaybe: 30,
  /** Chance of rain in the market window that makes the lanes slippery. */
  popWetLanes: 40,
  /** Daily total (mm) that leaves the paving wet enough to be slippery. */
  rainWet: 1,
  /** Daily total (mm) considered a soaking. */
  rainSoaking: 3,
  /** Daily total (mm) heavy enough to flood low-lying streets. */
  rainHeavy: 25,
  /** Daytime high (°C) that makes midday walking uncomfortable. */
  heatDay: 32,
  /** Apparent temperature (°C) that becomes a health consideration. */
  heatStress: 37,
  /** Relative humidity (%) that makes warm air feel heavy. */
  humidHeavy: 75,
  /** UV index needing protection. */
  uvCare: 5,
  /** Very high UV index. */
  uvHigh: 8,
  /** Wind (km/h) around Beaufort 6 — canopies and boat services react. */
  windStrong: 39,
  /** Wind (km/h) around Beaufort 7 — unsafe for open-air structures. */
  windGale: 50,
  /** Gust (km/h) that makes loose objects a hazard. */
  gustGale: 62,
  /** Visibility (m) counted as fog. */
  fogVisibility: 1000,
  /** Visibility (m) below which views are noticeably hazy. */
  hazeVisibility: 2000,
  /** Day/night temperature spread (°C) that needs an extra layer. */
  diurnalSpread: 8,
  /** Daytime high (°C) below which winter clothing applies. */
  coldDay: 10,
  /** Warm, humid evenings when mosquitoes are active. */
  mosquitoTemp: 24,
  mosquitoHumidity: 65,
} as const;

export interface AdviceItem {
  /** Key inside `weather.smart.rules` of the active language. */
  key: string;
  icon: string;
  /** Values interpolated into the localized sentence. */
  params?: Record<string, string | number>;
}

export interface WeatherAdvice {
  alerts: AdviceItem[];
  cautions: AdviceItem[];
  clothing: AdviceItem[];
  activities: AdviceItem[];
  items: AdviceItem[];
}

const EMPTY_ADVICE: WeatherAdvice = {
  alerts: [],
  cautions: [],
  clothing: [],
  activities: [],
  items: [],
};

/** Beaufort force for a wind speed in km/h, used for the visitor-facing label. */
export function windLevel(kmh: number): number {
  const scale = [1, 6, 12, 20, 29, 39, 50, 62, 75, 89, 103, 118];
  let level = 0;
  for (let i = 0; i < scale.length; i += 1) {
    if (kmh >= scale[i]) level = i + 1;
  }
  return level;
}

function limit(items: AdviceItem[], max: number): AdviceItem[] {
  const seen = new Set<string>();
  const result: AdviceItem[] = [];
  for (const item of items) {
    if (seen.has(item.key)) continue;
    seen.add(item.key);
    result.push(item);
    if (result.length >= max) break;
  }
  return result;
}

/** Normalized values the rules read, so each rule stays a single condition. */
interface Facts {
  min: number;
  max: number;
  range: number;
  feelsNow: number;
  feelsPeak: number;
  humidity: number;
  uv: number;
  windNow: number;
  windPeak: number;
  gustPeak: number;
  visibility: number;
  rainChance: number;
  rainToday: number;
  rainWindow: number;
  code: number;
  rainingNow: boolean;
  thunder: boolean;
  wetLanes: boolean;
  clear: boolean;
  grey: boolean;
  fog: boolean;
  hazy: boolean;
  mosquitoes: boolean;
}

function readFacts(data: WeatherData): Facts {
  const now = data.current!;
  const today = data.today!;
  const window = data.evening;

  const code = now.code;
  const rainingNow = now.precipitation > 0 || (code >= 51 && code <= 67) || (code >= 80 && code <= 82) || code >= 95;

  // Rain advice is driven by the hours the market is open, because that is
  // when the visitor is outside. A wet day still counts, because the lanes
  // and the surrounding side streets stay wet into the evening.
  const rainChance = Math.max(window?.pop ?? 0, today.pop);
  const rainWindow = window?.precip ?? 0;
  const rainToday = today.precip;

  const windPeak = Math.max(window?.windMax ?? 0, today.windMax);
  const gustPeak = Math.max(window?.gustMax ?? 0, today.gustMax);
  const feelsPeak = Math.max(now.feels, window?.feelsMax ?? 0, 0);

  const byCode = (from: number, to: number) => code >= from && code <= to;

  return {
    min: today.min,
    max: today.max,
    range: Math.round((today.max - today.min) * 10) / 10,
    feelsNow: now.feels,
    feelsPeak,
    humidity: now.humidity,
    uv: today.uvMax,
    windNow: now.wind,
    windPeak,
    gustPeak,
    visibility: now.visibility,
    rainChance,
    rainToday,
    rainWindow,
    code,
    rainingNow,
    thunder: (window?.thunder ?? false) || today.thunder || code >= 95,
    wetLanes:
      rainToday >= THRESHOLDS.rainWet || rainChance >= THRESHOLDS.popWetLanes || rainWindow > 0,
    clear: code <= 1,
    grey: byCode(2, 3),
    fog: code === 45 || code === 48 || now.visibility < THRESHOLDS.fogVisibility,
    hazy: now.visibility < THRESHOLDS.hazeVisibility,
    mosquitoes: feelsPeak >= THRESHOLDS.mosquitoTemp && (now.humidity >= THRESHOLDS.mosquitoHumidity || rainToday > 0),
  };
}

/**
 * Severe conditions for a forecast day, used to mark the 7-day list.
 * Kept here so every threshold in the module lives in one file.
 */
export function isSevereDay(day: WeatherDay): boolean {
  const heavyRain = day.precip >= THRESHOLDS.rainHeavy;
  const thunder = day.code >= 95;
  const gale = day.gustMax >= THRESHOLDS.gustGale || day.windMax >= THRESHOLDS.windGale;
  const heat = day.feelsMax >= THRESHOLDS.heatStress;
  const fog = day.code === 45 || day.code === 48;
  return heavyRain || thunder || gale || heat || fog;
}

/**
 * Builds the visitor-facing advice for the current reading.
 * Returns empty groups when live data is unavailable.
 */
export function buildAdvice(data: WeatherData): WeatherAdvice {
  if (!data.ok || !data.current || !data.today) return EMPTY_ADVICE;

  const f = readFacts(data);
  const alerts: AdviceItem[] = [];
  const cautions: AdviceItem[] = [];
  const clothing: AdviceItem[] = [];
  const activities: AdviceItem[] = [];
  const items: AdviceItem[] = [];

  // ---------------------------------------------------------------- alerts
  if (f.thunder) {
    alerts.push({ key: 'alertThunder', icon: '⛈️' });
  }
  if (f.rainToday >= THRESHOLDS.rainHeavy) {
    alerts.push({ key: 'alertHeavyRain', icon: '🌊', params: { mm: Math.round(f.rainToday) } });
  }
  if (f.feelsPeak >= THRESHOLDS.heatStress) {
    alerts.push({ key: 'alertHeat', icon: '🥵', params: { temp: Math.round(f.feelsPeak) } });
  }
  if (f.gustPeak >= THRESHOLDS.gustGale || f.windPeak >= THRESHOLDS.windGale) {
    alerts.push({ key: 'alertGale', icon: '💨', params: { wind: Math.round(Math.max(f.gustPeak, f.windPeak)) } });
  }
  if (f.fog && f.visibility < THRESHOLDS.fogVisibility) {
    alerts.push({ key: 'alertFog', icon: '🌫️' });
  }
  if (f.max <= THRESHOLDS.coldDay) {
    alerts.push({ key: 'alertCold', icon: '🥶', params: { temp: Math.round(f.min) } });
  }

  // -------------------------------------------------------------- cautions
  if (f.thunder || f.windPeak >= THRESHOLDS.windStrong) {
    cautions.push({ key: 'cautionBoat', icon: '🛶' });
  }
  if (f.windPeak >= THRESHOLDS.windStrong) {
    cautions.push({ key: 'cautionWindy', icon: '🌬️', params: { level: windLevel(f.windPeak) } });
  }
  if (f.wetLanes || f.rainingNow) {
    cautions.push({ key: 'cautionSlippery', icon: '👟' });
  }
  if (f.max >= THRESHOLDS.heatDay) {
    cautions.push({ key: 'cautionHotWalk', icon: '🌡️', params: { temp: Math.round(f.max) } });
  }
  if (f.feelsPeak >= THRESHOLDS.heatDay && f.humidity >= THRESHOLDS.humidHeavy) {
    cautions.push({ key: 'cautionHumid', icon: '💦' });
  }

  // -------------------------------------------------------------- clothing
  if (f.rainChance >= THRESHOLDS.popUmbrella || f.rainingNow) {
    clothing.push({ key: 'dressRain', icon: '🧥' });
  }
  if (f.max >= THRESHOLDS.heatDay) {
    clothing.push({ key: 'dressLight', icon: '👕' });
  }
  if (f.range >= THRESHOLDS.diurnalSpread) {
    clothing.push({ key: 'dressLayers', icon: '🎽' });
  }
  if (f.max <= THRESHOLDS.coldDay) {
    clothing.push({ key: 'dressWarm', icon: '🧣' });
  }
  if (clothing.length === 0) {
    clothing.push({ key: 'dressComfort', icon: '👟' });
  }

  // ------------------------------------------------------------ activities
  if (f.thunder || f.rainToday >= THRESHOLDS.rainHeavy) {
    activities.push({ key: 'actIndoor', icon: '🏛️' });
  }
  if (f.windPeak >= THRESHOLDS.windStrong || f.thunder) {
    activities.push({ key: 'actBoatSuspend', icon: '🚤' });
  }
  if (f.rainingNow || f.rainChance >= THRESHOLDS.popUmbrella) {
    activities.push({ key: 'actOutdoorPoor', icon: '☔' });
  }
  if (f.fog || (f.hazy && f.rainToday === 0)) {
    activities.push({ key: 'actPoorViews', icon: '🔭' });
  }
  if (f.max >= THRESHOLDS.heatDay) {
    activities.push({ key: 'actNoon', icon: '🕓' });
  }
  if (f.uv >= THRESHOLDS.uvCare && f.max >= THRESHOLDS.heatDay - 4) {
    activities.push({ key: 'actSunset', icon: '🌇' });
  }
  if (f.grey && f.rainChance < THRESHOLDS.popMaybe) {
    activities.push({ key: 'actPhotoSoft', icon: '📷' });
  }
  if (f.clear && f.rainChance < THRESHOLDS.popMaybe) {
    activities.push({ key: 'actOutdoorGood', icon: '🚶' });
  }
  if (activities.length === 0) {
    activities.push({ key: 'actAnyTime', icon: '🕐' });
  }

  // ----------------------------------------------------------------- items
  if (f.rainChance >= THRESHOLDS.popUmbrella) {
    items.push({ key: 'itemUmbrella', icon: '☂️' });
    if (f.windPeak >= THRESHOLDS.windStrong) {
      items.push({ key: 'itemRaincoatWind', icon: '🧥' });
    }
  } else if (f.rainChance >= THRESHOLDS.popMaybe || f.code >= 51) {
    items.push({ key: 'itemFoldingUmbrella', icon: '🌂' });
  }
  if (f.rainToday >= THRESHOLDS.rainHeavy) {
    items.push({ key: 'itemRaincoat', icon: '🧥' });
  }
  if (f.max >= THRESHOLDS.heatDay || f.feelsPeak >= THRESHOLDS.heatDay) {
    items.push({ key: 'itemWater', icon: '🥤' });
  }
  if (f.uv >= THRESHOLDS.uvCare) {
    items.push({ key: 'itemSun', icon: '🧴', params: { uv: Math.round(f.uv) } });
  }
  if (f.feelsPeak >= THRESHOLDS.heatDay + 2) {
    items.push({ key: 'itemFan', icon: '🪭' });
  }
  if (f.mosquitoes) {
    items.push({ key: 'itemRepellent', icon: '🦟' });
  }
  if (f.wetLanes || f.rainingNow) {
    items.push({ key: 'itemGrippyShoes', icon: '🥾' });
  }
  if (f.hazy && f.rainToday === 0) {
    items.push({ key: 'itemMask', icon: '😷' });
  }
  if (items.length === 0) {
    items.push({ key: 'itemBasics', icon: '🎒' });
  }

  return {
    alerts: limit(alerts, 3),
    cautions: limit(cautions, 3),
    clothing: limit(clothing, 3),
    activities: limit(activities, 3),
    items: limit(items, 4),
  };
}
