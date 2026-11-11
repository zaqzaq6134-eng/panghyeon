// 앱 파일을 캐시해 오프라인에서도 열리게 하는 서비스워커.
// 앱을 수정해 다시 올릴 때는 아래 VERSION 숫자를 올려야 사용자 기기가 새 파일을 받습니다.
const VERSION = 'shift-cal-v3';
const TW = 'https://cdn.tailwindcss.com/3.4.17';
const CORE = ['./', 'index.html', 'manifest.webmanifest', 'icon-192.png', 'icon-512.png', 'apple-touch-icon.png'];

self.addEventListener('install', e => {
  e.waitUntil((async () => {
    const c = await caches.open(VERSION);
    await Promise.all(CORE.map(u => c.add(u).catch(() => {})));
    try { await c.put(TW, await fetch(TW, { mode: 'no-cors' })); } catch (_) {}
    self.skipWaiting();
  })());
});
self.addEventListener('activate', e => {
  e.waitUntil((async () => {
    for (const k of await caches.keys()) if (k !== VERSION) await caches.delete(k);
    await self.clients.claim();
  })());
});
self.addEventListener('fetch', e => {
  const r = e.request;
  if (r.method !== 'GET') return;
  if (new URL(r.url).origin !== location.origin && r.url !== TW) return;
  e.respondWith((async () => {
    const hit = await caches.match(r, { ignoreSearch: true });
    const net = fetch(r).then(res => {
      if (res && (res.ok || res.type === 'opaque')) { const cp = res.clone(); caches.open(VERSION).then(c => c.put(r, cp)); }
      return res;
    }).catch(() => hit);
    return hit || net;
  })());
});
