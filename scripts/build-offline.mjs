// Generate one dependency-free HTML file from the same itinerary data as the live site.
// The inline SVG is a geographic schematic, so it remains visible without map tiles.
// Run `node scripts/build-offline.mjs` after changing src/data.js.
import { mkdir, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';
import { trip, places, days, assessments, sources } from '../src/data.js';

const projectRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const output = resolve(projectRoot, 'public/offline.html');

function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, (character) => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
  })[character]);
}

function amapMarker(place) {
  const url = new URL('https://uri.amap.com/marker');
  url.search = new URLSearchParams({
    position: `${place.lng},${place.lat}`,
    name: place.name,
    coordinate: 'wgs84',
    src: 'changsha-party-trip-offline',
    callnative: '0',
  });
  return escapeHtml(url.href);
}

function safeSourceUrl(value) {
  const url = new URL(value);
  if (!['https:', 'http:'].includes(url.protocol)) throw new Error(`Unsupported source URL: ${value}`);
  return escapeHtml(url.href);
}

// Expanded city geometry preserves the relative directions of all seven real places.
// Exact road shapes and station entrances are deliberately not implied by this diagram.
const mapPositions = {
  hotel: { x: 145, y: 304, label: '酒店', lx: 145, ly: 339, anchor: 'middle' },
  home: { x: 58, y: 93, label: '取道具', lx: 93, ly: 99, anchor: 'start' },
  makeup: { x: 205, y: 255, label: '妆造', lx: 205, ly: 225, anchor: 'middle' },
  expo: { x: 304, y: 119, label: '漫展', lx: 303, ly: 83, anchor: 'middle' },
  changsha_south: { x: 284, y: 201, label: '长沙南', lx: 283, ly: 241, anchor: 'middle' },
  zhuzhou_west: { x: 116, y: 437, label: '株洲西', lx: 116, ly: 476, anchor: 'middle' },
  fangte: { x: 270, y: 373, label: '方特', lx: 270, ly: 410, anchor: 'middle' },
};

for (const place of places) {
  if (!mapPositions[place.id]) throw new Error(`Offline map is missing ${place.id}`);
}

function mapPin(place, index) {
  const point = mapPositions[place.id];
  const number = String(index + 1).padStart(2, '0');
  return `<a class="map-pin map-pin--${escapeHtml(place.color)}" href="#place-${escapeHtml(place.id)}" aria-label="查看${escapeHtml(place.name)}地点卡">
      <title>${escapeHtml(place.name)} · 点按查看地点详情</title>
      <circle class="pin-hit" cx="${point.x}" cy="${point.y}" r="26" />
      <circle class="pin-shadow" cx="${point.x + 3}" cy="${point.y + 4}" r="17" />
      <circle class="pin-dot" cx="${point.x}" cy="${point.y}" r="17" />
      <text class="pin-number" x="${point.x}" y="${point.y + 4}" text-anchor="middle">${number}</text>
      <text class="pin-label" x="${point.lx}" y="${point.ly}" text-anchor="${point.anchor}">${escapeHtml(point.label)}</text>
    </a>`;
}

