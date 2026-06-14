const CACHE="opnv-v2";
const ASSETS=["./","./index.html","./manifest.webmanifest","./icon-192.png","./icon-512.png"];
self.addEventListener("install",e=>{e.waitUntil(caches.open(CACHE).then(c=>c.addAll(ASSETS)).then(()=>self.skipWaiting()));});
self.addEventListener("activate",e=>{e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim()));});
self.addEventListener("fetch",e=>{
  const req=e.request;const u=new URL(req.url);
  if(u.origin!==location.origin)return; // 外部(CDN等)はそのまま
  // HTML(ページ本体)はネット優先＝更新を即反映。オフライン時のみキャッシュ
  if(req.mode==="navigate"||req.destination==="document"){
    e.respondWith(
      fetch(req).then(resp=>{const cp=resp.clone();caches.open(CACHE).then(c=>c.put("./index.html",cp));return resp;})
                .catch(()=>caches.match(req).then(r=>r||caches.match("./index.html")))
    );return;
  }
  // 画像・manifest等はキャッシュ優先
  e.respondWith(caches.match(req).then(r=>r||fetch(req).then(resp=>{const cp=resp.clone();caches.open(CACHE).then(c=>c.put(req,cp));return resp;})));
});
