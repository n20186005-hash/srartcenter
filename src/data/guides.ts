export const guideSlugs = ['night-market-visit', 'shopping-and-crafts', 'old-market-riverside-walk'] as const;
export type GuideSlug = typeof guideSlugs[number];
type Guide = { title: string; description: string; intro: string; sections: { heading: string; paragraphs: string[] }[]; tips: string[] };
export const guides: Record<string, Record<GuideSlug, Guide>> = {
  en: {
    'night-market-visit': {
      title: 'Siem Reap Art Center Night Market: Hours, Location & First Visit',
      description: 'Plan an evening at Siem Reap Art Center Night Market: opening hours, riverfront location, arrival tips and a practical first-visit checklist.',
      intro: 'The Art Center Night Market stands near the Siem Reap River, opposite the Old Market area. It makes a convenient evening stop if you are already exploring central Siem Reap. This guide focuses on the decisions visitors make before setting out.',
      sections: [
        { heading: 'When should you go?', paragraphs: ['The commonly listed schedule is Monday to Saturday, 4:00–11:00 p.m., with Sunday closed. Individual stalls and holiday arrangements may differ; check the linked map listing and conditions locally before travelling.', 'Arriving early in the evening leaves time to browse without rushing. If you are combining several stops, allow flexibility for weather, traffic and a slower stroll along the river.'] },
        { heading: 'Where is the market?', paragraphs: ['Use the Art Center Night Market listing on Hospital Street, on the river side of central Siem Reap. The Old Market (Phsar Chas) is across the river. Confirm the destination name in your navigation app rather than following a generic “night market” result.', 'If arriving by tuk-tuk or car, agree on the precise destination and a safe pickup point. The final approach and pedestrian access can change with market activity.'] },
        { heading: 'How much time should you allow?', paragraphs: ['For a relaxed look at stalls, set aside about 45–90 minutes as a planning estimate, not an official tour duration. Add time if you intend to compare products, eat nearby or take photographs.', 'The market is an open shopping area rather than a timed admission attraction. Stall purchases, refreshments and transportation are separate costs. Ask for current prices before buying.'] },
      ],
      tips: ['Save the exact market map pin before leaving.', 'Carry small notes and ask which payment methods a seller accepts.', 'Keep bags close in busy walkways and ask before photographing vendors.', 'Check the forecast and any changes to market hours on the day.'],
    },
    'shopping-and-crafts': {
      title: 'What to Buy at Siem Reap Art Center Night Market',
      description: 'A visitor guide to browsing paintings, textiles, crafts and souvenirs at Siem Reap Art Center Night Market, with practical shopping questions.',
      intro: 'An evening market is best explored with time to inspect the work, ask questions and compare alternatives. The Art Center market is known for artwork, textiles and souvenirs, but the selection depends on which vendors are trading.',
      sections: [
        { heading: 'Artwork and handmade objects', paragraphs: ['You may encounter paintings, decorative objects and other craft-style gifts. If a piece matters to you, ask who made it, what materials were used and whether it can be packed safely for travel. Do not assume every item was produced locally.', 'For larger pictures, check dimensions, framing and transport requirements before paying. A photograph of the item and receipt can help with later identification.'] },
        { heading: 'Textiles and small souvenirs', paragraphs: ['Clothing, scarves and small keepsakes can be easy to carry, but inspect seams, fabric labels and finishing. Ask whether a quoted price is per item or for a set.', 'Some stalls may be open to polite price discussion. Treat the conversation respectfully, and be comfortable walking away if the item or price does not suit you.'] },
        { heading: 'How to shop thoughtfully', paragraphs: ['Ask whether items are handmade, locally made or imported. If local production is a priority, request specific maker information rather than relying solely on a sign.', 'For antiques, wildlife products or items that may be culturally sensitive, investigate export restrictions before purchasing. For routine souvenirs, retain a receipt and keep delicate goods protected.'] },
      ],
      tips: ['Compare quality and materials, not just the first quoted price.', 'Ask permission before photographing a stall or artwork.', 'Check currency and change before leaving the counter.', 'Avoid assuming fixed stock or specific performances on a given night.'],
    },
    'old-market-riverside-walk': {
      title: 'Old Market to Art Center Night Market: Riverside Evening Walk',
      description: 'A simple Siem Reap evening walking idea linking the Old Market riverfront with Art Center Night Market, plus navigation and safety notes.',
      intro: 'The Old Market quarter and the Art Center Night Market sit on opposite sides of the Siem Reap River. This compact outing brings together two different shopping atmospheres without requiring a long city itinerary.',
      sections: [
        { heading: 'Stop 1: Old Market (Phsar Chas)', paragraphs: ['Begin around the Old Market area while shops and surrounding streets are active. It is a useful landmark for orienting yourself in central Siem Reap. Trading hours vary between individual businesses, so do not rely on the night-market schedule for this stop.', 'Take a moment to find the river and check the pedestrian crossing on your map before moving on.'] },
        { heading: 'Stop 2: Cross toward the Art Center market', paragraphs: ['Use an available public bridge or marked pedestrian route across the Siem Reap River. Crossings and access may be affected by street works or events; follow current signs and avoid unmarked shortcuts.', 'The destination is the Siem Reap Art Center Night Market listing, not another market with a similar name. Check the pin before crossing.'] },
        { heading: 'Stop 3: Browse and return', paragraphs: ['Explore the stalls at your own pace and decide whether to finish with dinner in the surrounding central area. The route is an editorial suggestion rather than an official marked trail.', 'After dark, choose well-lit public paths and arrange transport back to your accommodation if you prefer not to walk. Allow extra time during rain or crowded evenings.'] },
      ],
      tips: ['Open both map pins before starting.', 'Wear comfortable footwear for uneven or wet pavement.', 'Watch for vehicles where pedestrian areas meet roads.', 'Recheck the market schedule, especially on Sundays.'],
    },
  },
  zh: {
    'night-market-visit': {
      title: '暹粒艺术中心夜市：开放时间、位置与初次游览', description: '整理暹粒艺术中心夜市的开放时间、河畔位置、到达方式和初次游览准备清单。',
      intro: '艺术中心夜市位于暹粒河附近，与老市场区域隔河相望。如果已经在暹粒市中心游览，这里适合安排为晚间的一站。本篇集中回答出发前最实用的问题。',
      sections: [
        { heading: '什么时候前往？', paragraphs: ['目前常见的营业资料为星期一至星期六 16:00–23:00、星期日休息。具体摊位和节假日可能不同，出发前请查看地图商家信息并在现场核实。', '傍晚较早抵达，可以留出慢慢逛街的时间。如果当天还安排其他景点，请考虑天气、交通与河畔步行所需时间。'] },
        { heading: '夜市在哪里？', paragraphs: ['导航请选择 Hospital Street 附近的 Siem Reap Art Center Night Market；老市场（Phsar Chas）在河的另一侧。不要只搜索“Night Market”，以免误入其他同名或相似地点。', '乘坐嘟嘟车或汽车时，提前与司机确认具体下车点及回程集合点，现场的车辆通道可能随摊位活动改变。'] },
        { heading: '要预留多久？', paragraphs: ['轻松浏览可先预留约 45–90 分钟，这是行程建议，并非官方游览时长。若需要挑选商品、到周边用餐或拍照，可以适当延长。', '这里是开放式购物空间，不属于限时入场景点；购物、餐饮和交通费用分别计算，购买前应询问现场价格。'] },
      ], tips: ['出发前保存夜市专属地图定位。', '准备少量零钱，并询问摊商接受的付款方式。', '人多时注意随身物品，拍摄摊主前先征求同意。', '当天查看天气和营业时间是否调整。'],
    },
    'shopping-and-crafts': {
      title: '暹粒艺术中心夜市买什么：绘画、手工艺与纪念品', description: '暹粒艺术中心夜市购物攻略，了解绘画、织品、工艺品、选购检查及礼貌议价。',
      intro: '逛夜市最好保留足够时间观察作品、向摊主提问并比较选择。艺术中心夜市常见绘画、织品和纪念品，但不同日期的摊位及商品并不完全相同。',
      sections: [
        { heading: '画作与手工艺品', paragraphs: ['可能看到绘画、装饰品及工艺风格的礼物。若打算购买，请询问制作者、材质和运输包装方式；不要默认所有商品都在当地制作。', '较大的作品还应确认尺寸、是否装框及托运要求。保留商品照片和收据，有助于日后辨认。'] },
        { heading: '织品与小纪念品', paragraphs: ['围巾、服饰和小型纪念品容易携带，不过仍应检查接缝、布料标示及做工，并确认报价是单件还是一组。', '部分商家可能接受礼貌议价。请尊重卖家，不合适时也可以友善地结束购买。'] },
        { heading: '怎样更安心地购买？', paragraphs: ['可以询问商品是否手工制作、是否在柬埔寨生产，若重视产地，最好索取具体制作者信息，而非只看招牌。', '购买疑似古董、野生动物制品或具有文化敏感性的物品前，应先核查出入境限制。普通纪念品也建议保留收据并妥善包装。'] },
      ], tips: ['比较材质和品质，不只看首次报价。', '拍摄摊位或作品前先征求同意。', '结账前确认币种、找零和总价。', '不要假定每天都有相同商品或演出。'],
    },
    'old-market-riverside-walk': {
      title: '暹粒老市场至艺术中心夜市：河畔傍晚步行路线', description: '从暹粒老市场步行前往艺术中心夜市的简易路线建议，包含过河导航与夜间注意事项。',
      intro: '老市场街区与艺术中心夜市分处暹粒河两岸。把这两个气氛不同的购物区域安排在同一晚，可以轻松体验市中心的河畔街景。',
      sections: [
        { heading: '第一站：老市场（Phsar Chas）', paragraphs: ['从老市场及周边街道开始，先熟悉暹粒市中心的方位。各商铺的营业时间不同，不能直接套用艺术中心夜市的时间。', '沿途寻找河道，并在过河前查看地图中的公共步行通道。'] },
        { heading: '第二站：过河前往艺术中心夜市', paragraphs: ['选择开放的公共桥梁或标示清楚的人行路线过河。道路施工或活动可能影响通行，应遵守现场指示，避免走未标示的捷径。', '目的地要选择 Siem Reap Art Center Night Market 的专属地图点，不要误选其他名称相似的夜市。'] },
        { heading: '第三站：逛夜市并安排返程', paragraphs: ['按自己的节奏逛摊位，之后可考虑在市中心周边用餐。这是编辑建议路线，不是官方划设的步道。', '入夜后优先选择有照明的公共道路；不想步行回住宿地点时，可提前安排交通。下雨或人多时应多预留时间。'] },
      ], tips: ['出发前同时打开老市场和夜市的地图定位。', '穿适合步行的鞋，注意湿滑或不平的路面。', '在人行道与车道交会处留意车辆。', '尤其在星期日，先核实夜市是否营业。'],
    },
  },
  km: {
    'night-market-visit': {
      title: 'ផ្សាររាត្រី Art Center សៀមរាប៖ ម៉ោងបើក ទីតាំង និងការទស្សនាលើកដំបូង', description: 'មគ្គុទ្ទេសក៍ម៉ោងបើក ទីតាំងជាប់មាត់ទន្លេ និងការត្រៀមខ្លួនមុនទៅផ្សាររាត្រី Art Center នៅសៀមរាប។',
      intro: 'ផ្សាររាត្រី Art Center ស្ថិតនៅក្បែរដងស្ទឹងសៀមរាប ទល់មុខតំបន់ផ្សារចាស់។ វាជាកន្លែងមួយដែលអាចបញ្ចូលក្នុងដំណើរកម្សាន្តពេលល្ងាចនៅកណ្ដាលក្រុង។',
      sections: [
        { heading: 'តើគួរទៅពេលណា?', paragraphs: ['ម៉ោងដែលត្រូវបានផ្សព្វផ្សាយជាទូទៅគឺថ្ងៃចន្ទដល់សៅរ៍ ម៉ោង ១៦:០០–២៣:០០ ហើយបិទថ្ងៃអាទិត្យ។ តូបនីមួយៗ និងថ្ងៃឈប់សម្រាកអាចខុសគ្នា។ សូមពិនិត្យព័ត៌មានថ្មីនៅលើផែនទី និងនៅទីតាំងជាក់ស្តែង។', 'ទៅនៅពេលល្ងាចដំបូងអាចមានពេលដើរមើលទំនិញដោយមិនប្រញាប់។ គួរទុកពេលបន្ថែមសម្រាប់អាកាសធាតុ និងចរាចរណ៍។'] },
        { heading: 'តើផ្សារនៅទីណា?', paragraphs: ['សូមជ្រើសរើសទីតាំង Siem Reap Art Center Night Market នៅជិត Hospital Street។ ផ្សារចាស់ (Phsar Chas) ស្ថិតនៅត្រើយម្ខាងនៃស្ទឹង។ កុំជ្រើសតែពាក្យ “night market” ព្រោះមានផ្សារផ្សេងទៀត។', 'ប្រសិនបើជិះរ៉ឺម៉ក ឬរថយន្ត សូមបញ្ជាក់ចំណុចចុះ និងកន្លែងជួបវិញជាមួយអ្នកបើកបរ។'] },
        { heading: 'ត្រូវការពេលប៉ុន្មាន?', paragraphs: ['សម្រាប់ដើរមើលធម្មតា អាចគ្រោងប្រហែល ៤៥–៩០ នាទី។ នេះជាការណែនាំសម្រាប់រៀបចំដំណើរ មិនមែនរយៈពេលផ្លូវការទេ។', 'ផ្សារជាតំបន់ទិញទំនិញបើកចំហ។ ការទិញទំនិញ អាហារ និងមធ្យោបាយធ្វើដំណើរមានថ្លៃរៀងៗខ្លួន។ សូមសួរតម្លៃមុនទិញ។'] },
      ], tips: ['រក្សាទុកតំណទីតាំងផ្សារត្រឹមត្រូវ។', 'ត្រៀមក្រដាសប្រាក់តូចៗ និងសួរអំពីវិធីបង់ប្រាក់។', 'ថែរក្សាកាបូប និងសុំការអនុញ្ញាតមុនថតរូបអ្នកលក់។', 'ពិនិត្យអាកាសធាតុ និងម៉ោងបើកនៅថ្ងៃធ្វើដំណើរ។'],
    },
    'shopping-and-crafts': {
      title: 'ទិញអ្វីនៅផ្សាររាត្រី Art Center សៀមរាប?', description: 'គន្លឹះមើលគំនូរ ក្រណាត់ សិប្បកម្ម និងវត្ថុអនុស្សាវរីយ៍នៅផ្សាររាត្រី Art Center។',
      intro: 'ការដើរផ្សារល្អគួរមានពេលពិនិត្យគុណភាព សួរអ្នកលក់ និងប្រៀបធៀបជម្រើស។ ផ្សារនេះល្បីដោយគំនូរ ក្រណាត់ និងវត្ថុអនុស្សាវរីយ៍ ប៉ុន្តែទំនិញអាចផ្លាស់ប្តូរតាមថ្ងៃ។',
      sections: [
        { heading: 'គំនូរ និងវត្ថុសិប្បកម្ម', paragraphs: ['អ្នកអាចឃើញគំនូរ និងវត្ថុតុបតែងផ្សេងៗ។ ប្រសិនបើចង់ទិញ សូមសួរអំពីអ្នកផលិត សម្ភារៈ និងរបៀបវេចខ្ចប់។ មិនគួរសន្មតថាគ្រប់មុខសុទ្ធតែផលិតក្នុងស្រុកទេ។', 'សម្រាប់រូបភាពធំ សូមពិនិត្យទំហំ ស៊ុម និងលក្ខខណ្ឌដឹកជញ្ជូន។ រក្សាវិក្កយបត្រ និងរូបទំនិញ។'] },
        { heading: 'ក្រណាត់ និងវត្ថុអនុស្សាវរីយ៍', paragraphs: ['ក្រមា សម្លៀកបំពាក់ និងវត្ថុតូចៗងាយយកតាមខ្លួន ប៉ុន្តែគួរពិនិត្យស្នាមដេរ និងគុណភាពសម្ភារៈ។ សួរថាតម្លៃគឺសម្រាប់មួយ ឬមួយឈុត។', 'អ្នកលក់ខ្លះអាចទទួលការចរចាដោយសុភាព។ គោរពគ្នាទៅវិញទៅមក ហើយអាចបដិសេធដោយសុភាពប្រសិនបើមិនសមនឹងអ្នក។'] },
        { heading: 'ការទិញប្រកបដោយការយកចិត្តទុកដាក់', paragraphs: ['សួរថាទំនិញធ្វើដោយដៃ ឬផលិតនៅកម្ពុជាឬទេ។ ប្រសិនបើប្រភពសំខាន់ សូមសួរព័ត៌មានអំពីអ្នកផលិតជាក់លាក់។', 'មុនទិញវត្ថុបុរាណ ឬផលិតផលពីសត្វព្រៃ សូមពិនិត្យច្បាប់នាំចេញ។ រក្សាវិក្កយបត្រ និងវេចខ្ចប់ទំនិញងាយបែក។'] },
      ], tips: ['ប្រៀបធៀបសម្ភារៈ និងគុណភាព មិនមែនតម្លៃតែប៉ុណ្ណោះ។', 'សុំការអនុញ្ញាតមុនថតតូប ឬស្នាដៃ។', 'បញ្ជាក់រូបិយប័ណ្ណ និងប្រាក់អាប់។', 'កុំរំពឹងថាទំនិញ ឬកម្មវិធីដូចគ្នារៀងរាល់យប់។'],
    },
    'old-market-riverside-walk': {
      title: 'ដើរពីផ្សារចាស់ទៅផ្សាររាត្រី Art Center តាមមាត់ស្ទឹងសៀមរាប', description: 'គំនិតដើរលេងពេលល្ងាចពីផ្សារចាស់ឆ្លងស្ទឹងទៅផ្សាររាត្រី Art Center និងការណែនាំសុវត្ថិភាព។',
      intro: 'ផ្សារចាស់ និងផ្សាររាត្រី Art Center ស្ថិតនៅត្រើយទាំងពីរនៃស្ទឹងសៀមរាប។ អ្នកអាចរួមបញ្ចូលកន្លែងទាំងពីរនៅក្នុងដំណើរលំហែពេលល្ងាចមួយ។',
      sections: [
        { heading: 'ចំណតទី១៖ ផ្សារចាស់ (Phsar Chas)', paragraphs: ['ចាប់ផ្ដើមពីតំបន់ផ្សារចាស់ និងផ្លូវជុំវិញ ដើម្បីស្គាល់ទិសនៅកណ្ដាលក្រុង។ ហាងនីមួយៗមានម៉ោងបើកខុសគ្នា។', 'រកមើលទន្លេ និងពិនិត្យផ្លូវថ្មើរជើងឆ្លងស្ទឹងនៅលើផែនទី។'] },
        { heading: 'ចំណតទី២៖ ឆ្លងទៅផ្សារ Art Center', paragraphs: ['ប្រើស្ពានសាធារណៈ ឬផ្លូវថ្មើរជើងដែលមានសញ្ញាសម្គាល់។ ការដ្ឋាន ឬព្រឹត្តិការណ៍អាចប៉ះពាល់ការធ្វើដំណើរ ដូច្នេះសូមគោរពសញ្ញានៅទីតាំង។', 'ជ្រើសរើសទីតាំង Siem Reap Art Center Night Market ឱ្យត្រឹមត្រូវ មុនឆ្លងស្ទឹង។'] },
        { heading: 'ចំណតទី៣៖ ដើរផ្សារ និងត្រឡប់', paragraphs: ['ដើរមើលតូបតាមល្បឿនរបស់អ្នក ហើយអាចរកអាហារនៅតំបន់កណ្ដាលក្រុង។ នេះជាសំណើផ្លូវដើរ មិនមែនផ្លូវទេសចរណ៍ផ្លូវការទេ។', 'ពេលយប់សូមប្រើផ្លូវសាធារណៈដែលមានភ្លើង និងរៀបចំមធ្យោបាយត្រឡប់ទៅកន្លែងស្នាក់នៅប្រសិនបើចាំបាច់។'] },
      ], tips: ['បើកផែនទីទីតាំងទាំងពីរមុនចេញដំណើរ។', 'ពាក់ស្បែកជើងងាយដើរ និងប្រយ័ត្នផ្លូវរអិល។', 'ប្រយ័ត្នយានយន្តនៅចំណុចកាត់ផ្លូវ។', 'ពិនិត្យម៉ោងផ្សារ ជាពិសេសនៅថ្ងៃអាទិត្យ។'],
    },
  },
};
