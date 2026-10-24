// Web-пуши убраны из приложения. У тех, кто успел их включить, этот воркер
// ещё зарегистрирован: при очередной проверке обновления он удаляет себя
// вместе с подпиской.
self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', (event) => {
  event.waitUntil((async () => {
    try {
      const sub = await self.registration.pushManager.getSubscription();
      if (sub) await sub.unsubscribe();
    } catch (_) {}
    await self.registration.unregister();
  })());
});
