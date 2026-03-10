// ================================================================
//  MOUSSA BUSINESS — Service Worker v2026
//  Stratégie : Stale-While-Revalidate (SWR)
//
//  1. Requête → réponse IMMÉDIATE depuis le cache (offline-ready)
//  2. EN PARALLÈLE → fetch réseau pour mettre à jour le cache
//
//  Stratégies par type :
//  HTML/JS/CSS      → Stale-While-Revalidate
//  Images .webp     → Cache-First (TTL long, limite 150 entrées)
//  Fonts/CDN        → Cache-First (TTL très long)
//  Reste            → Network-First
// ================================================================

const CACHE_NAME    = 'moussa-v2026-1';
const FONT_CACHE    = 'moussa-fonts-v1';
const IMG_CACHE     = 'moussa-images-v1';
const MAX_IMG_CACHE = 150;

const APP_SHELL = [
  './',
  './index.html',
  './products.js',
  './manifest.json',
  './icons/icon-192.png',
  './icons/icon-512.png',
];

// ── INSTALL : précache app shell ──
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(APP_SHELL))
      .then(() => self.skipWaiting())
  );
});

// ── ACTIVATE : purge anciens caches ──
self.addEventListener('activate', event => {
  const valid = [CACHE_NAME, FONT_CACHE, IMG_CACHE];
  event.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(k => !valid.includes(k)).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

// ── FETCH : routeur de stratégies ──
self.addEventListener('fetch', event => {
  const { request } = event;
  const url = new URL(request.url);

  if (request.method !== 'GET') return;
  if (url.protocol === 'chrome-extension:') return;

  // Fonts & CDN statics → Cache-First
  if (url.hostname.includes('fonts.googleapis.com') ||
      url.hostname.includes('fonts.gstatic.com') ||
      (url.hostname.includes('cdnjs.cloudflare.com') && url.pathname.match(/\.(woff2?|ttf|css)$/i))) {
    event.respondWith(cacheFirst(request, FONT_CACHE));
    return;
  }

  // Images produits → Cache-First avec limite
  if (url.pathname.match(/\.(webp|jpe?g|png|gif|svg|avif)$/i)) {
    event.respondWith(cacheFirstWithLimit(request, IMG_CACHE, MAX_IMG_CACHE));
    return;
  }

  // CDN JS/CSS (FontAwesome etc.) → Stale-While-Revalidate
  if (url.hostname.includes('cdnjs.cloudflare.com')) {
    event.respondWith(staleWhileRevalidate(request, CACHE_NAME));
    return;
  }

  // Ressources locales (HTML, JS, manifest) → Stale-While-Revalidate
  if (url.origin === self.location.origin) {
    event.respondWith(staleWhileRevalidate(request, CACHE_NAME));
    return;
  }

  // Tout le reste → Network-First
  event.respondWith(networkFirst(request, CACHE_NAME));
});

// ── Stale-While-Revalidate ──
async function staleWhileRevalidate(request, cacheName) {
  const cache = await caches.open(cacheName);
  const cached = await cache.match(request);
  const networkFetch = fetch(request).then(res => {
    if (res && res.status === 200) cache.put(request, res.clone());
    return res;
  }).catch(() => null);
  return cached || networkFetch;
}

// ── Cache-First ──
async function cacheFirst(request, cacheName) {
  const cache = await caches.open(cacheName);
  const cached = await cache.match(request);
  if (cached) return cached;
  try {
    const res = await fetch(request);
    if (res && res.status === 200) cache.put(request, res.clone());
    return res;
  } catch {
    return new Response('Offline', { status: 503 });
  }
}

// ── Cache-First + limite FIFO ──
async function cacheFirstWithLimit(request, cacheName, max) {
  const cache = await caches.open(cacheName);
  const cached = await cache.match(request);
  if (cached) return cached;
  try {
    const res = await fetch(request);
    if (res && res.status === 200) {
      cache.put(request, res.clone());
      const keys = await cache.keys();
      if (keys.length > max) cache.delete(keys[0]);
    }
    return res;
  } catch {
    return new Response(
      `<svg xmlns="http://www.w3.org/2000/svg" width="200" height="200">
        <rect width="200" height="200" fill="#1a1a1a"/>
        <text x="100" y="105" text-anchor="middle" fill="#444" font-size="12" font-family="sans-serif">Hors-ligne</text>
      </svg>`,
      { headers: { 'Content-Type': 'image/svg+xml' } }
    );
  }
}

// ── Network-First ──
async function networkFirst(request, cacheName) {
  const cache = await caches.open(cacheName);
  try {
    const res = await fetch(request);
    if (res && res.status === 200) cache.put(request, res.clone());
    return res;
  } catch {
    return await cache.match(request) || new Response('Hors-ligne', { status: 503 });
  }
}

// ── Message : force update depuis UI ──
self.addEventListener('message', event => {
  if (event.data?.action === 'skipWaiting') self.skipWaiting();
});
