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
  const notification = payload.notification || {};
  self.registration.showNotification(notification.title || "Thông báo mới", {
    body: notification.body || "",
    icon: notification.icon || "",
    data: payload.data || {}
  });
});
