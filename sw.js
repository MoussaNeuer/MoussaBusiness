// ================================================================
//  MOUSSA BUSINESS — Service Worker Premium 2026
//  Cache strategies: Network-First nav | Cache-First images | SWR JS/CSS
// ================================================================
const VER = "mb-2026-2";
const FONT_C = "mb-fonts-1";
const IMG_C = "mb-img-1";
const MAX_IMG = 200;

const SHELL = [
  "./","./index.html","./offline.html",
  "./data/products.js","./manifest.json"
];

self.addEventListener("install",e=>{
  e.waitUntil(
    caches.open(VER).then(c=>c.addAll(SHELL).catch(()=>{})).then(()=>self.skipWaiting())
  );
});

self.addEventListener("activate",e=>{
  e.waitUntil(
    caches.keys().then(ks=>Promise.all(ks.filter(k=>![VER,FONT_C,IMG_C].includes(k)).map(k=>caches.delete(k))))
    .then(()=>self.clients.claim())
  );
});

self.addEventListener("fetch",e=>{
  const {request:req}=e;
  const url=new URL(req.url);
  if(req.method!=="GET"||url.protocol==="chrome-extension:")return;

  if(url.hostname.includes("fonts.googleapis.com")||url.hostname.includes("fonts.gstatic.com")||
    (url.hostname.includes("cdnjs.cloudflare.com")&&/\.(woff2?|ttf|css)$/i.test(url.pathname))){
    e.respondWith(cacheFirst(req,FONT_C));return;
  }
  if(/\.(webp|jpe?g|png|gif|svg|avif)$/i.test(url.pathname)){
    e.respondWith(cacheFirstLimited(req,IMG_C,MAX_IMG));return;
  }
  if(url.hostname.includes("cdnjs.cloudflare.com")){
    e.respondWith(swr(req,VER));return;
  }
  if(req.mode==="navigate"){
    e.respondWith(navFirst(req));return;
  }
  if(url.origin===self.location.origin){
    e.respondWith(swr(req,VER));return;
  }
  e.respondWith(netFirst(req,VER));
});

self.addEventListener("push",e=>{
  const d=e.data?.json()||{};
  e.waitUntil(self.registration.showNotification(d.title||"Moussa Business",{
    body:d.body||"Nouvelle offre disponible !",
    icon:"./icons/icon-192.png",badge:"./icons/icon-64.png",
    vibrate:[100,50,100],data:{url:d.url||"/"}
  }));
});

self.addEventListener("notificationclick",e=>{
  e.notification.close();
  if(e.action!=="dismiss")e.waitUntil(clients.openWindow(e.notification.data?.url||"/"));
});

self.addEventListener("message",e=>{if(e.data?.action==="skipWaiting")self.skipWaiting();});

async function navFirst(req){
  const c=await caches.open(VER);
  try{const r=await fetch(req);if(r?.status===200)c.put(req,r.clone());return r;}
  catch{return await c.match(req)||await c.match("./offline.html")||new Response("<h1>Hors ligne</h1>",{headers:{"Content-Type":"text/html"}});}
}
async function swr(req,cn){
  const c=await caches.open(cn),cached=await c.match(req);
  const fresh=fetch(req).then(r=>{if(r?.status===200)c.put(req,r.clone());return r;}).catch(()=>null);
  return cached||fresh;
}
async function cacheFirst(req,cn){
  const c=await caches.open(cn),cached=await c.match(req);
  if(cached)return cached;
  try{const r=await fetch(req);if(r?.status===200)c.put(req,r.clone());return r;}
  catch{return new Response("Offline",{status:503});}
}
async function cacheFirstLimited(req,cn,max){
  const c=await caches.open(cn),cached=await c.match(req);
  if(cached)return cached;
  try{
    const r=await fetch(req);
    if(r?.status===200){c.put(req,r.clone());const ks=await c.keys();if(ks.length>max)c.delete(ks[0]);}
    return r;
  }catch{return new Response('<svg xmlns="http://www.w3.org/2000/svg" width="200" height="200"><rect fill="#15161A" width="200" height="200"/></svg>',{headers:{"Content-Type":"image/svg+xml"}});}
}
async function netFirst(req,cn){
  const c=await caches.open(cn);
  try{const r=await fetch(req);if(r?.status===200)c.put(req,r.clone());return r;}
  catch{return await c.match(req)||new Response("Offline",{status:503});}
}
