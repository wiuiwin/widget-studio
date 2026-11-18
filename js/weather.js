// 날씨·온도·습도·미세먼지 위젯 — 데이터는 Open-Meteo (무료, 키 없음)
// 디자인 공통 요소(테마·폰트·크기·그림자·다크모드·워터마크)는 시계와 같다.
import { DEFAULTS as CLOCK_DEFAULTS, ensureFont, fontStack, SIZE_SCALE, watermark, resolveColors } from './clock.js?v=16';
export { fromQuery } from './clock.js?v=16';

export const WEATHER_DEFAULTS = {
  ...CLOCK_DEFAULTS,
  kind: 'weather',   // weather | temp | humid | dust
  city: '서울',
  box: true,         // 카드 배경 (배경판 색)
  place: true,       // 지역 이름 표시
  range: true,       // 최고·최저
  feels: false,      // 체감온도
  humid: false,      // (날씨) 습도
  days: false,       // (날씨) 3일 예보
  layout: 'card',    // card | strip | grid | list
  pm25: true,        // (미세먼지) 초미세먼지도 같이
};

export const KINDS = {
  weather: '날씨',
  temp: '온도',
  humid: '습도',
  dust: '미세먼지',
};

// 지역 목록 — 지명 검색 API 가 한국 지명을 잘 못 찾아서 좌표를 직접 둔다
export const CITIES = {
  서울: [37.5665, 126.978], 부산: [35.1796, 129.0756], 인천: [37.4563, 126.7052], 대구: [35.8714, 128.6014],
  대전: [36.3504, 127.3845], 광주: [35.1595, 126.8526], 울산: [35.5384, 129.3114], 세종: [36.48, 127.289],
  수원: [37.2636, 127.0286], 성남: [37.42, 127.1267], 고양: [37.6584, 126.832], 용인: [37.2411, 127.1776],
  청주: [36.6424, 127.489], 천안: [36.8151, 127.1139], 전주: [35.8242, 127.148], 창원: [35.228, 128.6811],
  김해: [35.2285, 128.8894], 포항: [36.019, 129.3435], 경주: [35.8562, 129.2247], 안동: [36.5684, 128.7294],
  춘천: [37.8813, 127.7298], 원주: [37.3422, 127.9202], 강릉: [37.7519, 128.8761], 속초: [38.207, 128.5918],
  여수: [34.7604, 127.6622], 목포: [34.8118, 126.3922], 제주: [33.4996, 126.5312], 서귀포: [33.2541, 126.56],
  도쿄: [35.6762, 139.6503], 오사카: [34.6937, 135.5023], 뉴욕: [40.7128, -74.006], 런던: [51.5074, -0.1278], 파리: [48.8566, 2.3522],
};

// ── 데이터 ─────────────────────────────────────
const TTL = 15 * 60 * 1000; // 15분 — 노션에 여러 개 붙여도 API 를 아끼도록 캐시
const mem = new Map();

async function cached(key, url) {
  const hit = mem.get(key);
  if (hit && Date.now() - hit.t < TTL) return hit.data;
  try {
    const s = JSON.parse(localStorage.getItem(key));
    if (s && Date.now() - s.t < TTL) { mem.set(key, s); return s.data; }
  } catch { /* 저장소 막힘 */ }
  const res = await fetch(url);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const data = await res.json();
  const entry = { t: Date.now(), data };
  mem.set(key, entry);
  try { localStorage.setItem(key, JSON.stringify(entry)); } catch { /* 무시 */ }
  return data;
}

function coords(opts) {
  return CITIES[opts.city] || CITIES.서울;
}

async function loadWeather(opts) {
  const [lat, lon] = coords(opts);
  // models 를 지정하지 않으면 Open-Meteo 가 지역에 가장 맞는 모델을 고른다
  // (기상청 KMA 모델 kma_seamless 는 2026-10 기준 값이 비어 와서 기본값 사용)
  const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&timezone=auto`
    + '&current=temperature_2m,relative_humidity_2m,apparent_temperature,weather_code,is_day'
    + '&daily=weather_code,temperature_2m_max,temperature_2m_min&forecast_days=8';
  return cached(`ws-wx-8:${lat},${lon}`, url);
}

async function loadDust(opts) {
  const [lat, lon] = coords(opts);
  const url = `https://air-quality-api.open-meteo.com/v1/air-quality?latitude=${lat}&longitude=${lon}&timezone=auto&current=pm10,pm2_5`;
  return cached(`ws-aq:${lat},${lon}`, url);
}

