import { pages, publishMedia } from './player-upload.js?v=3';

const form = document.querySelector('#player-settings');
const publish = document.querySelector('#player-publish');
const upload = document.querySelector('#player-upload');
const tokenInput = document.querySelector('#github-token');
const preview = document.querySelector('#player-preview');
const link = document.querySelector('#player-link');
const copy = document.querySelector('#player-copy');
const feedback = document.querySelector('#player-feedback');
const widget = new URL('../widgets/player.html', location.href);
const publicWidget = new URL('widgets/player.html', pages);
const params = new URLSearchParams(location.search);
let audio = httpsURL(params.get('audio'));
let image = httpsURL(params.get('image'));
let previewFiles = [];

function httpsURL(value) {
  try {
    const url = new URL(value);
    if (url.protocol === 'https:' && !url.username && !url.password) return url.href;
  } catch { /* 저장된 URL이 없음 */ }
  return '';
}

function playerURL(base, track, artwork) {
  const url = new URL(base);
  url.searchParams.set('type', form.elements.type.value);
  if (track) url.searchParams.set('audio', track);
  if (artwork) url.searchParams.set('image', artwork);
  return url;
}

function updateFields() {
  const custom = form.elements.artwork.value === 'custom';
  const audioFile = form.elements.audio.files[0];
  const imageFile = custom ? form.elements.image.files[0] : null;
  document.querySelector('#image-field').hidden = !custom;
  form.elements.image.disabled = !custom;
  form.elements.image.required = custom && !image;
  form.elements.audio.required = !audio;
  publish.hidden = !audioFile && !imageFile;
  link.value = audio && !audioFile && !imageFile && (!custom || image)
    ? playerURL(publicWidget, audio, custom ? image : '').href : '';
  copy.disabled = !link.value;
}

function showPreview() {
  for (const url of previewFiles) URL.revokeObjectURL(url);
  previewFiles = [];
  const objectURL = file => {
    const url = URL.createObjectURL(file);
    previewFiles.push(url);
    return url;
  };
  const audioFile = form.elements.audio.files[0];
  const imageFile = form.elements.image.files[0];
  const artwork = form.elements.artwork.value === 'custom'
    ? (imageFile ? objectURL(imageFile) : image) : '';
  const url = playerURL(widget, audioFile ? objectURL(audioFile) : audio, artwork);
  url.searchParams.set('preview', '1');
  preview.src = url.href;
}

form.addEventListener('submit', event => event.preventDefault());
form.addEventListener('change', () => {
  updateFields();
  showPreview();
  feedback.textContent = copy.disabled
    ? '미리보기에서 확인한 뒤 새 파일을 GitHub에 올리세요.'
    : '변경한 링크를 복사해 노션에서 교체하세요.';
});

publish.addEventListener('submit', async event => {
  event.preventDefault();
  if (upload.disabled || !form.reportValidity()) return;
  const audioFile = form.elements.audio.files[0];
  const imageFile = form.elements.artwork.value === 'custom' ? form.elements.image.files[0] : null;
  const token = tokenInput.value.trim();
  if ((!audioFile && !imageFile) || !token) return;

  tokenInput.value = '';
  tokenInput.disabled = upload.disabled = true;
  const controls = [...form.elements].filter(control => !control.disabled);
  for (const control of controls) control.disabled = true;
  const notify = message => { feedback.textContent = message; };
  try {
    let ready = true;
    if (imageFile) {
      const result = await publishMedia(imageFile, 'image', token, notify);
      image = result.url.href;
      form.elements.image.value = '';
      ready = result.ready;
    }
    if (audioFile) {
      const result = await publishMedia(audioFile, 'audio', token, notify);
      audio = result.url.href;
      form.elements.audio.value = '';
      ready = result.ready && ready;
    }
    showPreview();
    notify(ready ? '노션에서 /embed로 링크를 붙여넣으세요.' : '링크가 생성됐어요. GitHub Pages 배포가 끝나면 사용할 수 있어요.');
  } catch (error) {
    notify(error instanceof TypeError || error.name === 'TimeoutError'
      ? 'GitHub 연결을 확인한 뒤 같은 파일로 다시 시도해 주세요.'
      : error.message);
  } finally {
    tokenInput.disabled = upload.disabled = false;
    for (const control of controls) control.disabled = false;
    updateFields();
  }
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
form.elements.type.value = params.get('type') === 'cd' ? 'cd' : 'lp';
form.elements.artwork.value = image ? 'custom' : 'cover';
updateFields();
showPreview();
if (link.value) feedback.textContent = '설정을 바꾼 뒤 링크를 복사해 노션에서 교체하세요.';
