// 시계 위젯 렌더러 — 에디터 미리보기와 임베드 페이지가 같이 쓴다.
// 새 시계 종류는 RENDERERS 에 추가하고 CSS 에 .type-<이름> 스타일을 만들면 된다.

export const DEFAULTS = {
  type: 'flip',
  tz: 'local',
  h24: false,
  seconds: true,     // 디지털: 초 표시
  hand: true,        // 아날로그: 초침 표시
  marks: true,       // 아날로그: 시간 눈금
  date: false,
  tzLabel: false,
  label: '',
  inside: false,     // 솔리드: 날짜·시간대·라벨을 박스 안에
  size: 'm',         // s | m | l | f(꽉 차게)
  inpad: '18',       // 플립·솔리드: 카드/박스 안쪽 여백 0~40 (숫자 크기 대비 %)
  peek: '40',        // 룰렛: 위아래 숫자 보이는 정도 0~100
  align: 'center',   // left | center | right (플립 전용)
  font: 'default',   // FONTS 키 — 숫자·날짜·라벨 공통
  shadow: false,
  wm: true,          // 하단 워터마크
  sync: false,       // 다크모드 연동
  theme: 'dark',
  main: '#1d1d1f',
  sub: '#ffffff',
  accent: '#ff9f0a',
  text: '#1d1d1f',
  bg: 'transparent',
};

export const TYPES = {
  flip:               { label: '플립 시계',       kind: 'digital' },
  'digital-solid':    { label: '디지털 솔리드',   kind: 'digital' },
  'digital-roulette': { label: '디지털 룰렛',     kind: 'digital' },
  'analog-dots':      { label: '아날로그 도트',   kind: 'analog' },
  'analog-numbers':   { label: '아날로그 숫자',   kind: 'analog' },
  'analog-planets':   { label: '아날로그 행성',   kind: 'analog' },
  'analog-smooth':    { label: '아날로그 스무스', kind: 'analog' },
  'analog-tick':      { label: '아날로그 틱',     kind: 'analog' },
  'analog-trail':     { label: '아날로그 트레일', kind: 'analog' },
};

export const THEMES = {
  dark:       { label: '다크', main: '#1d1d1f', sub: '#ffffff', accent: '#ff9f0a', text: '#1d1d1f' },
  light:      { label: '라이트', main: '#f2f2f4', sub: '#1d1d1f', accent: '#ff3b30', text: '#1d1d1f' },
  graphite:   { label: '그래파이트', main: '#3a3a3c', sub: '#f5f5f7', accent: '#0a84ff', text: '#3a3a3c' },
  midnight:   { label: '미드나잇', main: '#000000', sub: '#ffffff', accent: '#ff375f', text: '#000000' },
  navy:       { label: '네이비', main: '#0b2545', sub: '#8ecae6', accent: '#ffb703', text: '#0b2545' },
  forest:     { label: '포레스트', main: '#1f3d2b', sub: '#e9f5db', accent: '#f4a259', text: '#1f3d2b' },
  coral:      { label: '코랄', main: '#ff6b5b', sub: '#ffffff', accent: '#1d1d1f', text: '#ff6b5b' },
  cream:      { label: '크림', main: '#f3e9d2', sub: '#6b4f3a', accent: '#c8553d', text: '#6b4f3a' },
  ocean:      { label: '오션', main: '#0077b6', sub: '#caf0f8', accent: '#ffd166', text: '#0077b6' },
  plum:       { label: '플럼', main: '#4a1942', sub: '#f7d6e0', accent: '#ffb4a2', text: '#4a1942' },
  wine:       { label: '와인', main: '#6d213c', sub: '#f6e7cb', accent: '#e9c46a', text: '#6d213c' },
  olive:      { label: '올리브', main: '#606c38', sub: '#fefae0', accent: '#dda15e', text: '#606c38' },
  terracotta: { label: '테라코타', main: '#bc6c25', sub: '#fefae0', accent: '#283618', text: '#bc6c25' },
  teal:       { label: '틸', main: '#2a9d8f', sub: '#ffffff', accent: '#e76f51', text: '#264653' },
  blush:      { label: '블러쉬', main: '#ffd6e0', sub: '#8a3b5c', accent: '#ff5d8f', text: '#8a3b5c' },
  lavender:   { label: '라벤더', main: '#e4dcf7', sub: '#4b3b8f', accent: '#7b61ff', text: '#4b3b8f' },
  mint:       { label: '민트', main: '#d8f3dc', sub: '#1b4332', accent: '#40916c', text: '#1b4332' },
  sky:        { label: '스카이', main: '#d7ecff', sub: '#1d4e89', accent: '#3a86ff', text: '#1d4e89' },
  butter:     { label: '버터', main: '#fff3b0', sub: '#6b4e16', accent: '#e09f3e', text: '#6b4e16' },
  peach:      { label: '피치', main: '#ffe5d9', sub: '#9d4b2f', accent: '#f28482', text: '#9d4b2f' },
  cobalt:     { label: '코발트', main: '#1d4ed8', sub: '#ffffff', accent: '#facc15', text: '#1d4ed8' },
  tomato:     { label: '토마토', main: '#e63946', sub: '#f1faee', accent: '#1d3557', text: '#e63946' },
  sunset:     { label: '선셋', main: '#ff7a00', sub: '#ffffff', accent: '#2b2d42', text: '#ff7a00' },
  violet:     { label: '바이올렛', main: '#6d28d9', sub: '#f5f3ff', accent: '#f472b6', text: '#6d28d9' },
  lime:       { label: '라임', main: '#c6f432', sub: '#1d1d1f', accent: '#7c3aed', text: '#1d1d1f' },
  neon:       { label: '네온', main: '#0f0f10', sub: '#39ff14', accent: '#ff2bd6', text: '#0f0f10' },
};