// ── 날씨 코드(WMO) → 한국어·아이콘 ───────────────
function sky(code, isDay = 1) {
  if (code === 0) return [isDay ? '맑음' : '맑음', isDay ? 'sun' : 'moon'];
  if (code === 1 || code === 2) return [code === 1 ? '대체로 맑음' : '구름 조금', isDay ? 'partly' : 'cloud'];
  if (code === 3) return ['흐림', 'cloud'];
  if (code === 45 || code === 48) return ['안개', 'fog'];
  if (code >= 51 && code <= 57) return ['이슬비', 'rain'];
  if ((code >= 61 && code <= 67) || (code >= 80 && code <= 82)) return [code >= 80 ? '소나기' : '비', 'rain'];
  if ((code >= 71 && code <= 77) || code === 85 || code === 86) return ['눈', 'snow'];
  if (code >= 95) return ['뇌우', 'storm'];
  return ['-', 'cloud'];
}

const ICON_PATH = {
  sun: '<circle cx="12" cy="12" r="4.2"/><path d="M12 2.5v2.2M12 19.3v2.2M2.5 12h2.2M19.3 12h2.2M5.3 5.3l1.6 1.6M17.1 17.1l1.6 1.6M5.3 18.7l1.6-1.6M17.1 6.9l1.6-1.6"/>',
  moon: '<path d="M19.5 14.5A7.5 7.5 0 0 1 9.5 4.5a7.5 7.5 0 1 0 10 10z"/>',
  cloud: '<path d="M7 18.5h10a4 4 0 0 0 .6-7.95A5.5 5.5 0 0 0 7 11a3.75 3.75 0 0 0 0 7.5z"/>',
  partly: '<path d="M8.5 3.5v1.4M3.5 8.5h1.4M4.9 4.9l1 1M12.1 4.9l-1 1"/><path d="M5.7 11.4A3.5 3.5 0 0 1 11.6 7"/><path d="M9 20h8.5a3.5 3.5 0 0 0 .5-6.96A4.8 4.8 0 0 0 9 13.6 3.2 3.2 0 0 0 9 20z"/>',
  rain: '<path d="M7 15h10a4 4 0 0 0 .6-7.95A5.5 5.5 0 0 0 7 7.5a3.75 3.75 0 0 0 0 7.5z"/><path d="M8.5 18l-1 2.5M12.5 18l-1 2.5M16.5 18l-1 2.5"/>',
  snow: '<path d="M7 15h10a4 4 0 0 0 .6-7.95A5.5 5.5 0 0 0 7 7.5a3.75 3.75 0 0 0 0 7.5z"/><path d="M8 19h.01M12 20.5h.01M16 19h.01" stroke-width="2.6"/>',
  storm: '<path d="M7 14h10a4 4 0 0 0 .6-7.95A5.5 5.5 0 0 0 7 6.5a3.75 3.75 0 0 0 0 7.5z"/><path d="M12.5 15l-2 3.5h3l-2 3.5"/>',
  fog: '<path d="M4 9h16M6 13h12M4 17h16"/>',
};
const icon = name => `<svg class="wx-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round">${ICON_PATH[name]}</svg>`;

// 환경부 기준 등급 (㎍/㎥)
const GRADES = [['좋음', '#3b82f6'], ['보통', '#22c55e'], ['나쁨', '#f59e0b'], ['매우나쁨', '#ef4444']];
function grade(v, kind) {
  const cut = kind === 'pm25' ? [15, 35, 75] : [30, 80, 150];
  const i = v <= cut[0] ? 0 : v <= cut[1] ? 1 : v <= cut[2] ? 2 : 3;
  return { i, label: GRADES[i][0], color: GRADES[i][1] };
}

function humidState(h) {
  if (h < 30) return '매우 건조';
  if (h < 40) return '건조';
  if (h <= 60) return '쾌적';
  if (h <= 70) return '조금 습함';
  return '습함';
}

