import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet.markercluster';
import 'leaflet.markercluster/dist/MarkerCluster.css';
import './styles.css';
import { trip, places, days, assessments, sources } from './data.js';

const app = document.querySelector('#app');
const placeById = new Map(places.map((place) => [place.id, place]));
const verifiedPlaces = places.filter((place) => place.status === 'verified' && Number.isFinite(place.lat) && Number.isFinite(place.lng));
const pendingPlaces = places.length - verifiedPlaces.length;
const pendingPlaceNames = places.filter((place) => place.status !== 'verified').map((place) => place.name);
const markers = new Map();
let map;
let clusterGroup;
let activeDay = days[0].id;
let selectedPlace = null;

const icon = (kind) => {
  const paths = {
    pin: '<path d="M12 21s7-5.1 7-11a7 7 0 1 0-14 0c0 5.9 7 11 7 11Z"/><circle cx="12" cy="10" r="2.5"/>',
    arrow: '<path d="M4 12h15m-6-6 6 6-6 6"/>',
    compass: '<circle cx="12" cy="12" r="9"/><path d="m15.6 8.4-2.2 5-5 2.2 2.2-5 5-2.2Z"/>',
    clock: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3.5 2"/>',
    spark: '<path d="m12 2 1.7 6.3L20 10l-6.3 1.7L12 18l-1.7-6.3L4 10l6.3-1.7L12 2Z"/><path d="m19 17 .5 1.5L21 19l-1.5.5L19 21l-.5-1.5L17 19l1.5-.5L19 17Z"/>',
    list: '<path d="M8 6h13M8 12h13M8 18h13"/><circle cx="4" cy="6" r="1"/><circle cx="4" cy="12" r="1"/><circle cx="4" cy="18" r="1"/>',
    car: '<path d="M5 16H3v-5l2-5h14l2 5v5h-2"/><path d="M5 16h14M6 11h12"/><circle cx="7" cy="17" r="1.5"/><circle cx="17" cy="17" r="1.5"/>',
  };
  return `<svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${paths[kind]}</svg>`;
};

function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, (character) => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
  })[character]);
}

function amapSearch(place) {
  const query = new URLSearchParams({
    keyword: place.search,
    city: place.city || '长沙',
    view: 'map',
    src: 'changsha-party-trip',
    callnative: '1',
  });
  return `https://uri.amap.com/search?${query.toString()}`;
}

function placeAction(place) {
  return place.status === 'verified'
    ? `<a class="nav-pill" href="${amapSearch(place)}" target="_blank" rel="noopener noreferrer" aria-label="在高德地图搜索${escapeHtml(place.name)}">高德搜索 ${icon('arrow')}</a>`
    : '<span class="pending-action">地址待确认</span>';
}

function renderPlace(place) {
  const verified = place.status === 'verified';
  return `<li class="place-card ${verified ? '' : 'is-pending'}" data-place-card="${place.id}">
    <div class="place-card__top">
      <span class="place-badge place-badge--${place.color}">${verified ? '已定位' : '待定位'}</span>
      <span class="place-index">${String(places.indexOf(place) + 1).padStart(2, '0')}</span>
    </div>
    <div class="place-card__body">
      ${verified ? `<button class="place-name" type="button" data-select-place="${place.id}" aria-label="在地图上查看${escapeHtml(place.name)}">${escapeHtml(place.name)}</button>` : `<strong class="place-name">${escapeHtml(place.name)}</strong>`}
      <p>${escapeHtml(place.subtitle)}</p>
      <span class="place-address">${icon('pin')}${escapeHtml(place.location)}</span>
    </div>
    ${placeAction(place)}
  </li>`;
}