// 폰트 = 숫자용 라틴 폰트 + 한글 폰트 짝. 날짜 "9월 30일"도 숫자는 라틴, 한글은 한글 폰트로 그려진다.
// dw = 가장 넓은 숫자의 폭(em, 실측) — 카드·칸 너비 계산에 쓴다.
// g  = Google Fonts family 파라미터 (Pretendard 는 jsdelivr 로 항상 로드)
export const FONTS = {
  default:   { label: '기본',   latin: 'Inter',            ko: 'Pretendard',          dw: 0.646, g: ['Inter:wght@400;500;600;700'] },
  modern:    { label: '모던',   latin: 'Poppins',          ko: 'Pretendard',          dw: 0.635, g: ['Poppins:wght@400;500;600;700'] },
  condensed: { label: '콘덴스', latin: 'Oswald',           ko: 'Do Hyeon',            dw: 0.517, g: ['Oswald:wght@400;500;600;700', 'Do+Hyeon'] },
  impact:    { label: '임팩트', latin: 'Anton',            ko: 'Black Han Sans',      dw: 0.494, g: ['Anton', 'Black+Han+Sans'] },
  serif:     { label: '세리프', latin: 'DM Serif Display', ko: 'Noto Serif KR',       dw: 0.538, g: ['DM+Serif+Display', 'Noto+Serif+KR:wght@400;600;700'] },
  classic:   { label: '클래식', latin: 'Playfair Display', ko: 'Gowun Batang',        dw: 0.6,   g: ['Playfair+Display:wght@400;600;700', 'Gowun+Batang:wght@400;700'] },
  mono:      { label: '모노',   latin: 'JetBrains Mono',   ko: 'Nanum Gothic Coding', dw: 0.6,   g: ['JetBrains+Mono:wght@400;500;700', 'Nanum+Gothic+Coding:wght@400;700'] },
  pixel:     { label: '픽셀',   latin: 'VT323',            ko: 'Nanum Gothic Coding', dw: 0.4,   g: ['VT323', 'Nanum+Gothic+Coding:wght@400;700'] },
  future:    { label: '퓨처',   latin: 'Orbitron',         ko: 'Pretendard',          dw: 0.834, g: ['Orbitron:wght@400;600;700'] },
  round:     { label: '둥근',   latin: 'Jua',              ko: 'Jua',                 dw: 0.628, g: ['Jua'] },
  hand:      { label: '손글씨', latin: 'Gaegu',            ko: 'Gaegu',               dw: 0.61,  g: ['Gaegu:wght@400;700'] },
  pen:       { label: '펜글씨', latin: 'Nanum Pen Script', ko: 'Nanum Pen Script',    dw: 0.464, g: ['Nanum+Pen+Script'] },
};

export const fontStack = key => {
  const f = FONTS[key] || FONTS.default;
  return `'${f.latin}', '${f.ko}', 'Pretendard', -apple-system, sans-serif`;
};

// 쓰는 폰트만 불러온다 (노션 임베드 로딩 가볍게)
export function ensureFont(key) {
  const f = FONTS[key] || FONTS.default;
  const id = `gf-${key in FONTS ? key : 'default'}`;
  if (document.getElementById(id)) return;
  const link = document.createElement('link');
  link.id = id;
  link.rel = 'stylesheet';
  link.href = `https://fonts.googleapis.com/css2?${f.g.map(x => `family=${x}`).join('&')}&display=swap`;
  document.head.append(link);
}