const r0 = n => Math.round(n);
const r1 = n => (Math.round(n * 10) / 10).toFixed(1);
const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

// ── 화면 (em 단위: 1em = 큰 숫자 크기) ──
function lines(arr) { return arr.filter(Boolean); }

const layouts = ['strip', 'grid', 'list'];
const weekday = new Intl.DateTimeFormat('ko-KR', { weekday: 'long', timeZone: 'UTC' });
const temperature = (value, unit = '°') => Number.isFinite(value) ? `${Math.round(value)}${unit}` : '–';

function dailyForecast(day, start, count) {
  return `<div class="wx-days">${day.time.slice(start, start + count).map((date, index) => {
    const i = start + index;
    const dayName = weekday.format(new Date(`${date}T00:00:00Z`));
    const name = i === 0 ? '오늘' : start === 0 ? dayName[0] : dayName;
    const [condition, symbol] = sky(day.weather_code[i]);
    return `<div><span>${name}</span><span class="wx-day-icon" role="img" aria-label="${condition}">${icon(symbol)}</span><b>${temperature(day.temperature_2m_max[i])}</b><i>${temperature(day.temperature_2m_min[i])}</i></div>`;
  }).join('')}</div>`;
}

function viewWeather(o, d) {
  const c = d.current, day = d.daily;
  const [label, ic] = sky(c.weather_code, c.is_day);
  const subs = lines([
    `${label}${o.place ? ` · ${esc(o.city)}` : ''}`,
    o.range && `최고 ${r0(day.temperature_2m_max[0])}° · 최저 ${r0(day.temperature_2m_min[0])}°`,
    (o.humid || o.feels) && lines([o.humid && `습도 ${r0(c.relative_humidity_2m)}%`, o.feels && `체감 ${r0(c.apparent_temperature)}°`]).join(' · '),
  ]);
  if (layouts.includes(o.layout)) {
    const location = o.place ? `<div class="wx-location"><strong>${esc(o.city)}</strong><span>현재 날씨</span></div>` : '';
    return { html: `<div class="wx-summary">${location}<span class="wx-ic">${icon(ic)}</span>
      <div><strong class="wx-current">${temperature(c.temperature_2m, ' °C')}</strong><div class="wx-condition">${label}</div></div>
      ${subs.length > 1 ? `<div class="wx-summary-details">${subs.slice(1).join('<br>')}</div>` : ''}</div>
      ${dailyForecast(day, 1, 7)}` };
  }
  const days = o.days ? dailyForecast(day, 0, 3) : '';
  return {
    html: `<div class="wx-main"><span class="wx-ic">${icon(ic)}</span><span class="wx-big">${r0(c.temperature_2m)}°</span></div>
      <div class="wx-sub">${subs.map(s => `<div>${s}</div>`).join('')}</div>${days}`,
  };
}

function viewTemp(o, d) {
  const c = d.current, day = d.daily;
  const subs = lines([
    lines([o.place && esc(o.city), o.feels && `체감 ${r1(c.apparent_temperature)}°`]).join(' · '),
    o.range && `최고 ${r0(day.temperature_2m_max[0])}° · 최저 ${r0(day.temperature_2m_min[0])}°`,
  ]);
  return {
    html: `<div class="wx-main"><span class="wx-big">${r1(c.temperature_2m)}<small>°C</small></span></div>
      <div class="wx-sub">${subs.map(s => `<div>${s}</div>`).join('')}</div>`,
  };
}

function viewHumid(o, d) {
  const h = r0(d.current.relative_humidity_2m);
  return {
    html: `<div class="wx-main"><span class="wx-big">${h}<small>%</small></span></div>
      <div class="wx-sub"><div class="wx-state">${humidState(h)}</div>${o.place ? `<div>${esc(o.city)} 습도</div>` : ''}</div>
      <div class="wx-bar"><i style="left:${Math.min(100, Math.max(0, h))}%"></i></div>`,
  };
}