function renderStep(step) {
  const place = step.place ? placeById.get(step.place) : null;
  const placeLink = place && place.status === 'verified'
    ? `<a href="${amapSearch(place)}" target="_blank" rel="noopener noreferrer">打开地点 ${icon('arrow')}</a>`
    : '';
  return `<li class="timeline-item">
    <time>${escapeHtml(step.time)}</time>
    <div class="timeline-dot" aria-hidden="true"></div>
    <div class="timeline-copy"><h3>${escapeHtml(step.title)}</h3><p>${escapeHtml(step.detail)}</p>${placeLink}</div>
  </li>`;
}

function renderAssessment(id) {
  const assessment = assessments[id];
  return `<div class="assessment-head"><span class="assessment-badge">${escapeHtml(assessment.badge)}</span><span class="eyebrow">TRAVEL CHECK</span></div>
    <h3 id="travel-heading">${escapeHtml(assessment.title)}</h3>
    <p class="assessment-verdict">${escapeHtml(assessment.verdict)}</p>
    <dl class="assessment-rows">${assessment.rows.map(([label, value]) => `<div><dt>${escapeHtml(label)}</dt><dd>${escapeHtml(value)}</dd></div>`).join('')}</dl>`;
}

app.innerHTML = `
  <header class="topbar">
    <a class="brand" href="#top" aria-label="长沙组队出发，返回顶部"><span class="brand-orbs" aria-hidden="true"><i></i><i></i><i></i></span><span>CHANGSHA<br><strong>PARTY QUEST</strong></span></a>
    <nav class="topnav" aria-label="页面导航"><a href="#map-section">探索地图</a><a href="#itinerary">每日任务</a><a href="#travel-check">交通判断</a></nav>
    <span class="topbar-count">${String(trip.people.length).padStart(2, '0')} / 组队中</span>
  </header>
  <main id="main">
    <section class="hero" id="top" aria-labelledby="hero-title">
      <div class="hero-bubbles" aria-hidden="true"><span></span><span></span><span></span></div>
      <div class="hero-copy"><p class="eyebrow hero-kicker">TEAM TRIP / CHANGSHA + ZHUZHOU</p><h1 id="hero-title">长沙<span>组队出发!</span></h1><p class="hero-description">${trip.people.length} 位队友，${days.length} 段行程。从集合点到方特，点地图上的已确认地点就能打开高德地图搜索。</p>
      <div class="hero-actions"><a class="primary-button" href="#map-section">开始看地图 ${icon('arrow')}</a><span class="date-chip">${icon('clock')}<span id="hero-date">${escapeHtml(trip.dateText)}</span></span></div></div>
      <div class="hero-ticket" aria-label="行程状态"><span class="ticket-top">TRIP STATUS <b>${String(verifiedPlaces.length).padStart(2, '0')} / ${String(places.length).padStart(2, '0')}</b></span><strong>${pendingPlaces ? '地点确认中' : '地点已就绪'}</strong><p>${pendingPlaces ? `${escapeHtml(pendingPlaceNames.join('、'))}的名称和地址待更新；其余地点已加入地图。` : '住宿、取物点、漫展、车站与方特均已加入地图；点图钉打开高德搜索。'}</p><span class="ticket-bottom">已定位 ${verifiedPlaces.length} 处 <i></i> 待确认 ${pendingPlaces} 处</span></div>
    </section>
    <section class="map-section content-wrap" id="map-section" aria-labelledby="map-heading">
      <div class="section-heading"><div><span class="eyebrow">01 / EXPLORE</span><h2 id="map-heading">地图先行，<em>地点一目了然</em></h2></div><p>点击已定位的地图标记，或使用地点卡上的导航按钮。</p></div>
      <div class="map-layout">
        <div class="map-frame">
          <div class="map-toolbar"><span class="map-title">${icon('compass')} 长沙 ⇄ 株洲</span><button class="map-reset" type="button" id="reset-map">查看全图</button></div>
          <div id="trip-map" role="region" aria-label="长沙与株洲方特交互地图，可缩放和拖动"></div>
          <div class="map-legend"><span><i class="legend-pin"></i> 点击图钉打开高德搜索</span><span>多个地点重叠时点数字圈放大</span></div>
        </div>
        <aside class="place-panel" aria-labelledby="place-heading"><div class="place-panel__heading"><div><span class="eyebrow">DESTINATIONS</span><h3 id="place-heading">冒险据点</h3></div><span class="place-counter">${verifiedPlaces.length} / ${places.length} 已定位</span></div><ul class="place-list">${places.map(renderPlace).join('')}</ul><p class="place-note">图钉为地点或站区约点。D 区只标小区范围；具体出入口、漫展馆号及乘车口以当天信息为准。</p></aside>
      </div>
    </section>
    <section class="journey-section" id="itinerary" aria-labelledby="journey-heading"><div class="content-wrap">
      <div class="section-heading"><div><span class="eyebrow">02 / THE PLAN</span><h2 id="journey-heading">每日任务，<em>按节奏来</em></h2></div><p id="date-note">${escapeHtml(trip.dateNote)}</p></div>
      <div class="day-tabs" role="tablist" aria-label="选择行程阶段">${days.map((day, index) => `<button type="button" id="tab-${day.id}" class="day-tab ${index === 0 ? 'is-active' : ''}" role="tab" aria-selected="${index === 0}" aria-controls="day-panel" tabindex="${index === 0 ? '0' : '-1'}" data-day="${day.id}"><span class="day-number">${day.number}</span><span><strong>${escapeHtml(day.name)}</strong><small>${escapeHtml(day.date)}</small></span></button>`).join('')}</div>
      <div class="journey-grid"><article class="day-panel" id="day-panel" role="tabpanel" aria-labelledby="tab-${days[0].id}" tabindex="0"></article><aside class="travel-card" id="travel-check" aria-labelledby="travel-heading"><div id="assessment-content"></div><a class="source-shortcut" href="#sources">查看估算依据 ${icon('arrow')}</a></aside></div>
    </div></section>
    <section class="closing-section content-wrap" aria-labelledby="closing-heading"><div class="closing-art" aria-hidden="true"><span class="orb-a"></span><span class="orb-b"></span><span class="orb-c"></span></div><div><span class="eyebrow">READY WHEN YOU ARE</span><h2 id="closing-heading">下一站，<br>一起出发！</h2><p>出发当天重新查看导航路况、漫展入场安排和方特营业公告。返程票确定后，再倒推最后一天的离店时间。</p><a class="primary-button" href="https://uri.amap.com/search?keyword=%E9%95%BF%E6%B2%99%E7%BE%8E%E9%A3%9F&city=%E9%95%BF%E6%B2%99&view=map&src=changsha-party-trip&callnative=1" target="_blank" rel="noopener noreferrer">搜索长沙美食 ${icon('arrow')}</a></div></section>
    <section class="sources-section content-wrap" id="sources" aria-labelledby="sources-heading"><details><summary><span id="sources-heading">资料与估算说明</span><span>更新于 ${trip.verifiedAt} · 点击展开</span></summary><div class="sources-content"><p>公路距离和时间来自非实时路网模型；节前和国庆时间区间是排程缓冲。高铁班次来自 10 月 2 日参考时刻，最终以 12306 购票结果为准。图钉为地点约点，入口以当天导航和活动通知为准。</p><ul>${sources.map(([label, url]) => `<li><a href="${url}" target="_blank" rel="noopener noreferrer">${escapeHtml(label)} ${icon('arrow')}</a></li>`).join('')}</ul></div></details></section>
  </main>
  <footer class="footer"><div class="content-wrap"><span>CHANGSHA PARTY QUEST</span><span>原创行程页面 · 地图 © OpenStreetMap contributors</span></div></footer>
`;