const SIZE_SCALE = { s: 0.55, m: 0.75, l: 0.95, f: 1 };

// ── URL 쿼리 <-> 옵션 (임베드 링크용, 기본값과 같은 건 생략) ──
export function toQuery(opts) {
  const q = new URLSearchParams();
  for (const [k, v] of Object.entries(opts)) {
    if (k in DEFAULTS && v !== DEFAULTS[k]) q.set(k, typeof v === 'boolean' ? (v ? '1' : '0') : v);
  }
  return q.toString();
}

export function fromQuery(search) {
  const q = new URLSearchParams(search);
  const opts = { ...DEFAULTS };
  for (const k of Object.keys(DEFAULTS)) {
    if (!q.has(k)) continue;
    const v = q.get(k);
    opts[k] = typeof DEFAULTS[k] === 'boolean' ? v === '1' : v;
  }
  return opts;
}

// ── 시간 읽기 ─────────────────────────────────
const fmtCache = new Map();
function partsFmt(tz) {
  if (!fmtCache.has(tz)) {
    fmtCache.set(tz, new Intl.DateTimeFormat('en-US', {
      hour: 'numeric', minute: 'numeric', second: 'numeric', hourCycle: 'h23',
      ...(tz !== 'local' && { timeZone: tz }),
    }));
  }
  return fmtCache.get(tz);
}

function readNow(opts) {
  const now = new Date();
  const p = Object.fromEntries(partsFmt(opts.tz).formatToParts(now).map(x => [x.type, x.value]));
  const h = +p.hour % 24, m = +p.minute, s = +p.second, ms = now.getMilliseconds();
  const dh = opts.h24 ? h : (h % 12 || 12);
  const pad = n => String(n).padStart(2, '0');
  return {
    h, m, s, ms,
    hh: pad(dh), mm: pad(m), ss: pad(s),
    ampm: opts.h24 ? '' : (h < 12 ? 'AM' : 'PM'),
  };
}

function dateText(tz) {
  return new Intl.DateTimeFormat('ko-KR', {
    month: 'long', day: 'numeric', weekday: 'long',
    ...(tz !== 'local' && { timeZone: tz }),
  }).format(new Date());
}

function tzText(tz) {
  const zone = tz === 'local' ? Intl.DateTimeFormat().resolvedOptions().timeZone : tz;
  const off = new Intl.DateTimeFormat('en-US', { timeZone: zone, timeZoneName: 'shortOffset' })
    .formatToParts(new Date()).find(x => x.type === 'timeZoneName')?.value || '';
  return `${zone.replace(/_/g, ' ')} · ${off}`;
}

const el = (tag, cls, html) => {
  const e = document.createElement(tag);
  if (cls) e.className = cls;
  if (html != null) e.innerHTML = html;
  return e;
};

function digitKeys(opts) {
  return opts.seconds ? ['hh', 'mm', 'ss'] : ['hh', 'mm'];
}

// 안쪽 여백 (em)
const ip = opts => Math.min(40, Math.max(0, +opts.inpad || 0)) / 100;
const dw = opts => (FONTS[opts.font] || FONTS.default).dw;

function sepEl() { return el('div', 'clock-sep', '<i></i><i></i>'); }

// ── 디지털: 플립 ──────────────────────────────
function flipCard(value) {
  const card = el('div', 'fc-card', `
    <div class="fc-half fc-top"><span>${value}</span></div>
    <div class="fc-half fc-bottom"><span>${value}</span></div>`);
  card._value = value;
  return card;
}

function flipTo(card, value) {
  if (card._value === value) return;
  const old = card._value;
  card._value = value;
  card.querySelectorAll('.fc-flap').forEach(f => f.remove());
  card.querySelector('.fc-top span').textContent = value;   // 위: 새 값이 뒤에서 기다림
  card.querySelector('.fc-bottom span').textContent = old;  // 아래: 넘어오기 전까지 옛 값

  const flapTop = el('div', 'fc-half fc-top fc-flap', `<span>${old}</span>`);
  const flapBottom = el('div', 'fc-half fc-bottom fc-flap', `<span>${value}</span>`);
  flapBottom.addEventListener('animationend', () => {
    card.querySelector('.fc-bottom:not(.fc-flap) span').textContent = value;
    flapTop.remove();
    flapBottom.remove();
  });
  card.append(flapTop, flapBottom);
}

