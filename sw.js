const CACHE_NAME = "pair-socks-cache-v4";

// Archivos locales que deseas cachear
const FILES_TO_CACHE = [
  "/",
  "/index.html",
  "/styles.css",
  "/script.js",
  "/images/icon/icon.png"
];

// Recursos externos para cachear manualmente
const EXTERNAL_RESOURCES = [
  "https://cdn.sheetjs.com/xlsx-latest/package/dist/xlsx.full.min.js",
  "https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js",
  "https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js"
];

// INSTALACIÓN: Cachea archivos locales y externos
self.addEventListener("install", (event) => {
  event.waitUntil(
    (async () => {
      const cache = await caches.open(CACHE_NAME);
      await cache.addAll(FILES_TO_CACHE);

      for (const url of EXTERNAL_RESOURCES) {
        try {
          const response = await fetch(url);
          if (response.ok) {
            await cache.put(url, response.clone());
          }
        } catch (err) {
          console.warn(`No se pudo cachear ${url}:`, err);
        }
      }
    })()
  );
  self.skipWaiting(); // Activa el SW de inmediato
});

// ACTIVACIÓN: Elimina cachés antiguos
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keyList) =>
      Promise.all(
        keyList.map((key) => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      )
    )
  );
  self.clients.claim();
});

// FETCH: Responde con caché primero, luego red si es necesario
self.addEventListener("fetch", (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      return (
        response ||
        fetch(event.request).catch(() => {
          // Si la petición es un documento HTML y no está disponible, usar fallback
          if (event.request.destination === "document") {
            return caches.match("/index.html");
          }
        })
      );
    })
  );
});
