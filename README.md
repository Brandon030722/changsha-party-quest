# 长沙组队出发 · 行程地图

POPUCOM 灵感的原创行程网页。首页使用 Leaflet 和随站点发布的 OpenStreetMap 数据衍生底图，展示网鱼电竞酒店（长沙汇金天虹店）、保利麓谷林语 D 区、顺天宾馆、长沙国际会展中心、长沙南站、株洲西站和株洲方特欢乐世界。默认底图与网页同源加载，无需访问第三方瓦片服务器；需要更多街道细节时可点“在线街道图”。点击图钉先看地点详情，再从弹窗按钮按坐标打开高德地图；地点卡也有直接定位入口。住处只标 D 区小区范围。

## 本地运行

```bash
npm ci
npm run dev
```

发布构建：`npm run build`。GitHub Pages 工作流在推送 `main` 后构建并发布 `dist/`。

## 手机离线页

`npm run build` 会从同一份 `src/data.js` 生成 [`public/offline.html`](public/offline.html)。它把行程、七个地点和可点击的示意地图写入单个 HTML 文件，不依赖外部脚本、字体或图片。点示意地图编号先跳到地点卡，再选择高德定位。联网首次打开 GitHub Pages 的 `/offline.html` 会注册只缓存此页的 Service Worker；后续能否在微信内离线打开，取决于微信对站点缓存的保留情况。将 HTML 文件保存到手机后，可尝试用支持本地 HTML 的浏览器打开；微信聊天中的 HTML 附件不能保证直接打开。高德定位和购票等外部链接需要联网。

## 更新行程

编辑 [`src/data.js`](src/data.js)：

- `trip`：年份、日期文案、人数和核查日期。
- `days`：四段行程的确切日期与时间；抵达日的 `tickets` 同时用于在线页和手机离线页。9 月 30 日两批去程已由行程成员确认出票，10 月 2 日车次仍为参考。
- `places`：住宿、取物点、妆造点、场馆、车站与方特的名称、地址和 WGS84 地点约点。只有 `status: 'verified'` 且有坐标的地点才会在地图上放置标记并启用高德定位。
- `assessments`：交通估算和判断。车票、漫展入口或餐厅确定后更新对应路段。

地图底图 © OpenStreetMap contributors，Leaflet 为 BSD-2-Clause 许可。网站的泡泡、样式和页面代码为原创实现，未使用游戏官方素材或标志。

本地底图的数据来源、许可和重建方法见 [`BASEMAP-DATA.md`](BASEMAP-DATA.md)。这张图用于查看区域与地点关系；路线、实时路况和精确出入口请用地点卡打开导航软件。

## 微信分享

主页和离线页已设置标题、描述和分享封面元数据。分享图见 [`public/share-card.png`](public/share-card.png)；可以在网页首页打开并长按保存的二维码海报见 [`public/share-poster.png`](public/share-poster.png)。海报适合直接发到微信聊天，扫码后打开主页。重新生成图片可运行 `python3 scripts/generate-share-art.py`（需 Pillow、ReportLab 和脚本指定的 macOS 字体）。

在微信内打开网页后，点右上角“··· → 发送给朋友”转发网页。微信对默认网页消息的卡片样式和抓取缓存有自己的规则，Open Graph 元数据只能尽量提供封面与摘要。按[微信官方 JS-SDK 文档](https://developers.weixin.qq.com/doc/service/guide/h5/jssdk)，若要可靠地指定好友卡片的标题、图片和文案，需要具备已认证服务号的分享接口权限、配置 JS 接口安全域名，并在服务端签发当前 URL 的 `wx.config` 签名。当前静态站没有这些接入条件，因此不能保证微信采用设计好的封面。需要稳定的视觉分享时，请发送二维码海报。

交通资料与估算边界见 [`RESEARCH.md`](RESEARCH.md)。本仓库公开发布时，行程中的姓名、车次、座位和活动安排也会公开；如需要匿名展示，请在发布前修改 `src/data.js`。