function viewDust(o, a) {
  const pm10 = a.current.pm10, pm25 = a.current.pm2_5;
  const g10 = grade(pm10, 'pm10'), g25 = grade(pm25, 'pm25');
  const worst = o.pm25 && g25.i > g10.i ? g25 : g10;
  const row = (name, v, g) => `<div class="wx-pm"><span>${name}</span><b style="color:${g.color}">${g.label}</b><em>${r0(v)} ㎍/㎥</em></div>`;
  return {
    html: `<div class="wx-main"><span class="wx-dot" style="background:${worst.color}"></span><span class="wx-big wx-grade">${worst.label}</span></div>
      <div class="wx-sub">${o.place ? `<div>${esc(o.city)} 대기질</div>` : ''}</div>
      <div class="wx-pms">${row('미세먼지', pm10, g10)}${o.pm25 ? row('초미세먼지', pm25, g25) : ''}</div>`,
  };
}

const VIEWS = { weather: viewWeather, temp: viewTemp, humid: viewHumid, dust: viewDust };

// ── 위젯 ───────────────────────────────────────
const darkMQ = typeof matchMedia === 'function' ? matchMedia('(prefers-color-scheme: dark)') : null;

export function createWeather(root, initial = {}) {
  let opts = { ...WEATHER_DEFAULTS, ...initial };
  let timer = null, seq = 0;

  function frame() {
    const c = resolveColors(opts);
    const layout = opts.kind === 'weather' && layouts.includes(opts.layout) ? ` wx-layout-${opts.layout}` : '';
    root.className = `wx-root kind-${opts.kind}${layout}${opts.box ? ' has-box' : ''}${opts.shadow ? ' has-shadow' : ''}`;
    const st = root.style;
    st.setProperty('--main', c.main);
    st.setProperty('--sub', c.sub);
    st.setProperty('--accent', c.accent);
    st.setProperty('--text', c.text);
    ensureFont(opts.font);
    st.setProperty('--font', fontStack(opts.font));
    st.setProperty('--scale', SIZE_SCALE[opts.size] || 0.75);
    st.setProperty('--wmh', opts.wm ? '24px' : '0px');
    st.padding = opts.size === 'f' ? '0' : '5%';
    st.background = c.bg === 'transparent' ? 'transparent' : c.bg;
  }

  function paint(view, msg) {
    const face = document.createElement('div');
    face.className = 'wx-face';
    const card = document.createElement('div');
    card.className = 'wx-card';
    card.innerHTML = view
      ? view.html + (opts.label ? `<div class="wx-label">${esc(opts.label)}</div>` : '')
      : `<div class="wx-msg">${msg}</div>`;
    face.append(card);
    if (opts.wm) face.append(watermark());
    root.replaceChildren(face);
    fit(face, card);
    document.fonts?.ready.then(() => face.isConnected && fit(face, card)); // 웹폰트 로드 후 폭이 바뀜
  }

  // 내용 크기를 실제로 재서(1em = 100px 로 그려 봄) 박스에 맞춘다 — 폰트·옵션마다 폭이 달라서 추정보다 정확
  function fit(face, card) {
    face.style.fontSize = '100px';
    const r = card.getBoundingClientRect();
    face.style.fontSize = '';
    if (!r.width) return; // 아직 화면에 안 붙음
    root.style.setProperty('--w', (r.width / 100).toFixed(3));
    root.style.setProperty('--h', (r.height / 100).toFixed(3));
  }

  async function load() {
    const my = ++seq;
    try {
      const data = opts.kind === 'dust' ? await loadDust(opts) : await loadWeather(opts);
      if (my !== seq) return; // 그사이 설정이 바뀜
      paint(VIEWS[opts.kind](opts, data));
    } catch {
      if (my === seq) paint(null, '날씨 정보를 불러오지 못했어요');
    }
  }

  function build() {
    clearInterval(timer);
    frame();
    if (!root.firstChild) paint(null, '불러오는 중…');
    load();
    timer = setInterval(load, TTL);
  }

  const onScheme = () => opts.sync && build();
  darkMQ?.addEventListener('change', onScheme);
  build();

  return {
    get options() { return { ...opts }; },
    update(next) { opts = { ...opts, ...next }; build(); },
    destroy() { clearInterval(timer); darkMQ?.removeEventListener('change', onScheme); root.replaceChildren(); },
  };
}
