// OpenTracks のライセンス（音源ファイルを直接取得できる状態での利用は禁止）に合わせ、
// BGM は変換・難読化した .dat で配信し、ここで復号して Blob URL にしてから再生する。
const cache = new Map<string, Promise<string>>();
const ready = new Map<string, string>();

/** 復号済みならその Blob URL を同期的に返す（ユーザー操作中に再生を始めるため） */
export function getReadyAudioUrl(url: string): string | undefined {
  return ready.get(url);
}

export function loadAudioUrl(url: string): Promise<string> {
  if (!cache.has(url)) {
    cache.set(
      url,
      fetch(url)
        .then((r) => {
          if (!r.ok) throw new Error(`BGM load failed: ${r.status}`);
          return r.arrayBuffer();
        })
        .then((buf) => {
          const src = new Uint8Array(buf);
          const out = new Uint8Array(src.length - 4);
          for (let i = 0; i < out.length; i++) out[i] = src[i + 4] ^ ((i * 31 + 90) & 255);
          const blobUrl = URL.createObjectURL(new Blob([out], { type: 'audio/mp4' }));
          ready.set(url, blobUrl);
          return blobUrl;
        })
    );
  }
  return cache.get(url)!;
}
