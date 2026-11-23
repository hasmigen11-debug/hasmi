// ตัวช่วยให้มือถือ Android ยอมติดตั้งเป็นแอป (ไม่ได้เก็บข้อมูลใด ๆ)
self.addEventListener('install', function () { self.skipWaiting(); });
self.addEventListener('activate', function (e) { e.waitUntil(self.clients.claim()); });
self.addEventListener('fetch', function () {});
