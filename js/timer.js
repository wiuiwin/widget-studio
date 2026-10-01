// 타이머 위젯 — 시계 엔진(createClock)에 '시간 값'만 바꿔 끼운다.
// 디자인(플립·솔리드·룰렛, 폰트, 테마, 워터마크)은 시계와 같다.
import { createClock, DEFAULTS as CLOCK_DEFAULTS } from './clock.js?v=11';
export { fromQuery } from './clock.js?v=11';

export const TIMER_DEFAULTS = {
  ...CLOCK_DEFAULTS,
  mode: 'count',     // count(카운트다운) | pomo(뽀모도로)
  target: '',        // 카운트다운 목표 'YYYY-MM-DDTHH:MM' (비우면 다음 새해)
  focus: '25',       // 뽀모도로 집중 (분)
  brk: '5',          // 뽀모도로 휴식 (분)
  caps: true,        // 일·시간·분·초 단위 표시
};

// 타이머에서 쓰는 디자인만 (아날로그는 제외)
export const TIMER_TYPES = ['flip', 'digital-solid', 'digital-roulette'];

const pad = n => String(n).padStart(2, '0');
const CAP = { dd: '일', hh: '시간', mm: '분', ss: '초' };

export function defaultTarget() {
  return `${new Date().getFullYear() + 1}-01-01T00:00`;
}

// ── 카운트다운 ─────────────────────────────────
function readCountdown(opts) {
  const end = new Date(opts.target || defaultTarget()).getTime();
  const left = Math.max(0, Math.floor(((Number.isFinite(end) ? end : 0) - Date.now()) / 1000));
  const d = Math.floor(left / 86400);
  const t = { dd: pad(d), hh: pad(Math.floor(left % 86400 / 3600)), mm: pad(Math.floor(left % 3600 / 60)), ss: pad(left % 60), ampm: '' };
  // 하루 넘게 남으면 '일' 칸을 앞에 붙인다
  t._keys = [...(d > 0 ? ['dd'] : []), 'hh', 'mm', ...(opts.seconds ? ['ss'] : [])];
  if (opts.caps) t._caps = t._keys.map(k => CAP[k]);
  return t;
}

// ── 뽀모도로 (상태는 브라우저에 저장 → 노션 페이지를 다시 열어도 이어짐) ──
const minutes = (opts, phase) => Math.min(180, Math.max(1, +(phase === 'focus' ? opts.focus : opts.brk) || 1)) * 60000;

function pomoStore(key) {
  let s = null;
  try { s = JSON.parse(localStorage.getItem(key)); } catch { /* 저장소 막힘 — 메모리로만 동작 */ }
  const save = () => { try { localStorage.setItem(key, JSON.stringify(s)); } catch { /* 무시 */ } };
  return {
    get(opts) {
      if (!s || !s.phase) s = { phase: 'focus', running: false, remain: minutes(opts, 'focus'), total: minutes(opts, 'focus') };
      // 멈춰 있고 아직 시작 전인데 설정 시간이 바뀌었으면 새 시간으로
      const dur = minutes(opts, s.phase);
      if (!s.running && s.remain === s.total && s.total !== dur) { s.remain = s.total = dur; save(); }
      if (s.running && s.endAt - Date.now() <= 0) {
        // 끝나면 다음 단계로 넘어가서 대기
        s.phase = s.phase === 'focus' ? 'break' : 'focus';
        s.running = false;
        s.remain = s.total = minutes(opts, s.phase);
        save();
      }
      return s;
    },
    left() { return s.running ? Math.max(0, s.endAt - Date.now()) : s.remain; },
    toggle() {
      if (s.running) { s.remain = Math.max(0, s.endAt - Date.now()); s.running = false; }
      else { s.endAt = Date.now() + s.remain; s.running = true; }
      save();
    },
    reset(opts) { s = { phase: 'focus', running: false, remain: minutes(opts, 'focus'), total: minutes(opts, 'focus') }; save(); },
    skip(opts) {
      const phase = s.phase === 'focus' ? 'break' : 'focus';
      s = { phase, running: false, remain: minutes(opts, phase), total: minutes(opts, phase) };
      save();
    },
  };
}

function pomoSource(storeKey) {
  const store = pomoStore(storeKey);
  return {
    read(opts) {
      store.get(opts);
      const left = Math.ceil(store.left() / 1000);
      const t = { mm: pad(Math.floor(left / 60)), ss: pad(left % 60), ampm: '', _keys: ['mm', 'ss'] };
      if (opts.caps) t._caps = ['분', '초'];
      return t;
    },
    extra(opts) {
      const box = document.createElement('div');
      box.className = 'tm-extra';
      box.innerHTML = `
        <span class="tm-phase"></span>
        <button class="tm-btn primary" data-act="toggle" title="시작/일시정지"></button>
        <button class="tm-btn" data-act="reset" title="처음부터">↺</button>
        <button class="tm-btn" data-act="skip" title="다음 단계">⏭</button>`;
      const phase = box.querySelector('.tm-phase');
      const play = box.querySelector('[data-act=toggle]');
      box.addEventListener('click', e => {
        const act = e.target.closest('[data-act]')?.dataset.act;
        if (act === 'toggle') store.toggle();
        if (act === 'reset') store.reset(opts);
        if (act === 'skip') store.skip(opts);
        paint();
      });
      const paint = () => {
        const s = store.get(opts);
        phase.textContent = s.phase === 'focus' ? '집중' : '휴식';
        play.textContent = s.running ? '❚❚' : '▶';
      };
      paint();
      return { el: box, px: 38, tick: paint };
    },
  };
}

const countSource = { read: readCountdown };

// storeKey: 뽀모도로 진행 상태를 저장할 이름 (위젯 주소마다 따로)
export function createTimer(root, initial = {}, storeKey = 'ws-pomo') {
  const opts = { ...TIMER_DEFAULTS, ...initial };
  let api = createClock(root, opts, opts.mode === 'pomo' ? pomoSource(storeKey) : countSource);
  // 모드가 바뀌면 시간 공급원도 바꿔야 하므로 새로 만든다
  return {
    get options() { return api.options; },
    update(next) {
      const o = { ...api.options, ...next };
      if (o.mode !== api.options.mode) {
        api.destroy();
        api = createClock(root, o, o.mode === 'pomo' ? pomoSource(storeKey) : countSource);
      } else {
        api.update(next);
      }
    },
    destroy() { api.destroy(); },
  };
}
