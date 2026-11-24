// Система звітів — фоновий скрипт застосунку (PWA).
// Зберігає на ПК лише оболонку сайту (заставку, значки), щоб застосунок запускався швидко.
// Дані з Apps Script НЕ кешуються — завжди беруться свіжі з інтернету.
// Щоб примусово оновити оболонку на всіх ПК, змініть номер версії нижче.
const VERSION = "rs-shell-v1";
const SHELL = ["./", "./index.html", "./manifest.webmanifest", "./icons/icon-192.png", "./icons/icon-512.png", "./icons/favicon-32.png"];

self.addEventListener("install", e => {
  e.waitUntil(caches.open(VERSION).then(c => c.addAll(SHELL)).then(() => self.skipWaiting()));
});
self.addEventListener("activate", e => {
  e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== VERSION).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener("fetch", e => {
  const req = e.request, url = new URL(req.url);
  if (req.method !== "GET" || url.origin !== location.origin) return; // Apps Script і все стороннє — напряму, без кешу
  if (req.mode === "navigate") {
    // спершу мережа (щоб оновлення сайту приходили одразу), без мережі — збережена копія
    e.respondWith(fetch(req).then(r => { const cp = r.clone(); caches.open(VERSION).then(c => c.put("./index.html", cp)); return r; })
      .catch(() => caches.match("./index.html").then(r => r || caches.match("./"))));
    return;
  }
  e.respondWith(caches.match(req).then(r => r || fetch(req).then(n => { if (n.ok) { const cp = n.clone(); caches.open(VERSION).then(c => c.put(req, cp)); } return n; })));
});
