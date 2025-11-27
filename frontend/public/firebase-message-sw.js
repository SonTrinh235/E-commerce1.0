importScripts('https://www.gstatic.com/firebasejs/10.6.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.6.0/firebase-messaging-compat.js');

firebase.initializeApp({
  apiKey: "AIzaSyAjbR9V1NYMnhh73bpKVj--c-J37ML6Bi0",
  authDomain: "dath-15749.firebaseapp.com",
  projectId: "dath-15749",
  storageBucket: "dath-15749.appspot.com",
  messagingSenderId: "1007151644949",
  appId: "1:1007151644949:web:63f463c51505dd8c9fa91c"
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  console.log('[firebase-messaging-sw.js] Received background message ', payload);

  const notification = payload.notification || {};
  const title = notification.title || 'Thông báo mới';
  const options = {
    body: notification.body || '',
    icon: notification.icon || '/favicon.ico',
    data: payload.data || {}
  };

  self.registration.showNotification(title, options);
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const clickAction = event.notification.data?.click_action || '/';
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      for (const client of clientList) {
        if (client.url === clickAction && 'focus' in client) return client.focus();
      }
      if (clients.openWindow) return clients.openWindow(clickAction);
    })
  );
});
