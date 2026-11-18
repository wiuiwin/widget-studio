import { pages, publishAudio } from './player-upload.js?v=2';

const form = document.querySelector('#player-settings');
const publish = document.querySelector('#player-publish');
const upload = document.querySelector('#player-upload');
const tokenInput = document.querySelector('#github-token');
const preview = document.querySelector('#player-preview');
const link = document.querySelector('#player-link');
const copy = document.querySelector('#player-copy');
const feedback = document.querySelector('#player-feedback');
const widget = new URL('../widgets/player.html', location.href);
let previewAudio;

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

function selectedTrack() {
  const file = form.elements.audio.files[0];
  const custom = form.elements.artwork.value === 'custom';
  const image = custom ? httpsURL(form.elements.image.value) : '';
  if (!file?.size || (custom && !image)) {
    feedback.textContent = '오디오 파일과 공개 HTTPS 이미지 주소를 확인해 주세요.';
    return null;
  }
  return { file, type: form.elements.type.value, image };
}

function playerURL(base, track, audio) {
  const url = new URL(base);
  url.search = new URLSearchParams({ type: track.type, audio });
  if (track.image) url.searchParams.set('image', track.image);
  return url.href;
}

form.addEventListener('input', () => {
  updateImageField();
  link.value = '';
  copy.disabled = true;
  const type = form.elements.type.value;
  if (!form.elements.audio.files.length) preview.src = new URL('?type=' + type, widget);
  feedback.textContent = '미리보기 적용을 누르면 선택한 파일을 재생할 수 있어요.';
});

form.addEventListener('submit', event => {
  event.preventDefault();
  const track = selectedTrack();
  if (!track) return;
  if (previewAudio) URL.revokeObjectURL(previewAudio);
  previewAudio = URL.createObjectURL(track.file);
  preview.src = playerURL(widget, track, previewAudio);
  feedback.textContent = '미리보기에서 재생 버튼을 눌러 주세요.';
});

publish.addEventListener('submit', async event => {
  event.preventDefault();
  if (upload.disabled || !form.reportValidity()) return;
  const track = selectedTrack();
  const token = tokenInput.value.trim();
  if (!track || !token) return;

  tokenInput.value = '';
  tokenInput.disabled = upload.disabled = true;
  const controls = [...form.elements].filter(control => !control.disabled);
  for (const control of controls) control.disabled = true;
  copy.disabled = true;
  link.value = '';
  try {
    const { audio, ready } = await publishAudio(track.file, token, message => { feedback.textContent = message; });
    link.value = playerURL(new URL('widgets/player.html', pages), track, audio);
    copy.disabled = false;
    feedback.textContent = ready
      ? '노션에서 /embed로 링크를 붙여넣으세요.'
      : '링크가 생성됐어요. GitHub Pages 배포가 끝나면 재생할 수 있어요.';
  } catch (error) {
    feedback.textContent = error instanceof TypeError || error.name === 'TimeoutError'
      ? 'GitHub 연결을 확인한 뒤 같은 파일로 다시 시도해 주세요.'
      : error.message;
  } finally {
    tokenInput.disabled = upload.disabled = false;
    for (const control of controls) control.disabled = false;
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
updateImageField();
