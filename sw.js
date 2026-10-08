// Service worker: deja la app abrir sin internet.
// Si cambias los archivos de la lista, sube el número de versión (v1 -> v2).
const VERSION = 'cilindros-v1';
const ARCHIVOS = ['./', './index.html', './config.js', './manifest.webmanifest', './logo.jpg', './icon-192.png', './icon-512.png'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(VERSION).then(c => c.addAll(ARCHIVOS)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(ks => Promise.all(ks.filter(k => k !== VERSION).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

function conTiempo(promesa, ms) {
  return new Promise((ok, no) => {
    const t = setTimeout(() => no(new Error('tiempo')), ms);
    promesa.then(r => { clearTimeout(t); ok(r); }, e => { clearTimeout(t); no(e); });
  });
}

self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);

  // Tipografías de Google: se guardan al verlas por primera vez en línea.
  if (url.hostname === 'fonts.googleapis.com' || url.hostname === 'fonts.gstatic.com') {
    e.respondWith(caches.open(VERSION).then(async c => {
      const guardado = await c.match(req);
      const red = fetch(req).then(r => { c.put(req, r.clone()); return r; }).catch(() => guardado);
      return guardado || red;
    }));
    return;
  }

  // Archivos de la propia app: primero la red (para recibir actualizaciones), y si no hay señal, lo guardado.
  if (url.origin === self.location.origin) {
    e.respondWith((async () => {
      const c = await caches.open(VERSION);
      try {
        const r = await conTiempo(fetch(req, { cache: 'no-cache' }), 3500);
        if (r && r.ok) c.put(req, r.clone());
        return r;
      } catch (err) {
        const g = await c.match(req, { ignoreSearch: true });
        if (g) return g;
        if (req.mode === 'navigate') return (await c.match('./index.html')) || Response.error();
        return Response.error();
      }
    })());
  }
  // Todo lo demás (el servidor de Apps Script) pasa sin tocar.
});
