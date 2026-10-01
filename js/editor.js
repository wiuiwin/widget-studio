import { createClock, DEFAULTS, THEMES, TYPES, FONTS, fontStack, ensureFont, toQuery } from './clock.js?v=9';

// 노션에 붙일 공개 주소 (GitHub Pages)
const PUBLIC_URL = 'https://wiuiwin.github.io/widget-studio/';
// 이 사이트의 루트 (js/ 의 한 단계 위) — 에디터가 어느 폴더에 있든 같은 임베드 주소
const SITE_ROOT = new URL('../', import.meta.url).href;

const $ = (s, el = document) => el.querySelector(s);
const $$ = (s, el = document) => [...el.querySelectorAll(s)];

// 시계 종류 드롭다운 (디지털 / 아날로그 그룹)
const typeSelect = $('select[data-opt=type]');
for (const [kind, name] of [['digital', '디지털'], ['analog', '아날로그']]) {
  const g = document.createElement('optgroup');
  g.label = name;
  for (const [value, t] of Object.entries(TYPES)) {
    if (t.kind === kind) g.append(new Option(t.label, value));
  }
  typeSelect.append(g);
}

// 테마 스와치
const swatchBox = $('.swatches');
for (const [name, c] of Object.entries(THEMES)) {
  const b = document.createElement('button');
  b.value = name;
  b.title = c.label;
  b.style.setProperty('--a', c.main);
  b.style.setProperty('--b', c.sub);
  swatchBox.append(b);
}

// 폰트 타일 — 숫자와 한글을 같이 보여준다 (미리보기용으로 전 폰트 로드)
const fontBox = $('.font-tiles');
for (const [key, f] of Object.entries(FONTS)) {
  ensureFont(key);
  const b = document.createElement('button');
  b.value = key;
  b.innerHTML = `<b></b>${f.label}`;
  b.firstChild.textContent = '12가';
  b.firstChild.style.fontFamily = fontStack(key);
  fontBox.append(b);
}

// 두 줄(12개)만 보이다가 '더보기'로 전체 펼침
const SHOWN = 12;
const moreBtn = $('#theme-more');
const hiddenCount = Object.keys(THEMES).length - SHOWN;
let themesOpen = false;
function renderMore() {
  swatchBox.classList.toggle('collapsed', !themesOpen);
  moreBtn.textContent = themesOpen ? '접기 ▴' : `테마 ${hiddenCount}개 더보기 ▾`;
}
moreBtn.addEventListener('click', () => { themesOpen = !themesOpen; renderMore(); });

const clock = createClock($('#clock'), DEFAULTS);

function set(patch) {
  clock.update(patch);
  sync();
}

const pickTheme = name => {
  const { label, ...colors } = THEMES[name];
  return { theme: name, ...colors };
};

// 컨트롤 → 옵션
$$('select[data-opt]').forEach(el =>
  el.addEventListener('change', () => set({ [el.dataset.opt]: el.value })));

$$('input[type=range][data-opt]').forEach(el =>
  el.addEventListener('input', () => set({ [el.dataset.opt]: el.value })));

$$('input[type=checkbox][data-opt]').forEach(el =>
  el.addEventListener('change', () => set({ [el.dataset.opt]: el.checked })));

$$('.segmented, .font-tiles, .swatches').forEach(group =>
  group.addEventListener('click', e => {
    const btn = e.target.closest('button');
    if (!btn) return;
    const key = group.dataset.opt;
    set(key === 'theme' ? pickTheme(btn.value) : { [key]: btn.value });
  }));

$$('input[data-color]').forEach(el =>
  el.addEventListener('input', () => set({ theme: 'custom', [el.dataset.color]: el.value })));

// 라벨: 토글을 켜면 입력칸이 나온다
const labelOn = $('#label-on');
const labelText = $('#label-text');
labelOn.addEventListener('change', () => {
  labelText.hidden = !labelOn.checked;
  if (labelOn.checked) labelText.focus();
  set({ label: labelOn.checked ? labelText.value : '' });
});
labelText.addEventListener('input', () => set({ label: labelText.value }));

