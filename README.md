# 长沙组队出发 · 行程地图

POPUCOM 灵感的原创行程网页。首页使用 Leaflet + OpenStreetMap 展示懒熊电竞酒店、保利麓谷林语 D 区、顺天宾馆、长沙国际会展中心、长沙南站、株洲西站和株洲方特欢乐世界。图钉和地点卡可打开高德地图搜索；住处只标 D 区小区范围。

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
- `places`：住宿、取物点、妆造点、场馆、车站与方特的名称、地址、WGS84 地点约点及高德搜索词。只有 `status: 'verified'` 且有坐标的地点才会在地图上放置标记并启用导航。
- `assessments`：交通估算和判断。车票、漫展入口或餐厅确定后更新对应路段。

地图底图 © OpenStreetMap contributors，Leaflet 为 BSD-2-Clause 许可。网站的泡泡、样式和页面代码为原创实现，未使用游戏官方素材或标志。

交通资料与估算边界见 [`RESEARCH.md`](RESEARCH.md)。本仓库公开发布时，行程中的姓名和活动安排也会公开；如需要匿名展示，请在发布前修改 `src/data.js`。