const map = `<svg class="route-map" viewBox="0 0 360 520" role="img" aria-labelledby="map-title map-desc" xmlns="http://www.w3.org/2000/svg">
  <title id="map-title">长沙至株洲七处地点示意地图</title>
  <desc id="map-desc">北在上方。保利麓谷林语 D 区位于长沙西北；网鱼电竞酒店位于妆造点西南，长沙南站也在酒店东北。株洲方特位于株洲西站东北。点按编号可查看地点详情，再打开高德定位。</desc>
  <defs>
    <pattern id="map-dots" width="18" height="18" patternUnits="userSpaceOnUse"><circle cx="2" cy="2" r="1" fill="#bed3e4"/></pattern>
  </defs>
  <rect width="360" height="520" fill="#e7f2ff"/>
  <rect width="360" height="520" fill="url(#map-dots)"/>
  <path d="M0 20 C95 0 142 52 225 25 S310 13 360 38 V0 H0Z" fill="#dcebd8"/>
  <path d="M0 355 C100 305 184 364 244 312 S326 325 360 298 V520 H0Z" fill="#dbe9dc"/>
  <path d="M82 0 C114 93 92 142 116 221 S149 332 115 520" fill="none" stroke="#c4e1ec" stroke-width="24" opacity=".9"/>
  <path d="M82 0 C114 93 92 142 116 221 S149 332 115 520" fill="none" stroke="#eff9fb" stroke-width="9" opacity=".9"/>
  <g fill="none" stroke-linecap="round" stroke-linejoin="round">
    <path class="route-halo" d="M58 93 Q97 211 145 304 Q174 277 205 255 Q259 186 304 119 M145 304 Q229 264 284 201 Q235 316 116 437 Q206 396 270 373"/>
    <path class="route-local" d="M58 93 Q97 211 145 304 Q174 277 205 255 Q259 186 304 119 M145 304 Q229 264 284 201"/>
    <path class="route-rail" d="M284 201 Q235 316 116 437"/>
    <path class="route-transfer" d="M116 437 Q206 396 270 373"/>
  </g>
  <text x="19" y="47" class="city-label">长沙</text>
  <text x="20" y="65" class="city-sub">CHANGSHA</text>
  <text x="20" y="348" class="city-label">株洲</text>
  <text x="20" y="366" class="city-sub">ZHUZHOU</text>
  <text x="314" y="47" class="north-label">N ↑</text>
  ${places.map(mapPin).join('\n  ')}
  <text x="17" y="506" class="map-foot">方位示意 · 比例与道路不精确</text>
</svg>`;

function placeCard(place, index) {
  return `<li class="place-card" id="place-${escapeHtml(place.id)}">
    <span class="place-index place-index--${escapeHtml(place.color)}">${String(index + 1).padStart(2, '0')}</span>
    <div class="place-copy"><h3>${escapeHtml(place.name)}</h3><p>${escapeHtml(place.subtitle)}</p><address>${escapeHtml(place.location)}</address></div>
    <a class="nav-button" href="${amapMarker(place)}" aria-label="在高德地图定位${escapeHtml(place.name)}">高德定位 <span aria-hidden="true">↗</span></a>
  </li>`;
}

function stepItem(step) {
  const place = step.place ? places.find((item) => item.id === step.place) : null;
  return `<li class="step"><time>${escapeHtml(step.time)}</time><div class="step-body"><h4>${escapeHtml(step.title)}</h4><p>${escapeHtml(step.detail)}</p>${place ? `<a href="${amapMarker(place)}">高德定位：${escapeHtml(place.name)} ↗</a>` : ''}</div></li>`;
}

function daySection(day) {
  const check = assessments[day.assessment];
  return `<section class="day-card" id="day-${escapeHtml(day.id)}" aria-labelledby="day-heading-${escapeHtml(day.id)}">
    <div class="day-head"><span class="day-number">${escapeHtml(day.number)}</span><div><span class="eyebrow">${escapeHtml(day.date)} · ${escapeHtml(day.kicker)}</span><h3 id="day-heading-${escapeHtml(day.id)}">${escapeHtml(day.name)}</h3><p>${escapeHtml(day.summary)}</p></div></div>
    <ol class="steps">${day.steps.map(stepItem).join('')}</ol>
    <details class="travel-check"><summary><span>交通判断 · ${escapeHtml(check.badge)}</span><span aria-hidden="true">＋</span></summary><div><h4>${escapeHtml(check.title)}</h4><p>${escapeHtml(check.verdict)}</p><dl>${check.rows.map(([label, value]) => `<div><dt>${escapeHtml(label)}</dt><dd>${escapeHtml(value)}</dd></div>`).join('')}</dl></div></details>
  </section>`;
}

