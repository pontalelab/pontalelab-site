// OpenTracks のライセンス（音源ファイルを直接取得できる状態での利用は禁止）に合わせ、
// BGM は変換・難読化した .dat で配信し、ここで復号して Blob URL にしてから再生する。
const cache = new Map();

export function loadAudioUrl(url) {
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
          return URL.createObjectURL(new Blob([out], { type: "audio/mp4" }));
        })
    );
  }
  return cache.get(url);
}