function buildFlip(opts, t) {
  const keys = digitKeys(opts);
  const row = el('div', 'clock-row');
  const cards = keys.map((k, i) => {
    if (i) row.append(sepEl());
    const c = flipCard(t[k]);
    row.append(c);
    return c;
  });
  const ampm = el('div', 'clock-ampm', t.ampm);
  if (t.ampm) row.append(ampm);
  return {
    el: row,
    w: keys.length * Math.max(dw(opts) * 1.72 + 0.08, 0.96 + 2 * ip(opts)) + (keys.length - 1) * 0.3 + (t.ampm ? 0.95 : 0),
    h: 1.04 + 2 * ip(opts),
    tick(t) {
      keys.forEach((k, i) => flipTo(cards[i], t[k]));
      ampm.textContent = t.ampm;
    },
  };
}

// ── 디지털: 솔리드 (한 판 위에 숫자) ──────────────
function buildSolid(opts, t) {
  const keys = digitKeys(opts);
  const row = el('div', 'clock-row');
  const cells = keys.map((k, i) => {
    if (i) row.append(sepEl());
    const d = el('div', 'clock-digits', t[k]);
    row.append(d);
    return d;
  });
  const ampm = el('div', 'clock-ampm', t.ampm);
  if (t.ampm) row.append(ampm);
  return {
    el: row,
    w: keys.length * (dw(opts) * 2 + 0.06) + (keys.length - 1) * 0.32 + (t.ampm ? 0.7 : 0) + 3.4 * ip(opts),
    h: 1.12 + 1.6 * ip(opts),
    tick(t) {
      keys.forEach((k, i) => { if (cells[i].textContent !== t[k]) cells[i].textContent = t[k]; });
      ampm.textContent = t.ampm;
    },
  };
}

// ── 디지털: 룰렛 (숫자가 세로로 굴러감) ──────────────
function buildRoulette(opts, t) {
  const keys = digitKeys(opts);
  const row = el('div', 'clock-row');
  const strips = [];
  keys.forEach((k, i) => {
    if (i) row.append(sepEl());
    for (let j = 0; j < 2; j++) {
      const strip = el('div', 'rl-strip',
        Array.from({ length: 10 }, (_, n) => `<span>${n}</span>`).join(''));
      const d = el('div', 'rl-digit');
      d.append(strip);
      row.append(d);
      strips.push({ k, j, strip });
    }
  });
  const ampm = el('div', 'clock-ampm', t.ampm);
  if (t.ampm) row.append(ampm);
  const tick = t => {
    for (const { k, j, strip } of strips) {
      strip.style.setProperty('--n', t[k][j]);
    }
    ampm.textContent = t.ampm;
  };
  tick(t);
  return {
    el: row,
    w: keys.length * (dw(opts) * 2 + 0.06) + (keys.length - 1) * 0.32 + (t.ampm ? 0.7 : 0),
    h: 1.7,
    tick,
  };
}

// ── 아날로그 공통 ─────────────────────────────
const NS = 'http://www.w3.org/2000/svg';
function svg(html) {
  const s = document.createElementNS(NS, 'svg');
  s.setAttribute('viewBox', '0 0 200 200');
  s.innerHTML = html;
  return s;
}
const polar = (deg, r) => {
  const a = (deg - 90) * Math.PI / 180;
  return [100 + r * Math.cos(a), 100 + r * Math.sin(a)].map(v => +v.toFixed(2));
};

function markersFor(type, opts) {
  let out = '';
  if (type === 'analog-numbers') {
    for (let i = 1; i <= 12; i++) {
      const [x, y] = polar(i * 30, 74);
      out += `<text x="${x}" y="${y}" class="an-num">${i}</text>`;
    }
    if (opts.marks) {
      for (let i = 0; i < 60; i++) {
        if (i % 5 === 0) continue;
        const [x, y] = polar(i * 6, 89);
        out += `<circle cx="${x}" cy="${y}" r="0.9" class="an-mark"/>`;
      }
    }
    return out;
  }
  if (!opts.marks) return out;
  if (type === 'analog-dots') {
    for (let i = 0; i < 12; i++) {
      const [x, y] = polar(i * 30, 82);
      out += `<circle cx="${x}" cy="${y}" r="${i % 3 ? 3.2 : 5.2}" class="an-mark"/>`;
    }
  } else if (type === 'analog-tick') {
    for (let i = 0; i < 60; i++) {
      const long = i % 5 === 0;
      const [x1, y1] = polar(i * 6, long ? 76 : 83);
      const [x2, y2] = polar(i * 6, 89);
      out += `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" class="an-mark" stroke-width="${long ? 3 : 1.2}"/>`;
    }
  } else if (type === 'analog-planets') {
    for (let i = 0; i < 12; i++) {
      const [x, y] = polar(i * 30, 90);
      out += `<circle cx="${x}" cy="${y}" r="1.4" class="an-mark"/>`;
    }
  } else {
    // smooth / trail — 12개의 짧은 눈금
    for (let i = 0; i < 12; i++) {
      const [x1, y1] = polar(i * 30, i % 3 ? 82 : 76);
      const [x2, y2] = polar(i * 30, 88);
      out += `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" class="an-mark" stroke-width="${i % 3 ? 2 : 3.5}"/>`;
    }
  }
  return out;
}

