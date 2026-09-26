export const trip = {
  title: '长沙组队出发',
  dateText: '2026.09.30 — 10.03',
  dateNote: '9 月 30 日抵达 · 10 月 1 日漫展 · 10 月 2 日方特 · 10 月 3 日返程',
  people: ['周梓涛', '钟茗睿', '谭昭爵', '杜屹浩', '杜屹浩的同事'],
  verifiedAt: '2026-09-26',
};

// Map coordinates use WGS84. Makeup and expo pins are approximate POI locations, not entrances.
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
    name: '顺天宾馆（湖南省植物园店）',
    subtitle: '妆造集合 · 地图位置约点',
    location: '长沙市雨花区洞井商贸城 3 区 11 号',
    status: 'verified',
    color: 'yellow',
    lat: 28.102947,
    lng: 113.017677,
    search: '顺天宾馆 湖南省植物园店 洞井商贸城3区11号',
    city: '长沙',
    days: ['expo'],
  },
  {
    id: 'expo',
    name: '长沙国际会展中心',
    subtitle: '漫展场馆 · 标记为场馆中心',
    location: '长沙市长沙县黄兴镇国展路 118 号',
    status: 'verified',
    color: 'orange',
    lat: 28.14654,
    lng: 113.07472,
    search: '长沙国际会展中心 国展路118号',
    city: '长沙',
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
    date: '09.30 / 周三',
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
    date: '10.01 / 周四',
    kicker: '妆造 + 漫展',
    summary: '先妆造，再五人会合打车去漫展。',
    steps: [
      { time: '09:00', title: '三人到顺天宾馆化妆', detail: '周梓涛、钟茗睿、谭昭爵到湖南省植物园店。三人能否在 10:00 前完成妆造，需与妆娘确认。', place: 'makeup' },
      { time: '09:30', title: '杜屹浩到场集合', detail: '第五位同事的会合时间与位置待确认。', place: 'makeup' },
      { time: '10:00', title: '五人打车前往漫展', detail: '目的地为长沙国际会展中心。普通五座网约车只能载四位乘客；需约能载五位乘客的车，或分乘两车。', place: 'expo' },
      { time: '约 10:40–11:10', title: '规划抵达展馆入口', detail: '路网顺畅基线约 11 公里 / 13 分钟；国庆日预留 25–45 分钟行车和 15–25 分钟等车、落客、步行。实际入口以漫展通知为准。', place: 'expo' },
      { time: '全天', title: '参加漫展', detail: '结束后返回酒店；杜屹浩晚上还需取车。', place: 'expo' },
    ],
    assessment: 'expo',
  },
  {
    id: 'fangte',
    number: '03',
    name: '株洲方特',
    date: '10.02 / 周五',
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
    date: '10.03 / 周六',
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
    verdict: '顺天宾馆至长沙国际会展中心公开路网约 10.9 公里、13 分钟（不含拥堵）。10 月 1 日按行车 25–45 分钟，另加等车和进馆 15–25 分钟作规划；10:00 出发约 10:40–11:10 到入口。',
    rows: [
      ['普通五座车', '司机 + 4 名乘客，不够五人同行'],
      ['可行选择', '六/七座车型，或分乘两车'],
      ['出发前核对', '妆造结束时间、同事会合点和展会入口'],
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
  ['顺天宾馆（湖南省植物园店）地址', 'https://www.trip.com/hotels/changsha-hotel-detail-2155824/shuntian-hotel/'],
  ['高德地图：长沙国际会展中心地址', 'https://www.amap.com/place/B0FFHH2XRZ'],
  ['长沙国际会展中心 OSM 场馆范围', 'https://mapcarta.com/W798742626'],
  ['顺天宾馆至会展中心 OSRM 路线模型', 'https://router.project-osrm.org/route/v1/driving/113.017677,28.102947;113.07472,28.14654?overview=false&steps=false'],
  ['展馆网约车落客与入口参考', 'https://www.hnceia.com/newsinfo/7155574.html'],
  ['株洲方特欢乐世界官网', 'https://zhuzhou.fangte.com/adventure/'],
  ['高德地图 URI 搜索说明', 'https://developer.amap.com/api/uri-api/guide/search/search'],
  ['湖南省交通运输厅：CZ1 途经方特', 'https://jtt.hunan.gov.cn/xxgk/gzdt/szdt1/202110/t20211027_20891618.html'],
  ['国务院办公厅：2026 年国庆假期', 'https://www.gov.cn/zhengce/zhengceku/202511/content_7047091.htm'],
  ['OSRM 路线模型查询', 'https://router.project-osrm.org/route/v1/driving/112.9709227,28.1985991;113.1878504,27.9928467?overview=false'],
  ['OpenStreetMap 地图与版权', 'https://www.openstreetmap.org/copyright'],
];
