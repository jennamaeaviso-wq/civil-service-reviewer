
const CACHE_NAME = "csr-reviewer-v3";
const CORE_FILES = [
  "/civil-service-reviewer/",
  "/civil-service-reviewer/index.html",
  "/civil-service-reviewer/manifest.json"
];

self.addEventListener("install", event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(CORE_FILES))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", event => {
  event.waitUntil(
    caches.keys()
      .then(keys => Promise.all(
        keys
          .filter(key => key.startsWith("csr-reviewer-") &&
                         key !== CACHE_NAME)
          .map(key => caches.delete(key))
      ))
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", event => {
  const request = event.request;
  const url = new URL(request.url);

  if (request.method !== "GET" ||
      url.origin !== self.location.origin) {
    return;
  }

  event.respondWith(
    fetch(request).then(response => {
      if (response.ok) {
        const copy = response.clone();
        caches.open(CACHE_NAME)
          .then(cache => cache.put(request, copy))
          .catch(() => {});
      }
      return response;
    }).catch(() =>
      caches.match(request).then(cached =>
        cached || (request.mode === "navigate"
          ? caches.match("/civil-service-reviewer/")
          : Response.error())
      )
    )
  );
});