function handsFor(type) {
  if (type === 'analog-planets') {
    return `
      <circle cx="100" cy="100" r="38" class="orbit"/>
      <circle cx="100" cy="100" r="60" class="orbit"/>
      <circle cx="100" cy="100" r="80" class="orbit"/>
      <circle cx="100" cy="100" r="9" class="an-sub"/>
      <g data-hand="h"><circle cx="100" cy="62" r="8.5" class="an-sub"/></g>
      <g data-hand="m"><circle cx="100" cy="40" r="6" class="an-sub"/></g>
      <g data-hand="s"><circle cx="100" cy="20" r="4" class="an-accent"/></g>`;
  }
  return `
    <g data-hand="h"><line x1="100" y1="106" x2="100" y2="52" class="hand hand-h"/></g>
    <g data-hand="m"><line x1="100" y1="108" x2="100" y2="28" class="hand hand-m"/></g>
    <g data-hand="s"><line x1="100" y1="118" x2="100" y2="20" class="hand hand-s"/>
      <circle cx="100" cy="100" r="3.6" class="an-accent"/></g>
    <circle cx="100" cy="100" r="1.6" class="an-face"/>`;
}

function buildAnalog(opts) {
  const type = opts.type;
  const smooth = ['analog-smooth', 'analog-trail', 'analog-planets'].includes(type);
  const box = el('div', 'analog');
  box.append(svg(`<circle cx="100" cy="100" r="96" class="an-face"/>${markersFor(type, opts)}`));
  let trail;
  if (type === 'analog-trail' && opts.hand) {
    trail = el('div', 'an-trail');
    box.append(trail);
  }
  const hands = svg(handsFor(type));
  box.append(hands);
  const H = hands.querySelector('[data-hand=h]');
  const M = hands.querySelector('[data-hand=m]');
  const S = hands.querySelector('[data-hand=s]');
  if (!opts.hand) S.remove();

  // 틱 방식은 59→0 에서 거꾸로 돌지 않도록 각도를 누적한다
  const cum = { h: null, m: null, s: null };
  const rotate = (node, key, deg) => {
    if (cum[key] == null) cum[key] = deg;
    else cum[key] += ((deg - cum[key]) % 360 + 540) % 360 - 180;
    node.style.transform = `rotate(${cum[key]}deg)`;
  };

  return {
    el: box, w: 1, h: 1, smooth,
    tick(t) {
      const sec = t.s + (smooth ? t.ms / 1000 : 0);
      rotate(H, 'h', (t.h % 12) * 30 + t.m * 0.5 + (smooth ? sec / 120 : 0));
      rotate(M, 'm', t.m * 6 + (smooth ? sec / 10 : 0));
      if (opts.hand) {
        rotate(S, 's', sec * 6);
        if (trail) trail.style.transform = `rotate(${sec * 6}deg)`;
      }
    },
  };
}

const RENDERERS = {
  flip: buildFlip,
  'digital-solid': buildSolid,
  'digital-roulette': buildRoulette,
};

// ── 워터마크: 'Powered by' + 로고 이미지 (assets/logo.png — 로고 바뀌면 파일만 교체) ──
const WM_IMG = new URL('../assets/logo.png', import.meta.url).href;
const SITE_URL = new URL('../', import.meta.url).href;
function watermark() {
  const a = el('a', 'clock-wm');
  a.href = SITE_URL;
  a.target = '_blank';
  a.rel = 'noopener';
  a.title = '위젯 만들기';
  const img = new Image();
  img.src = WM_IMG;
  img.alt = 'Notionable';
  a.append(el('span', null, 'Powered by'), img);
  return a;
}

