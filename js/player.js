import { loadCover } from './player-cover.js?v=1';

const params = new URLSearchParams(location.search);
const deck = document.querySelector('.deck');
const audio = document.querySelector('#music');
const play = document.querySelector('#play');
const seek = document.querySelector('#seek');
const time = document.querySelector('#time');
const status = document.querySelector('#media-status');
const art = document.querySelector('.disc-art');
deck.dataset.type = params.get('type') === 'cd' ? 'cd' : 'lp';

function mediaURL(name) {
  try {
    const url = new URL(params.get(name));
    if (name === 'audio' && url.protocol === 'blob:' && url.origin === location.origin) return url.href;
    if (url.protocol === 'https:' && !url.username && !url.password) return url.href;
  } catch { /* 미리보기에 파일이 아직 없음 */ }
  return '';
}

function showArt(url) {
  art.onload = () => { art.hidden = false; };
  art.onerror = () => {
    art.hidden = true;
    if (!audio.error) status.textContent = '커버 이미지를 불러오지 못했어요.';
  };
  art.src = url;
}

function setPlaying(playing) {
  deck.classList.toggle('is-playing', playing);
  play.textContent = playing ? 'Ⅱ' : '▶';
  play.setAttribute('aria-label', playing ? '일시정지' : '재생');
}

function refreshProgress() {
  const duration = audio.duration;
  const seekable = Number.isFinite(duration) && duration > 0;
  seek.disabled = !seekable;
  if (seekable) seek.value = Math.round(audio.currentTime / duration * 1000);
  const seconds = Math.floor(audio.currentTime);
  time.textContent = `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, '0')}`;
}

for (const event of ['timeupdate', 'durationchange', 'ended']) audio.addEventListener(event, refreshProgress);
for (const event of ['pause', 'ended', 'waiting']) audio.addEventListener(event, () => setPlaying(false));
audio.addEventListener('playing', () => setPlaying(true));
audio.addEventListener('error', () => {
  setPlaying(false);
  status.textContent = '오디오 파일을 열 수 없어요.';
});
play.addEventListener('click', async () => {
  if (!audio.paused) {
    audio.pause();
    return;
  }
  try {
    await audio.play();
    status.textContent = '';
  } catch {
    if (!audio.error && audio.paused) status.textContent = '재생할 수 없어요. 파일 주소를 확인해 주세요.';
  }
});
seek.addEventListener('input', () => {
  audio.currentTime = Number(seek.value) / 1000 * audio.duration;
  refreshProgress();
});

const source = mediaURL('audio');
const image = mediaURL('image');
if (image) showArt(image);
if (source) {
  audio.src = source;
  play.disabled = false;
  if (!image) {
    loadCover(source).then(cover => {
      if (!cover) return;
      const url = URL.createObjectURL(new Blob([cover.data], { type: cover.mime }));
      showArt(url);
      window.addEventListener('pagehide', event => {
        if (!event.persisted) URL.revokeObjectURL(url);
      });
    }).catch(() => { /* 커버 접근에 실패해도 오디오 재생 가능 */ });
  }
}
