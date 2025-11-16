import { initializeApp } from "firebase/app";
import { getMessaging, getToken, onMessage } from "firebase/messaging";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyAjbR9V1NYMnhh73bpKVj--c-J37ML6Bi0",
  authDomain: "dath-15749.firebaseapp.com",
  projectId: "dath-15749",
  storageBucket: "dath-15749.appspot.com",
  messagingSenderId: "1007151644949",
  appId: "1:1007151644949:web:63f463c51505dd8c9fa91c"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
 
const messaging = getMessaging(app);

export const requestForToken = async () => {
  try {
    const permission = await Notification.requestPermission();
    if (permission !== "granted") return;

    const swReg = await navigator.serviceWorker.register("/firebase-messaging-sw.js", {
      scope: "/"
    });
    

    const token = await getToken(messaging, {
      vapidKey: "BJH4PM3b1A65WWa9PcgmHpCcXAEj5X6KTn6_Qv9ZYYwR1IR92A3CUydOIbPe4u7fvwO0pzddzO32GJI4U-SzU1A",
      serviceWorkerRegistration: swReg
    });

    console.log("FCM Token:", token);
    return token;
  } catch (err) {
    console.error("Lỗi lấy FCM token:", err);
  }
};

export const onMessageListener = () =>
  new Promise((resolve) => {
    onMessage(messaging, (payload) => resolve(payload));
  });
