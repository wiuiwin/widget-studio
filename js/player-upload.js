const repository = 'https://api.github.com/repos/wiuiwin/widget-studio/contents/';
export const pages = 'https://wiuiwin.github.io/widget-studio/';
const maxBytes = 20 * 1024 * 1024;
const extensions = /\.(mp3|m4a|aac|wav|ogg|opus|flac|webm)$/i;

function encodeFile(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result.split(',')[1]);
    reader.onerror = () => reject(new Error('오디오 파일을 읽을 수 없어요.'));
    reader.readAsDataURL(file);
  });
}

export async function publishAudio(file, token, onStatus) {
  const extension = file.name.match(extensions)?.[0].toLowerCase();
  if (!extension || !file.size || file.size > maxBytes) {
    throw new Error('지원하는 오디오 파일을 선택해 주세요. 최대 20MB까지 올릴 수 있어요.');
  }

  onStatus('파일을 확인하는 중이에요.');
  const bytes = new Uint8Array(await file.arrayBuffer());
  const digest = new Uint8Array(await crypto.subtle.digest('SHA-256', bytes));
  const hash = Array.from(digest, byte => byte.toString(16).padStart(2, '0')).join('');
  const path = `media/${hash}${extension}`;
  const audio = new URL(path, pages);
  const endpoint = repository + path;
  const isPublished = () => {
    const probe = new URL(audio);
    probe.searchParams.set('check', Date.now());
    return fetch(probe, { method: 'HEAD', cache: 'no-store', signal: AbortSignal.timeout(6000) })
      .then(response => response.ok, () => false);
  };
  if (await isPublished()) return { audio, ready: true };

  onStatus('GitHub에 오디오를 업로드하는 중이에요.');
  const response = await fetch(endpoint, {
    method: 'PUT',
    redirect: 'error',
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: 'application/vnd.github+json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ message: 'Add player audio', content: await encodeFile(file), branch: 'main' }),
    signal: AbortSignal.timeout(60000),
  });
  if (!response.ok) {
    // 요청이 이미 커밋됐거나 같은 파일을 다시 올린 경우에도 기존 경로를 재사용한다.
    const exists = [409, 422].includes(response.status) && await fetch(endpoint + '?ref=main', {
      method: 'HEAD', signal: AbortSignal.timeout(6000),
    }).then(result => result.ok, () => false);
    if (!exists) {
      if ([401, 403, 404].includes(response.status)) {
        throw new Error('GitHub 키의 유효기간과 저장소 Contents 쓰기 권한을 확인해 주세요.');
      }
      throw new Error(`GitHub 업로드에 실패했어요 (${response.status}).`);
    }
  }

  onStatus('업로드 완료. 공개 재생 주소가 열리기를 기다리는 중이에요.');
  for (let attempt = 0; attempt < 12; attempt++) {
    if (await isPublished()) return { audio, ready: true };
    await new Promise(resolve => setTimeout(resolve, 5000));
  }

  return { audio, ready: false };
}