// ── 시계 ──────────────────────────────────────
const darkMQ = typeof matchMedia === 'function' ? matchMedia('(prefers-color-scheme: dark)') : null;

function resolveColors(opts) {
  let { main, sub, accent, text, bg } = opts;
  if (opts.sync && darkMQ?.matches) {
    [main, sub] = [sub, main];
    text = '#ebebeb';
    if (bg === '#ffffff') bg = '#191919';
  }
  return { main, sub, accent, text, bg };
}

export function createClock(root, initial = {}) {
  let opts = { ...DEFAULTS, ...initial };
  let clock, textEls = {}, timer = null, raf = null;

  function build() {
    stop();
    const t = readNow(opts);
    const kind = TYPES[opts.type]?.kind || 'digital';
    const c = resolveColors(opts);

    root.className = `clock-root kind-${kind} type-${opts.type}${opts.shadow ? ' has-shadow' : ''}`;
    const st = root.style;
    st.setProperty('--main', c.main);
    st.setProperty('--sub', c.sub);
    st.setProperty('--accent', c.accent);
    st.setProperty('--text', c.text);
    ensureFont(opts.font);
    st.setProperty('--font', fontStack(opts.font));
    st.setProperty('--dw', dw(opts));
    st.setProperty('--ip', `${ip(opts)}em`);
    // 아날로그는 조금 키우되 박스를 넘지 않게 1 로 제한
    st.setProperty('--scale', Math.min(1, (SIZE_SCALE[opts.size] || 0.75) * (kind === 'analog' ? 1.15 : 1)));
    st.setProperty('--align', opts.type === 'flip' ? opts.align : 'center');
    st.padding = opts.size === 'f' ? '0' : '5%';
    // 워터마크(시계 바로 아래, 고정 px) 높이만큼 시계 크기 계산에서 빼 둔다
    st.setProperty('--wmh', opts.wm ? '30px' : '0px');
    st.setProperty('--peek', Math.min(100, Math.max(0, +opts.peek || 0)) / 100 * 0.6);
    st.background = c.bg === 'transparent' ? 'transparent' : c.bg;

    clock = kind === 'analog' ? buildAnalog(opts) : RENDERERS[opts.type](opts, t);

    const text = el('div', 'clock-text');
    textEls = {
      date: opts.date && el('div', 'clock-date'),
      tz: opts.tzLabel && el('div', 'clock-tz', tzText(opts.tz)),
      label: opts.label && el('div', 'clock-label'),
    };
    if (textEls.label) textEls.label.textContent = opts.label;
    Object.values(textEls).forEach(e => e && text.append(e));
    const lines = text.childElementCount;

    // 가로/세로 중 빡빡한 쪽에 맞춰 글자(em) 크기 결정 — 텍스트 줄 높이 포함
    const lineH = kind === 'analog' ? 0.16 : 0.28;
    st.setProperty('--w', clock.w);
    st.setProperty('--h', clock.h + (lines ? 0.12 : 0) + lines * lineH);
    st.setProperty('--tsize', kind === 'analog' ? '0.105em' : '0.19em');

    const face = el('div', 'clock-face');
    if (opts.type === 'digital-solid' && opts.inside && lines) {
      // 솔리드 박스 안에 텍스트까지 넣기
      const board = el('div', 'solid-board');
      board.append(clock.el, text);
      face.append(board);
      root.classList.add('text-inside');
    } else {
      face.append(clock.el);
      if (lines) face.append(text);
    }
    if (opts.wm) face.append(watermark());
    root.replaceChildren(face);

    tick();
    if (clock.smooth) {
      const loop = () => { tick(); raf = requestAnimationFrame(loop); };
      raf = requestAnimationFrame(loop);
    } else {
      timer = setInterval(tick, 200);
    }
  }

  function tick() {
    clock.tick(readNow(opts));
    if (textEls.date) {
      const d = dateText(opts.tz);
      if (textEls.date.textContent !== d) textEls.date.textContent = d;
    }
  }

  function stop() {
    clearInterval(timer);
    cancelAnimationFrame(raf);
  }

  const onScheme = () => opts.sync && build();
  darkMQ?.addEventListener('change', onScheme);
  root.classList.add('clock-root');
  build();

  return {
    get options() { return { ...opts }; },
    update(next) {
      opts = { ...opts, ...next };
      build();
    },
    destroy() {
      stop();
      darkMQ?.removeEventListener('change', onScheme);
      root.replaceChildren();
    },
  };
}
