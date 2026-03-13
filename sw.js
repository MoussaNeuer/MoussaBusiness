// ================================================================
//  MOUSSA BUSINESS — Service Worker v2026-2 (feat/claude-updates)
//
//  Stratégies :
//  HTML navigations  → Network-First + fallback offline.html
//  JS/CSS locaux     → Stale-While-Revalidate
//  Images .webp      → Cache-First (max 150 entrées, FIFO)
//  Fonts/CDN         → Cache-First (TTL long)
//  Reste             → Network-First
//
//  Background Sync :
//  Les commandes hors-ligne sont stockées en IndexedDB et
//  renvoyées automatiquement au retour en ligne (sync 'orders-sync').
// ================================================================

const CACHE_NAME = "moussa-v2026-3";
const FONT_CACHE = "moussa-fonts-v3";
const IMG_CACHE = "moussa-images-v3";
const MAX_IMG_CACHE = 150;

const APP_SHELL = [
  "./",
  "./index.html",
  "./shop.html",
  "./product.html",
  "./cart.html",
  "./favorites.html",
  "./offline.html",
  "./products.js",
  "./manifest.json",
  "./js/cart.js",
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then((cache) => cache.addAll(APP_SHELL))
      .then(() => self.skipWaiting()),
  );
});

self.addEventListener("activate", (event) => {
  const valid = [CACHE_NAME, FONT_CACHE, IMG_CACHE];
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys.filter((k) => !valid.includes(k)).map((k) => caches.delete(k)),
        ),
      )
      .then(() => self.clients.claim()),
  );
});

self.addEventListener("fetch", (event) => {
  const { request } = event;
  const url = new URL(request.url);
  if (request.method !== "GET") return;
  if (url.protocol === "chrome-extension:") return;

  if (
    url.hostname.includes("fonts.googleapis.com") ||
    url.hostname.includes("fonts.gstatic.com") ||
    (url.hostname.includes("cdnjs.cloudflare.com") &&
      url.pathname.match(/\.(woff2?|ttf|css)$/i))
  ) {
    event.respondWith(cacheFirst(request, FONT_CACHE));
    return;
  }
  if (url.pathname.match(/\.(webp|jpe?g|png|gif|svg|avif)$/i)) {
    event.respondWith(cacheFirstWithLimit(request, IMG_CACHE, MAX_IMG_CACHE));
    return;
  }
  if (url.hostname.includes("cdnjs.cloudflare.com")) {
    event.respondWith(staleWhileRevalidate(request, CACHE_NAME));
    return;
  }
  if (request.mode === "navigate") {
    event.respondWith(networkFirstWithOfflineFallback(request));
    return;
  }
  if (url.origin === self.location.origin) {
    event.respondWith(staleWhileRevalidate(request, CACHE_NAME));
    return;
  }
  event.respondWith(networkFirst(request, CACHE_NAME));
});

self.addEventListener("sync", (event) => {
  if (event.tag === "orders-sync") {
    event.waitUntil(syncPendingOrders());
  }
});

async function syncPendingOrders() {
  try {
    const db = await openOrdersDB();
    const orders = await getAllPendingOrders(db);
    for (const order of orders) {
      await notifyClients({ type: "ORDER_SYNCED", orderCount: orders.length });
      await markOrderSynced(db, order.id);
    }
  } catch (e) {
    console.warn("[SW] syncPendingOrders:", e);
  }
}

function openOrdersDB() {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open("moussa_db", 1);
    req.onsuccess = (e) => resolve(e.target.result);
    req.onerror = (e) => reject(e.target.error);
  });
}
function getAllPendingOrders(db) {
  return new Promise((res) => {
    try {
      const r = db
        .transaction("orders", "readonly")
        .objectStore("orders")
        .getAll();
      r.onsuccess = () => res(r.result || []);
      r.onerror = () => res([]);
    } catch {
      res([]);
    }
  });
}
function markOrderSynced(db, id) {
  return new Promise((res) => {
    try {
      db.transaction("orders", "readwrite").objectStore("orders").delete(id);
      res();
    } catch {
      res();
    }
  });
}
async function notifyClients(data) {
  const clients = await self.clients.matchAll({ type: "window" });
  clients.forEach((c) => c.postMessage(data));
}

async function networkFirstWithOfflineFallback(request) {
  const cache = await caches.open(CACHE_NAME);
  try {
    const res = await fetch(request);
    if (res && res.status === 200) cache.put(request, res.clone());
    return res;
  } catch {
    const cached = await cache.match(request);
    if (cached) return cached;
    return (
      cache.match("./offline.html") ||
      new Response("<h1>Hors ligne</h1>", {
        headers: { "Content-Type": "text/html" },
      })
    );
  }
}
async function staleWhileRevalidate(request, cacheName) {
  const cache = await caches.open(cacheName);
  const cached = await cache.match(request);
  const nf = fetch(request)
    .then((res) => {
      if (res && res.status === 200) cache.put(request, res.clone());
      return res;
    })
    .catch(() => null);
  return cached || nf;
}
async function cacheFirst(request, cacheName) {
  const cache = await caches.open(cacheName);
  const cached = await cache.match(request);
  if (cached) return cached;
  try {
    const res = await fetch(request);
    if (res && res.status === 200) cache.put(request, res.clone());
    return res;
  } catch {
    return new Response("Offline", { status: 503 });
  }
}
async function cacheFirstWithLimit(request, cacheName, max) {
  const cache = await caches.open(cacheName);
  const cached = await cache.match(request);
  if (cached) return cached;
  try {
    const res = await fetch(request);
    if (res && res.status === 200) {
      cache.put(request, res.clone());
      const keys = await cache.keys();
      if (keys.length > max) await cache.delete(keys[0]);
    }
    return res;
  } catch {
    return new Response(
      '<svg xmlns="http://www.w3.org/2000/svg" width="200" height="200"><rect width="200" height="200" fill="#1a1a1a"/><text x="100" y="105" text-anchor="middle" fill="#555" font-size="12" font-family="sans-serif">Hors-ligne</text></svg>',
      { headers: { "Content-Type": "image/svg+xml" } },
    );
  }
}
async function networkFirst(request, cacheName) {
  const cache = await caches.open(cacheName);
  try {
    const res = await fetch(request);
    if (res && res.status === 200) cache.put(request, res.clone());
    return res;
  } catch {
    return (
      (await cache.match(request)) ||
      new Response("Hors-ligne", { status: 503 })
    );
  }
}
self.addEventListener("message", (event) => {
  if (event.data?.action === "skipWaiting") self.skipWaiting();
});