// 옵션 → 컨트롤 표시 + 임베드 링크
function sync() {
  const o = clock.options;
  const kind = TYPES[o.type].kind;

  $$('select[data-opt]').forEach(el => (el.value = o[el.dataset.opt]));
  $$('input[type=checkbox][data-opt]').forEach(el => (el.checked = o[el.dataset.opt]));
  $$('[data-opt] > button').forEach(b =>
    b.classList.toggle('on', o[b.parentElement.dataset.opt] === b.value));
  $$('input[data-color]').forEach(el => (el.value = o[el.dataset.color]));
  $('#font-name').textContent = FONTS[o.font]?.label || '';
  $('#theme-name').textContent = THEMES[o.theme]?.label || '직접 선택';
  // 접힌 영역의 테마가 선택돼 있으면 펼쳐 둔다
  if (Object.keys(THEMES).indexOf(o.theme) >= SHOWN && !themesOpen) { themesOpen = true; renderMore(); }
  $$('input[type=range][data-opt]').forEach(el => (el.value = o[el.dataset.opt]));
  $('#inpad-val').textContent = o.inpad;
  $('#inpad-label').textContent = o.type === 'flip' ? '카드 안쪽 여백' : '박스 안쪽 여백';
  $('#peek-val').textContent = `${o.peek}%`;

  // 종류에 따라 해당 옵션만 보이기 (Indify 와 동일)
  const visible = { digital: kind === 'digital', analog: kind === 'analog', flip: o.type === 'flip', solid: o.type === 'digital-solid',
    padded: o.type === 'flip' || o.type === 'digital-solid', roulette: o.type === 'digital-roulette' };
  $$('[data-show]').forEach(el => (el.hidden = !visible[el.dataset.show]));

  // 색상 이름도 종류에 맞게
  $('#c-main').textContent = kind === 'analog' ? '문자판' : o.type === 'digital-roulette' ? '숫자' : '배경판';
  $('#c-sub').textContent = kind === 'analog' ? '바늘' : o.type === 'digital-roulette' ? '보조' : '숫자';

  // 로컬(localhost)에서 열어도 노션에 붙일 수 있는 공개 주소로 만든다
  const base = /^(localhost|127\.0\.0\.1)$/.test(location.hostname) ? PUBLIC_URL : SITE_ROOT;
  const url = new URL('widgets/clock.html', base);
  url.search = toQuery(o);
  $('#embed-url').value = url.href;
}

// 클립보드 API 가 막힌 환경(앱 내장 브라우저 등)에서는 execCommand 로 복사한다
function copyBySelection(input) {
  input.focus();
  input.setSelectionRange(0, input.value.length);
  try { return document.execCommand('copy'); } catch { return false; }
}

$('#copy').addEventListener('click', async () => {
  const btn = $('#copy');
  const input = $('#embed-url');
  let ok = false;
  try {
    await navigator.clipboard.writeText(input.value);
    ok = true;
  } catch {
    ok = copyBySelection(input);
  }
  // 둘 다 실패하면 전체 선택만 해 두고 직접 복사하도록 안내
  if (!ok) input.setSelectionRange(0, input.value.length);
  btn.textContent = ok ? '복사됨' : 'Ctrl+C';
  setTimeout(() => (btn.textContent = '복사'), 1400);
});

// 주소칸을 누르면 전체 선택 (일부만 잡혀 잘린 주소가 복사되는 것 방지)
$('#embed-url').addEventListener('focus', e => e.target.select());

// 미리보기 프레임 크기 표시
new ResizeObserver(([e]) => {
  const { width, height } = e.contentRect;
  $('#frame-size').textContent = `${Math.round(width)} × ${Math.round(height)}`;
}).observe($('#frame'));

renderMore();
sync();
