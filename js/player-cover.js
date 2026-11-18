const MAX_TAG_SIZE = 2 * 1024 * 1024;
const decoder = new TextDecoder();
const syncSize = (bytes, start) => bytes.subarray(start, start + 4)
  .reduce((size, byte) => size * 128 + (byte & 127), 0);

function picture(frame) {
  const encoding = frame[0];
  const mimeEnd = frame.indexOf(0, 1);
  if (mimeEnd < 0 || encoding > 3) return null;
  const mime = decoder.decode(frame.subarray(1, mimeEnd)).toLowerCase();
  if (!['image/jpeg', 'image/jpg', 'image/png', 'image/webp'].includes(mime)) return null;
  const wide = encoding === 1 || encoding === 2;
  const step = wide ? 2 : 1;
  for (let end = mimeEnd + 2; end + step < frame.length; end += step) {
    if (frame[end] === 0 && (!wide || frame[end + 1] === 0)) {
      return { mime, data: frame.subarray(end + step), front: frame[mimeEnd + 1] === 3 };
    }
  }
  return null;
}

export function readID3Cover(bytes) {
  const version = bytes[3];
  if (bytes.length < 10 || decoder.decode(bytes.subarray(0, 3)) !== 'ID3'
      || ![3, 4].includes(version) || (bytes[5] & 0x80)) return null;
  const limit = Math.min(bytes.length, 10 + syncSize(bytes, 6));
  const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
  let start = 10;
  if (bytes[5] & 0x40) {
    if (limit < 14) return null;
    start += version === 4 ? syncSize(bytes, 10) : 4 + view.getUint32(10);
  }
  let fallback = null;
  while (start + 10 <= limit) {
    const name = decoder.decode(bytes.subarray(start, start + 4));
    const size = version === 4 ? syncSize(bytes, start + 4) : view.getUint32(start + 4);
    const end = start + 10 + size;
    if (!size || end > limit) break;
    if (name === 'APIC' && bytes[start + 9] === 0) {
      const cover = picture(bytes.subarray(start + 10, end));
      if (cover?.front) return cover;
      fallback ||= cover;
    }
    start = end;
  }
  return fallback;
}

export async function loadCover(url) {
  const response = await fetch(url, { headers: { Range: `bytes=0-${MAX_TAG_SIZE - 1}` } });
  if (!response.ok || !response.body) return null;
  const reader = response.body.getReader();
  const bytes = new Uint8Array(MAX_TAG_SIZE);
  let length = 0;
  let needed = 10;
  try {
    while (length < needed) {
      const { value, done } = await reader.read();
      if (done) break;
      const chunk = value.subarray(0, bytes.length - length);
      bytes.set(chunk, length);
      length += chunk.length;
      if (length >= 10) {
        if (decoder.decode(bytes.subarray(0, 3)) !== 'ID3') return null;
        needed = Math.min(bytes.length, 10 + syncSize(bytes, 6));
      }
    }
  } finally {
    await reader.cancel().catch(() => {});
  }
  return readID3Cover(bytes.subarray(0, length));
}
