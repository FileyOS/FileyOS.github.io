// FileyOS — Scramjet Service Worker
// Place this file at the ROOT of your GitHub Pages repo as /sw.js

importScripts("https://cdn.jsdelivr.net/npm/@mercuryworkshop/scramjet-controller@latest/dist/scramjet.all.js");

const { ScramjetServiceWorker } = $scramjetLoadWorker();
const scramjet = new ScramjetServiceWorker();

self.addEventListener("fetch", (event) => {
  event.respondWith(
    (async () => {
      await scramjet.loadConfig();
      if (scramjet.route(event)) {
        return scramjet.fetch(event);
      }
      return fetch(event.request);
    })()
  );
});
