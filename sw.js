// オフライン対応用のService Worker
// アプリ本体はネット優先（つながらないときはキャッシュ）、フォントはキャッシュ優先。
const CACHE = 'jct-sim-v1';
const ASSETS = [
  './',
  './index.html',
  './manifest.webmanifest',
  './icons/icon.svg',
  './icons/icon-32.png',
  './icons/icon-192.png',
  './icons/icon-512.png',
  './icons/icon-maskable-512.png',
  './icons/apple-touch-icon.png',
];
const FONT_HOSTS = ['fonts.googleapis.com', 'fonts.gstatic.com'];
const NETWORK_TIMEOUT = 4000;

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(ASSETS)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(k => k.startsWith('jct-sim-') && k !== CACHE).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

// 初回表示で読み込み済みのフォントを、ページから受け取ってキャッシュする
self.addEventListener('message', e => {
  const d = e.data;
  if (!d || d.type !== 'cache-fonts' || !Array.isArray(d.urls)) return;
  const urls = d.urls.filter(u => { try { return FONT_HOSTS.includes(new URL(u).hostname); } catch { return false; } });
  e.waitUntil(caches.open(CACHE).then(c => Promise.all(urls.map(async u => {
    if (await c.match(u)) return;
    try { const r = await fetch(u, { mode: 'cors' }); if (r.ok) await c.put(u, r); } catch {}
  }))));
});

self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  if (FONT_HOSTS.includes(url.hostname)) { e.respondWith(cacheFirst(req)); return; }
  if (url.origin === self.location.origin) { e.respondWith(networkFirst(e)); }
});

async function cacheFirst(req) {
  const c = await caches.open(CACHE);
  const hit = await c.match(req);
  if (hit) return hit;
  const res = await fetch(req);
  if (res.ok || res.type === 'opaque') c.put(req, res.clone());
  return res;
}

async function networkFirst(e) {
  const req = e.request;
  const c = await caches.open(CACHE);
  const net = fetch(req).then(res => {
    if (res.ok) e.waitUntil(c.put(req, res.clone()));
    return res;
  });
  net.catch(() => {});
  const fromCache = () => c.match(req, { ignoreSearch: req.mode === 'navigate' })
    .then(hit => hit || (req.mode === 'navigate' ? c.match('./index.html') : undefined));
  // 回線が遅いときは一定時間でキャッシュに切り替える
  const timeout = new Promise(resolve => setTimeout(resolve, NETWORK_TIMEOUT)).then(fromCache);
  try {
    const res = await Promise.race([net, timeout]);
    if (res) return res;
    return await net;
  } catch {
    const hit = await fromCache();
    if (hit) return hit;
    throw new Error('offline');
  }
}
