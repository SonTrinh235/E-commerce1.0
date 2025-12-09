import { initializeApp } from "firebase/app";
import { getMessaging, getToken, onMessage } from "firebase/messaging";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyAjbR9V1NYMnhh73bpKVj--c-J37ML6Bi0",
  authDomain: "dath-15749.firebaseapp.com",
  projectId: "dath-15749",
  storageBucket: "dath-15749.firebasestorage.app",
  messagingSenderId: "1007151644949",
  appId: "1:1007151644949:web:63f463c51505dd8c9fa91c",
  measurementId: "G-E3CXHMKD3H"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
const messaging = getMessaging(app);
const BASE_URL = "https://www.bachkhoaxanh.xyz";

/**
 * @returns {Promise<string|null>}
 */
export async function getFcmToken() {
  try {
    if (!("serviceWorker" in navigator)) {
      console.warn("Service Worker not supported.");
      return null;
    }
    if (!("PushManager" in window)) {
      console.warn("Push notifications not supported.");
      return null;
    }
    if (!("Notification" in window)) {
      console.warn("Notification API not supported.");
      return null;
    }

    const saved = localStorage.getItem("fcmToken");
    if (saved) {
      console.log("FCM Token:", saved);
      return saved;
    }

    const permission = await Notification.requestPermission();
    if (permission !== "granted") {
      console.warn("Notification permission not granted.");
      return null;
    }

    let swReg;
    if (navigator.serviceWorker.controller) {
      swReg = await navigator.serviceWorker.ready;
    } else {
      swReg = await navigator.serviceWorker.register("/firebase-message-sw.js", {
        scope: "/"
      });
    }

    console.log("SW ready:", swReg);

    const token = await getToken(messaging, {
      vapidKey: "BJH4PM3b1A65WWa9PcgmHpCcXAEj5X6KTn6_Qv9ZYYwR1IR92A3CUydOIbPe4u7fvwO0pzddzO32GJI4U-SzU1A",
      serviceWorkerRegistration: swReg
    });

    if (!token) {
      console.warn("FCM returned no token.");
      return null;
    }

    localStorage.setItem("fcmToken", token);
    // console.log("FCM token Mới:", token);
    return token;

  } catch (err) {
    console.error("Error getting FCM token:", err);
    return null;
  }
}

/**
 * @param {(payload: Object) => void} callback
 */
export function onForegroundMessage(callback) {
  onMessage(messaging, (payload) => {
    console.log("Foreground message received:", payload);
    callback(payload);
  });
}

export async function registerFcmToken(userId, fcmToken) {
  console.log(" [API] Calling registerFcmToken...");
  try {
    const authToken = localStorage.getItem("userToken"); 
    const res = await fetch(`${BASE_URL}/user/${userId}/fcmToken`, {
      method: "PUT",
      headers: { 
        "Content-Type": "application/json",
        ...(authToken ? { "Authorization": `Bearer ${authToken}` } : {})
      },
      body: JSON.stringify({ fcmToken }),
    });
    
    if (!res.ok) {
        console.error(`Register Token Failed: ${res.status} ${res.statusText}`);
        return null;
    }
    
    const data = await res.json();
    console.log("Register Token Success:", data);
    return data;
  } catch (err) {
    console.error("Lỗi API registerFcmToken:", err);
    return null;
  }
}