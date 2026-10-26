// Service worker Шоплиста: приложение открывается без сети и мгновенно
// при повторном запуске. Версию подставляет tool/check.sh — хеш сборки.
//
// Всё, что относится к одной версии (index.html, загрузчик, wasm, шрифты),
// живёт в одном кеше и отдаётся оттуда: новая страница никогда не смешается
// со старым wasm. Новая версия скачивается в фоне и включается со следующего
// запуска. Запросы к Supabase и прочим API идут мимо — их кеш не трогает.
const VERSION = 'b6d9e60f5108';
const CACHE = `shoplist-${VERSION}`;
const SCOPE = self.registration.scope;
const SHELL = ['./', 'flutter_bootstrap.js', 'manifest.json', 'icons/Icon-192.png'];
// Без чего приложение не работает офлайн, даже если этим ещё ни разу не
// пользовались: каталог читается лениво, при первом открытии списка.
// Список подставляет tool/check.sh из содержимого сборки.
const PRECACHE = ["assets/AssetManifest.bin", "assets/AssetManifest.bin.json", "assets/FontManifest.json", "assets/assets/catalog/categories.json", "assets/assets/catalog/domains.json", "assets/assets/catalog/products.json", "assets/assets/fonts/GolosText-400.ttf", "assets/assets/fonts/GolosText-500.ttf", "assets/assets/fonts/GolosText-600.ttf", "assets/assets/fonts/IBMPlexMono-400.ttf", "assets/assets/fonts/Oswald-500.ttf", "assets/assets/fonts/Oswald-600.ttf", "assets/assets/fonts/ShoplistEmoji.ttf", "assets/fonts/MaterialIcons-Regular.otf", "assets/fonts/fallback/Roboto-Regular.ttf", "assets/packages/wakelock_plus/assets/no_sleep.js", "assets/shaders/ink_sparkle.frag", "assets/shaders/stretch_effect.frag", "drift_worker.js", "sqlite3.wasm"];

const isCacheable = (url) =>
  (url.startsWith(SCOPE) && !url.endsWith('/sw.js')) ||
  url.startsWith('https://fonts.gstatic.com/');

// Сверка с сервером, а не HTTP-кеш: GitHub Pages отдаёт файлы с max-age=600,
// и сразу после деплоя оттуда пришёл бы старый файл. Неизменённое — 304.
const fresh = (url) => fetch(url, { cache: 'no-cache' });

self.addEventListener('install', (event) => {
  event.waitUntil((async () => {
    const cache = await caches.open(CACHE);
    await cache.addAll(
      [...SHELL, ...PRECACHE].map((u) => new Request(u, { cache: 'no-cache' })));
    // Файлы, которыми устройство пользовалось в прошлой версии, — сразу
    // в новой: иначе после обновления до первого онлайн-запуска приложение
    // не открылось бы офлайн. Не скачалось что-то — установка падает,
    // и остаётся прежняя рабочая версия.
    for (const name of await caches.keys()) {
      if (name === CACHE || !name.startsWith('shoplist-')) continue;
      const old = await caches.open(name);
      for (const req of await old.keys()) {
        if (await cache.match(req.url)) continue;
        const res = await fresh(req.url);
        if (!res.ok) throw new Error(`precache ${req.url}: ${res.status}`);
        await cache.put(req.url, res);
      }
    }
    await self.skipWaiting();
  })());
});

self.addEventListener('activate', (event) => {
  event.waitUntil((async () => {
    for (const name of await caches.keys()) {
      if (name !== CACHE && name.startsWith('shoplist-')) {
        await caches.delete(name);
      }
    }
    await self.clients.claim();
  })());
});

self.addEventListener('fetch', (event) => {
  const req = event.request;
  if (req.method !== 'GET' || !isCacheable(req.url)) return;

  // Навигация (в том числе ?join=КОД) — всегда оболочка приложения.
  if (req.mode === 'navigate') {
    event.respondWith((async () => {
      const cache = await caches.open(CACHE);
      const shell = await cache.match(SCOPE);
      if (shell) return shell;
      return fetch(req);
    })());
    return;
  }

  event.respondWith((async () => {
    const cache = await caches.open(CACHE);
    const hit = await cache.match(req.url);
    if (hit) return hit;
    const res = await fetch(req);
    if (res.ok && res.type !== 'opaque') {
      cache.put(req.url, res.clone()).catch(() => {});
    }
    return res;
  })());
});

// Страница после первого кадра присылает файлы, которыми пользовалась:
// при первом визите она ещё не под контролем, и эти запросы мимо нас.
self.addEventListener('message', (event) => {
  const data = event.data;
  if (!data || data.type !== 'cache' || !Array.isArray(data.urls)) return;
  event.waitUntil((async () => {
    const cache = await caches.open(CACHE);
    for (const url of data.urls) {
      if (!isCacheable(url) || await cache.match(url)) continue;
      try {
        // Обычный режим кеша: файлы только что скачаны, берутся из HTTP-кеша.
        const res = await fetch(url);
        if (res.ok && res.type !== 'opaque') await cache.put(url, res);
      } catch (_) {}
    }
  })());
});
