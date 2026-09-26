export const trip = {
  title: '长沙组队出发',
  dateText: '2026 · 日期核对中',
  dateNote: '四段行程的具体日期待确认',
  people: ['周梓涛', '钟茗睿', '谭昭爵', '杜屹浩', '杜屹浩的同事'],
  verifiedAt: '2026-09-26',
};

// Map coordinates are WGS84 from OpenStreetMap. Never assign a precise pin to an unconfirmed venue.
export const places = [
  {
    id: 'hotel',
    name: '电竞酒店',
    subtitle: '住宿 · 名称与地址待确认',
    location: '长沙市 · 精确位置待确认',
    status: 'pending',
    color: 'blue',
    days: ['arrival', 'expo', 'fangte', 'return'],
  },
  {
    id: 'makeup',
    name: '顺天宾馆（妆娘）',
    subtitle: '集合 · 同名地点较多',
    location: '长沙市 · 分店与地址待确认',
    status: 'pending',
    color: 'yellow',
    days: ['expo'],
  },
  {
    id: 'expo',
    name: '漫展场馆',
    subtitle: '活动 · 场馆待确认',
    location: '长沙市 · 精确位置待确认',
    status: 'pending',
    color: 'orange',
    days: ['expo'],
  },
  {
    id: 'fangte',
    name: '株洲方特欢乐世界',
    subtitle: '游玩 · 已核实园区',
    location: '株洲市云龙示范区华强路 1 号',
    status: 'verified',
    color: 'yellow',
    lat: 27.9928467,
    lng: 113.1878504,
    search: '株洲方特欢乐世界',
    city: '株洲',
    days: ['fangte'],
  },
];

export const days = [
  {
    id: 'arrival',
    number: '01',
    name: '抵达长沙',
    date: '日期待确认',
    kicker: '集结日',
    summary: '先到的三人办理入住，等谭昭爵到齐。',
    steps: [
      { time: '抵达后', title: '三人先行抵达', detail: '周梓涛、钟茗睿、杜屹浩先到长沙，前往电竞酒店办理入住；记得带身份证。', place: 'hotel' },
      { time: '稍后', title: '谭昭爵抵达并入住', detail: '抵达方式与到站地点未提供，接驳时间暂时无法计算。', place: 'hotel' },
      { time: '晚上', title: '游戏或彩六五排', detail: '杜屹浩先回家找同事，晚间活动按大家状态灵活安排。' },
    ],
    assessment: 'arrival',
  },
  {
    id: 'expo',
    number: '02',
    name: '漫展日',
    date: '日期待确认',
    kicker: '妆造 + 漫展',
    summary: '先妆造，再五人会合打车去漫展。',
    steps: [
      { time: '09:00', title: '三人到顺天宾馆化妆', detail: '周梓涛、钟茗睿、谭昭爵先到妆娘处。宾馆分店未确认。', place: 'makeup' },
      { time: '09:30', title: '杜屹浩到场集合', detail: '第五位同事的会合时间与位置待确认。', place: 'makeup' },
      { time: '10:00', title: '五人打车前往漫展', detail: '普通五座网约车加司机只能载四位乘客，应约可载五位乘客的车或分两辆车。', place: 'expo' },
      { time: '全天', title: '参加漫展', detail: '结束后返回酒店；杜屹浩晚上还需取车。', place: 'expo' },
    ],
    assessment: 'expo',
  },
  {
    id: 'fangte',
    number: '03',
    name: '株洲方特',
    date: '日期待确认',
    kicker: '自驾往返',
    summary: '杜屹浩接上大家，自驾去株洲方特欢乐世界。',
    steps: [
      { time: '08:20', title: '杜屹浩出发接人', detail: '出发地未知，08:20 → 09:00 能否到酒店须待地址核算。', place: 'hotel' },
      { time: '约 09:00', title: '酒店集合出发', detail: '五人同行，已确认车辆核载至少五人；建议尽量准时上车。', place: 'hotel' },
      { time: '约 10:20–11:15', title: '规划入园窗口', detail: '以 09:05 离开酒店、国庆路况预留 60–100 分钟、停车入园 15–30 分钟估算；属于计划缓冲，不是实时交通预测。', place: 'fangte' },
      { time: '晚上', title: '原路送回酒店', detail: '具体返程时间取决于当日闭园时间与车流，出园前用导航重新查。', place: 'hotel' },
    ],
    assessment: 'fangte',
  },
  {
    id: 'return',
    number: '04',
    name: '休息返程',
    date: '日期待确认',
    kicker: '收尾日',
    summary: '上午休息，下午吃饭，傍晚返程。',
    steps: [
      { time: '上午', title: '酒店休息', detail: '留出退房和整理行李时间，具体退房规则以酒店预订为准。', place: 'hotel' },
      { time: '下午', title: '找地方吃饭休息', detail: '餐厅未定，可从酒店附近搜索；确定酒店后再算移动时间。' },
      { time: '傍晚', title: '返程', detail: '车站或机场及出发时刻未提供，暂不能反推离开酒店的时间。' },
    ],
    assessment: 'return',
  },
];

