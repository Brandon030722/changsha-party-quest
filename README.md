# 长沙组队出发 · 行程地图

POPUCOM 灵感的原创行程网页。首页使用 Leaflet + OpenStreetMap 展示长沙与株洲方特；已确认的地图标记和地点卡可打开高德地图搜索。没有精确地址的酒店、顺天宾馆和漫展场馆保持“待定位”，避免导航至错误位置。

## 本地运行

```bash
npm ci
npm run dev
```

发布构建：`npm run build`。GitHub Pages 工作流在推送 `main` 后构建并发布 `dist/`。

## 更新行程

编辑 [`src/data.js`](src/data.js)：

- `trip`：年份、日期文案、人数和核查日期。
- `days`：四段行程的确切日期与时间。
- `places`：酒店、妆娘宾馆、漫展场馆的名称、地址、WGS84 坐标及高德搜索词。只有 `status: 'verified'` 的地点才会在地图上放置精确标记并启用导航。
- `assessments`：交通估算和判断。酒店/场馆定位后重新计算，再替换现有区间。

地图底图 © OpenStreetMap contributors，Leaflet 为 BSD-2-Clause 许可。网站的泡泡、样式和页面代码为原创实现，未使用游戏官方素材或标志。

交通资料与估算边界见 [`RESEARCH.md`](RESEARCH.md)。本仓库公开发布时，行程中的姓名和活动安排也会公开；如需要匿名展示，请在发布前修改 `src/data.js`。
