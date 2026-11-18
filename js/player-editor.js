const form = document.querySelector('#player-settings');
const preview = document.querySelector('#player-preview');
const link = document.querySelector('#player-link');
const copy = document.querySelector('#player-copy');
const feedback = document.querySelector('#player-feedback');
const widget = new URL('../widgets/player.html', location.href);

function httpsURL(value) {
  try {
    const url = new URL(value);
    if (url.protocol === 'https:' && !url.username && !url.password) return url.href;
  } catch { /* 주소 입력 중 */ }
  return '';
}

function updateImageField() {
  const custom = form.elements.artwork.value === 'custom';
  document.querySelector('#image-field').hidden = !custom;
  form.elements.image.disabled = !custom;
  form.elements.image.required = custom;
}

form.addEventListener('input', () => {
  updateImageField();
  link.value = '';
  copy.disabled = true;
  const type = form.elements.type.value;
  if (!form.elements.audio.value) preview.src = new URL('?type=' + type, widget);
  feedback.textContent = '미리보기 적용을 누르면 새 링크가 생성돼요.';
});

form.addEventListener('submit', event => {
  event.preventDefault();
  const values = new FormData(form);
  const audio = httpsURL(values.get('audio'));
  const custom = values.get('artwork') === 'custom';
  const image = custom ? httpsURL(values.get('image')) : '';
  if (!audio || (custom && !image)) {
    feedback.textContent = '오디오와 이미지에는 공개 HTTPS 파일 주소를 넣어 주세요.';
    return;
  }
  const url = new URL(widget);
  url.search = new URLSearchParams({ type: values.get('type'), audio });
  if (image) url.searchParams.set('image', image);
  preview.src = url.href;
  if (['localhost', '127.0.0.1', '[::1]'].includes(url.hostname)) {
    url.href = new URL('widgets/player.html' + url.search, 'https://wiuiwin.github.io/widget-studio/');
  }
  link.value = url.href;
  copy.disabled = false;
  feedback.textContent = '노션에서 /embed로 붙여넣으세요.';
});

copy.addEventListener('click', async () => {
  try {
    await navigator.clipboard.writeText(link.value);
    feedback.textContent = '링크를 복사했어요.';
  } catch {
    link.select();
    feedback.textContent = 'Ctrl+C로 링크를 복사하세요.';
  }
});
link.addEventListener('focus', () => link.select());
updateImageField();