export const assessments = {
  arrival: {
    badge: '待定位',
    title: '先确认抵达站与酒店',
    verdict: '抵达方式、站点和酒店尚不明确，目前无法计算接驳耗时。',
    rows: [
      ['已知', '三人先到，谭昭爵随后抵达'],
      ['待补', '抵达站点、酒店地址、各人到达时刻'],
    ],
  },
  expo: {
    badge: '运力提醒',
    title: '五人同行需大车或两车',
    verdict: '妆娘地点和漫展场馆尚未确认，无法给出可靠车程。10:00 出发前应核对妆造是否完成，并约可坐五名乘客的车型。',
    rows: [
      ['普通五座车', '司机 + 4 名乘客，不够五人同行'],
      ['可行选择', '六/七座车型，或分乘两车'],
      ['车程', '待宾馆与场馆定位后计算'],
    ],
  },
  fangte: {
    badge: '时间偏紧',
    title: '09:30 抵达不宜作为目标',
    verdict: '五一广场附近至株洲方特的公开路网模型约 41 公里、37 分钟；这是无实时车流的顺畅基线。国庆期间建议预留 60–100 分钟车程，另留 15–30 分钟停车入园。',
    rows: [
      ['09:05 酒店发车', '约 10:05–10:45 到停车场'],
      ['预计入园', '约 10:20–11:15；假期拥堵可能更晚'],
      ['自驾合理性', '五人同进同出且返程灵活；CZ1 城际公交是备选'],
    ],
  },
  return: {
    badge: '待订票',
    title: '返程时间需倒推',
    verdict: '傍晚返程是否宽松，取决于酒店、餐厅、车站或机场及票面时刻。地点明确后再倒推最晚离开餐厅的时间。',
    rows: [
      ['已知', '上午休息、下午吃饭、傍晚返程'],
      ['待补', '返程车次/航班及出发站点'],
    ],
  },
};

export const sources = [
  ['株洲方特欢乐世界官网', 'https://zhuzhou.fangte.com/adventure/'],
  ['高德地图 URI 搜索说明', 'https://developer.amap.com/api/uri-api/guide/search/search'],
  ['湖南省交通运输厅：CZ1 途经方特', 'https://jtt.hunan.gov.cn/xxgk/gzdt/szdt1/202110/t20211027_20891618.html'],
  ['国务院办公厅：2026 年国庆假期', 'https://www.gov.cn/zhengce/zhengceku/202511/content_7047091.htm'],
  ['OSRM 路线模型查询', 'https://router.project-osrm.org/route/v1/driving/112.9709227,28.1985991;113.1878504,27.9928467?overview=false'],
  ['OpenStreetMap 地图与版权', 'https://www.openstreetmap.org/copyright'],
];
