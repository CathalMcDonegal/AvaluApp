const CACHE='avaluapp-v23';
const APP_SHELL=[
  './',
  './index.html',
  './calendar.html',
  './styles.css',
  './src/student-profile.css',
  './src/class-summary.css',
  './src/class-grid-enhancer.css',
  './src/class-grid-stats.css',
  './src/app.js',
  './src/store.js',
  './src/mobile-install.js',
  './src/remove-demo.js',
  './src/course-delete.js',
  './src/class-calendar-links.js',
  './src/class-dashboard.js',
  './src/student-profile.js',
  './src/class-summary.js',
  './src/class-grid-enhancer.js',
  './src/class-grid-stats.js',
  './src/report-enhancer.js',
  './src/class-reports.js',
  './manifest.json',
  './assets/icon.svg',
  './assets/icon.png',
  './assets/icon-192.svg',
  './assets/icon-512.svg'
];

self.addEventListener('install',event=>{
  event.waitUntil(
    caches.open(CACHE)
      .then(c=>Promise.allSettled(APP_SHELL.map(asset=>c.add(asset))))
      .then(()=>self.skipWaiting())
  );
});

self.addEventListener('activate',event=>{
  event.waitUntil(
    caches.keys()
      .then(keys=>Promise.all(keys.filter(k=>k!==CACHE).map(k=>caches.delete(k))))
      .then(()=>self.clients.claim())
  );
});

self.addEventListener('fetch',event=>{
  if(event.request.method!=='GET') return;
  const url=new URL(event.request.url);

  if(event.request.mode==='navigate' || url.pathname.endsWith('.html')){
    event.respondWith(
      fetch(event.request,{cache:'no-cache'})
        .then(response=>{
          if(!response.ok) throw new Error('HTTP '+response.status);
          const copy=response.clone();
          caches.open(CACHE).then(c=>c.put(event.request,copy));
          return response;
        })
        .catch(()=>caches.match(event.request,{ignoreSearch:true}).then(r=>r||caches.match('./index.html')))
    );
    return;
  }

  event.respondWith(
    caches.match(event.request)
      .then(cached=>cached||fetch(event.request).then(response=>{
        if(response.ok && url.origin===self.location.origin){
          const copy=response.clone();
          caches.open(CACHE).then(c=>c.put(event.request,copy));
        }
        return response;
      }))
      .catch(()=>caches.match('./index.html'))
  );
});