const css = `
:root{font-family:"PingFang SC","Microsoft YaHei",system-ui,sans-serif;color:#171b25;background:#fffdf4;-webkit-text-size-adjust:100%;text-rendering:optimizeLegibility}
*{box-sizing:border-box}html{scroll-behavior:smooth}body{margin:0;min-width:320px}a{color:inherit}button,a{-webkit-tap-highlight-color:transparent}:focus-visible{outline:3px solid #9c5200;outline-offset:4px}
.skip-link{position:absolute;left:12px;top:-80px;z-index:9;background:#fff;padding:10px;border:3px solid #171b25}.skip-link:focus{top:12px}
.site-head{background:#1c2230;color:#fffdf4;border-bottom:4px solid #171b25;background-image:radial-gradient(#ffffff30 1.2px,transparent 1.2px);background-size:12px 12px}.site-head-inner{max-width:1060px;margin:auto;min-height:60px;padding:10px 18px;display:flex;align-items:center;justify-content:space-between;gap:12px}.brand{font-size:.68rem;line-height:1;font-weight:1000;letter-spacing:.12em;text-decoration:none}.brand strong{display:block;font-size:.96rem;letter-spacing:.04em}.head-nav{display:flex;gap:12px}.head-nav a{font-size:.73rem;font-weight:850;text-decoration:none;white-space:nowrap}
main{max-width:1060px;margin:auto;padding:0 18px 64px}.eyebrow{font-size:.69rem;font-weight:1000;letter-spacing:.14em;line-height:1.4}.hero{position:relative;margin:22px 0 38px;padding:30px 24px;border:3px solid #171b25;border-radius:28px;background:#3994ff;box-shadow:7px 7px 0 #171b25;overflow:hidden}.hero:after{content:"";position:absolute;right:-40px;top:-42px;width:140px;height:140px;border:4px solid #171b25;border-radius:50%;background:#ffffff3b;pointer-events:none}.hero>*{position:relative;z-index:1}.hero-kicker{display:inline-block;margin:0 0 12px;padding:5px 10px;border:2px solid #171b25;border-radius:999px;background:#ffcc1a;box-shadow:3px 3px 0 #171b25}.hero h1{margin:0;color:#fffdf4;font-size:clamp(2.6rem,8vw,5rem);line-height:1.03;letter-spacing:-.04em;text-shadow:3px 3px 0 #171b25}.hero p.hero-description{max-width:650px;margin:14px 0 18px;font-size:.95rem;line-height:1.65;font-weight:700}.hero-meta{display:flex;flex-wrap:wrap;gap:8px}.hero-meta span{display:inline-flex;align-items:center;min-height:30px;padding:5px 10px;border:2px solid #171b25;border-radius:999px;background:#fffdf4;font-size:.72rem;font-weight:900}.hero-meta .offline{background:#ffcc1a}
.section-heading{margin:0 0 16px}.section-heading h2{margin:4px 0 8px;font-size:clamp(1.8rem,5vw,3rem);line-height:1.15;letter-spacing:-.04em}.section-heading h2 em{font-style:normal;color:#176fd3}.section-heading p{margin:0;max-width:650px;color:#4b5663;font-size:.83rem;line-height:1.55}
.map-section{scroll-margin-top:16px}.map-panel{border:3px solid #171b25;border-radius:25px;overflow:hidden;background:#e7f2ff;box-shadow:6px 6px 0 #171b25}.map-topline{display:flex;align-items:center;justify-content:space-between;gap:8px;padding:11px 14px;border-bottom:2px solid #171b25;background:#fffdf4;font-weight:900;font-size:.8rem}.map-topline small{font-size:.67rem;color:#47617a}.route-map{display:block;width:100%;height:auto;max-height:640px;margin:auto}.route-map .route-halo{stroke:#fff;stroke-width:13}.route-map .route-local{stroke:#ff9e42;stroke-width:3.5;stroke-dasharray:7 7}.route-map .route-rail{stroke:#275caa;stroke-width:4;stroke-dasharray:12 7}.route-map .route-transfer{stroke:#ff9e42;stroke-width:4;stroke-dasharray:5 7}.route-map .city-label{font-size:22px;font-weight:1000;fill:#20354c}.route-map .city-sub{font-size:8px;letter-spacing:2px;font-weight:900;fill:#56728c}.route-map .north-label{font-size:10px;font-weight:900;fill:#314e68}.route-map .map-foot{font-size:9px;font-weight:800;fill:#435b6c}.route-map .pin-hit{fill:transparent}.route-map .pin-shadow{fill:#171b25}.route-map .pin-dot{fill:#ffcc1a;stroke:#171b25;stroke-width:2.5}.route-map .map-pin--blue .pin-dot{fill:#3994ff}.route-map .map-pin--orange .pin-dot{fill:#ff9e42}.route-map .pin-number{font-size:10px;font-weight:1000;fill:#171b25;pointer-events:none}.route-map .pin-label{font-size:11px;font-weight:1000;fill:#20354c;paint-order:stroke;stroke:#e7f2ff;stroke-width:3px;pointer-events:none}.route-map a:focus-visible .pin-dot,.route-map a:hover .pin-dot{stroke:#934c00;stroke-width:4}
.map-legend{display:flex;flex-wrap:wrap;gap:8px;padding:10px 12px;background:#fffdf4;border-top:2px solid #171b25;font-size:.68rem;font-weight:800;line-height:1.45}.map-legend span{display:inline-flex;align-items:center;gap:5px}.key-line{width:15px;height:3px;display:inline-block;background:#275caa}.key-line.orange{background:#ff9e42}.offline-note{margin:13px 0 0;padding:11px 13px;border-left:4px solid #176fd3;background:#e7f2ff;font-size:.77rem;line-height:1.6;color:#344555}
.places-section{margin:38px 0 62px}.place-list{list-style:none;margin:0;padding:0;display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:12px}.place-card{display:grid;grid-template-columns:38px minmax(0,1fr);gap:0 10px;padding:14px;border:2px solid #171b25;border-radius:21px;background:white;min-width:0}.place-index{width:35px;height:35px;display:grid;place-items:center;border:2px solid #171b25;border-radius:50%;background:#ffcc1a;font-size:.73rem;font-weight:1000}.place-index--blue{background:#3994ff}.place-index--orange{background:#ff9e42}.place-copy{min-width:0}.place-copy h3{margin:0 0 4px;font-size:1rem;line-height:1.35;overflow-wrap:anywhere}.place-copy p,.place-copy address{margin:0;font-style:normal;color:#51606c;font-size:.73rem;line-height:1.5}.place-copy address{margin-top:4px}.nav-button{grid-column:2;justify-self:start;display:inline-flex;align-items:center;gap:10px;margin-top:10px;padding:7px 13px;border:2px solid #171b25;border-radius:999px;background:#ffcc1a;text-decoration:none;font-size:.75rem;font-weight:950;white-space:nowrap}.nav-button span{font-size:1rem;line-height:.7}.nav-button:hover{box-shadow:3px 3px 0 #171b25}
.journey-section{scroll-margin-top:16px}.day-jumps{display:flex;gap:7px;overflow:auto;scrollbar-width:thin;margin:0 0 18px;padding:4px 2px 8px}.day-jumps a{flex:none;display:inline-flex;align-items:center;min-height:38px;padding:7px 12px;border:2px solid #171b25;border-radius:999px;background:#fff;text-decoration:none;font-size:.77rem;font-weight:900}.day-jumps a:first-child{background:#ffcc1a}.day-card{scroll-margin-top:18px;margin:0 0 20px;padding:20px;border:3px solid #171b25;border-radius:25px;background:#fff;box-shadow:5px 5px 0 #171b25}.day-head{display:grid;grid-template-columns:44px minmax(0,1fr);gap:12px;padding-bottom:16px;border-bottom:2px dashed #bcc8d1}.day-number{width:42px;height:42px;display:grid;place-items:center;border:2px solid #171b25;border-radius:50%;background:#3994ff;font-size:.84rem;font-weight:1000}.day-head h3{margin:2px 0 3px;font-size:1.55rem;line-height:1.12}.day-head p{margin:0;color:#4b5663;font-size:.82rem;line-height:1.6}
.steps{list-style:none;margin:0;padding:12px 0 2px}.step{display:grid;grid-template-columns:87px minmax(0,1fr);gap:11px;padding:12px 0;border-bottom:1px solid #e3e9ed}.step:last-child{border-bottom:none}.step time{font-size:.77rem;line-height:1.45;font-weight:1000;color:#1c5d9b;overflow-wrap:anywhere}.step h4{margin:0 0 4px;font-size:.87rem;line-height:1.4}.step p{margin:0;color:#4d5966;font-size:.78rem;line-height:1.62}.step a{display:inline-block;margin-top:5px;color:#075bb4;font-size:.76rem;font-weight:850;text-underline-offset:2px}.travel-check{margin-top:16px;border:2px solid #171b25;border-radius:17px;background:#ffed9c;overflow:hidden}.travel-check summary{display:flex;justify-content:space-between;gap:10px;padding:12px 14px;font-size:.83rem;font-weight:1000;cursor:pointer;list-style:none}.travel-check summary::-webkit-details-marker{display:none}.travel-check[open] summary{border-bottom:2px solid #171b25}.travel-check[open] summary span:last-child{transform:rotate(45deg)}.travel-check>div{padding:12px 14px 16px}.travel-check h4{margin:0 0 7px;font-size:1rem}.travel-check p{margin:0;font-size:.79rem;line-height:1.65}.travel-check dl{margin:12px 0 0;border-top:1px solid #8d801c}.travel-check dl>div{display:grid;grid-template-columns:90px minmax(0,1fr);gap:6px;padding:6px 0;border-bottom:1px dashed #b19c31;font-size:.73rem;line-height:1.5}.travel-check dt{font-weight:950}.travel-check dd{margin:0}
.sources{margin-top:36px;border-top:2px solid #171b25;border-bottom:2px solid #171b25}.sources summary{display:flex;justify-content:space-between;gap:8px;cursor:pointer;padding:16px 0;font-weight:900;font-size:.88rem}.sources summary span:last-child{font-size:.75rem;color:#5d6873}.sources p{font-size:.77rem;line-height:1.6;color:#4b5663}.sources ul{columns:2;list-style:none;padding:0;margin:12px 0 18px}.sources li{break-inside:avoid;margin:0 0 7px;font-size:.76rem;line-height:1.45}.sources a{color:#075bb4}.site-foot{margin-top:48px;padding:24px 18px;background:#1c2230;color:#fffdf4;font-size:.73rem;text-align:center;line-height:1.5}
@media(max-width:600px){.site-head-inner{padding-inline:13px}.brand{font-size:.57rem}.brand strong{font-size:.77rem}.head-nav{gap:8px}.head-nav a{font-size:.68rem}main{padding:0 14px 48px}.hero{margin-top:15px;padding:24px 18px;border-radius:23px}.hero h1{font-size:clamp(2.35rem,12vw,3.6rem)}.hero p.hero-description{font-size:.84rem}.section-heading h2{font-size:1.85rem}.place-list{grid-template-columns:1fr}.day-card{padding:15px;border-radius:21px}.step{grid-template-columns:72px minmax(0,1fr);gap:8px}.sources ul{columns:1}.map-topline{font-size:.74rem}.map-topline small{font-size:.59rem}}
@media(max-width:350px){.head-nav a:last-child{display:none}.step{grid-template-columns:65px minmax(0,1fr)}}
@media(prefers-reduced-motion:reduce){html{scroll-behavior:auto}}
`;