function renderDay(id) {
  const day = days.find((item) => item.id === id);
  activeDay = id;
  document.querySelectorAll('.day-tab').forEach((tab) => {
    const active = tab.dataset.day === id;
    tab.classList.toggle('is-active', active);
    tab.setAttribute('aria-selected', String(active));
    tab.tabIndex = active ? 0 : -1;
  });
  const panel = document.querySelector('#day-panel');
  panel.setAttribute('aria-labelledby', `tab-${id}`);
  panel.innerHTML = `<div class="day-panel__intro"><span class="day-panel__kicker">MISSION ${day.number} / ${escapeHtml(day.kicker)}</span><h3>${escapeHtml(day.name)}</h3><p>${escapeHtml(day.summary)}</p></div><ol class="timeline">${day.steps.map(renderStep).join('')}</ol>`;
  document.querySelector('#assessment-content').innerHTML = renderAssessment(day.assessment);
  document.querySelectorAll('.place-card').forEach((card) => card.classList.toggle('is-day-place', placeById.get(card.dataset.placeCard).days.includes(id)));
}

document.querySelectorAll('.day-tab').forEach((tab, index) => {
  tab.addEventListener('click', () => renderDay(tab.dataset.day));
  tab.addEventListener('keydown', (event) => {
    if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) return;
    event.preventDefault();
    const nextIndex = event.key === 'Home' ? 0 : event.key === 'End' ? days.length - 1 : (index + (event.key === 'ArrowRight' ? 1 : -1) + days.length) % days.length;
    const nextTab = document.querySelectorAll('.day-tab')[nextIndex];
    renderDay(nextTab.dataset.day);
    nextTab.focus();
  });
});

