// Shoplist: сервис-воркер для Web Push (отдельный scope, чтобы не мешать
// флаттеровскому воркеру офлайн-кэша).
self.addEventListener('push', (event) => {
  let data = { title: 'Shoplist', body: 'Обновление в общем списке' };
  try {
    if (event.data) data = event.data.json();
  } catch (_) {}
  event.waitUntil(
    self.registration.showNotification(data.title, {
      body: data.body,
      icon: '../icons/Icon-192.png',
      badge: '../icons/Icon-192.png',
    })
  );
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then(
      (list) => (list.length ? list[0].focus() : clients.openWindow('../'))
    )
  );
});