const html = `<!doctype html>
<html lang="zh-CN" data-ark-theme="popucom" data-ark-depth="moderate">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">
  <meta name="theme-color" content="#3994ff">
  <meta name="description" content="长沙五人行程单文件离线版，含七处地点示意地图、四天行程与交通判断。">
  <link rel="canonical" href="https://brandon030722.github.io/changsha-party-quest/offline.html">
  <meta property="og:type" content="website">
  <meta property="og:locale" content="zh_CN">
  <meta property="og:title" content="长沙组队出发 · 手机离线行程">
  <meta property="og:description" content="五位队友，四天行程。七处地点、漫展与株洲方特安排，保存后离线可读。">
  <meta property="og:url" content="https://brandon030722.github.io/changsha-party-quest/offline.html">
  <meta property="og:image" content="https://brandon030722.github.io/changsha-party-quest/share-card.png">
  <meta property="og:image:type" content="image/png">
  <meta property="og:image:width" content="1200">
  <meta property="og:image:height" content="630">
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="长沙组队出发 · 手机离线行程">
  <meta name="twitter:description" content="四天行程、七处地点、交通判断，保存后离线可读。">
  <meta name="twitter:image" content="https://brandon030722.github.io/changsha-party-quest/share-card.png">
  <title>长沙组队出发 · 离线行程地图</title>
  <style>${css}</style>
</head>
<body>
  <a class="skip-link" href="#main">跳到行程内容</a>
  <header class="site-head"><div class="site-head-inner"><a class="brand" href="#main">CHANGSHA<strong>PARTY QUEST</strong></a><nav class="head-nav" aria-label="页面导航"><a href="#map">地图</a><a href="#places">地点</a><a href="#journey">行程</a></nav></div></header>
  <main id="main">
    <section class="hero" aria-labelledby="hero-title"><span class="eyebrow hero-kicker">TEAM TRIP / OFFLINE EDITION</span><h1 id="hero-title">长沙组队出发!</h1><p class="hero-description">五位队友，四天行程。地点和时间已保存在本文件；点地图编号先看地点卡，再选高德定位。</p><div class="hero-meta"><span>${escapeHtml(trip.dateText)}</span><span>7 / 7 地点</span><span class="offline">离线可读</span></div></section>
    <section class="map-section" id="map" aria-labelledby="map-heading"><div class="section-heading"><span class="eyebrow">01 / EXPLORE</span><h2 id="map-heading">地图先行，<em>地点一目了然</em></h2><p>地图采用方位示意；点编号先看地点卡，再选择高德定位。</p></div><div class="map-panel"><div class="map-topline"><span>长沙 ⇄ 株洲</span><small>七处地点 · 可点击</small></div>${map}<div class="map-legend"><span><i class="key-line"></i> 高铁</span><span><i class="key-line orange"></i> 市内 / 接驳</span><span>点编号先看地点卡</span></div></div><p class="offline-note">本页的文字和示意地图离线可看。打开高德定位、查看实时路况及购买车票时，需要联网。地图只标 D 区范围；具体入口、站台和路况以当天信息为准。</p></section>
    <section class="places-section" id="places" aria-labelledby="places-heading"><div class="section-heading"><span class="eyebrow">02 / DESTINATIONS</span><h2 id="places-heading">冒险据点</h2><p>定位按钮为大面积点击目标；如果微信拦截外部链接，可复制地点卡中的完整地址到高德地图。</p></div><ol class="place-list">${places.map(placeCard).join('')}</ol></section>
    <section class="journey-section" id="journey" aria-labelledby="journey-heading"><div class="section-heading"><span class="eyebrow">03 / THE PLAN</span><h2 id="journey-heading">每日任务，<em>按节奏来</em></h2><p>${escapeHtml(trip.dateNote)}</p></div><nav class="day-jumps" aria-label="跳转到某天">${days.map((day) => `<a href="#day-${escapeHtml(day.id)}">${escapeHtml(day.date)} ${escapeHtml(day.name)}</a>`).join('')}</nav>${days.map(daySection).join('')}</section>
    <details class="sources" id="sources"><summary><span>资料与估算说明</span><span>核查 ${escapeHtml(trip.verifiedAt)} · 展开</span></summary><p>公路时间为非实时路网基线，假期缓冲为规划估算。10 月 2 日高铁时刻仅供参考，最终以 12306 购票为准。示意地图不承担道路导航。</p><ul>${sources.map(([label, url]) => `<li><a href="${safeSourceUrl(url)}" target="_blank" rel="noopener noreferrer">${escapeHtml(label)} ↗</a></li>`).join('')}</ul></details>
  </main>
  <footer class="site-foot">CHANGSHA PARTY QUEST · 单文件离线行程<br>原创地图示意 · 导航链接需要网络</footer>
  <script>if(location.protocol==='https:'&&'serviceWorker'in navigator){navigator.serviceWorker.register('./offline-sw.js').catch(()=>{});}</script>
</body>
</html>
`;

await mkdir(dirname(output), { recursive: true });
await writeFile(output, html, 'utf8');
console.log(`Wrote ${output} (${Buffer.byteLength(html)} bytes)`);