function highlightPlace(id) {
  selectedPlace = id;
  document.querySelectorAll('.place-card').forEach((card) => card.classList.toggle('is-selected', card.dataset.placeCard === id));
  for (const [markerId, marker] of markers) marker.getElement()?.classList.toggle('is-selected', markerId === id);
}

function focusPlace(id) {
  const place = placeById.get(id);
  if (!place || !Number.isFinite(place.lat)) return;
  const marker = markers.get(id);
  map.getContainer().scrollIntoView({ behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth', block: 'center' });
  clusterGroup.zoomToShowLayer(marker, () => {
    map.panTo([place.lat, place.lng]);
    highlightPlace(id);
  });
  highlightPlace(id);
}

document.querySelectorAll('[data-select-place]').forEach((button) => button.addEventListener('click', () => focusPlace(button.dataset.selectPlace)));

function setupMap() {
  map = L.map('trip-map', { zoomControl: false, scrollWheelZoom: false, tap: true });
  L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
    minZoom: 6,
    maxZoom: 18,
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
  }).addTo(map);
  L.control.zoom({ position: 'bottomright' }).addTo(map);
  clusterGroup = L.markerClusterGroup({
    maxClusterRadius: 54,
    showCoverageOnHover: false,
    iconCreateFunction: (cluster) => L.divIcon({
      className: 'quest-cluster-wrap',
      html: `<span class="quest-cluster" aria-label="${cluster.getChildCount()} 个地点，点击放大">${cluster.getChildCount()}</span>`,
      iconSize: [48, 48],
    }),
  }).addTo(map);

  verifiedPlaces.forEach((place) => {
    const marker = L.marker([place.lat, place.lng], {
      title: `${place.name}，点击在高德地图搜索`,
      alt: place.name,
      icon: L.divIcon({ className: 'quest-pin-wrap', html: `<span class="quest-pin quest-pin--${place.color}"><b>${places.indexOf(place) + 1}</b></span>`, iconSize: [46, 54], iconAnchor: [23, 48] }),
    });
    marker.bindTooltip(place.name, { direction: 'top', offset: [0, -40] });
    marker.on('click', () => {
      highlightPlace(place.id);
      window.open(amapSearch(place), '_blank', 'noopener,noreferrer');
    });
    markers.set(place.id, marker);
    clusterGroup.addLayer(marker);
  });

  resetMap();
  document.querySelector('#reset-map').addEventListener('click', resetMap);
}

function resetMap() {
  map.fitBounds(verifiedPlaces.map((place) => [place.lat, place.lng]), { padding: [48, 48], maxZoom: 11 });
  highlightPlace(null);
}

renderDay(activeDay);
setupMap();
