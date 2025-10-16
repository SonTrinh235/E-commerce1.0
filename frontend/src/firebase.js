import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
    apiKey: "AIzaSyDkYB1EAxerdE-ClcC75pUB12IhAL-gNBg",
    authDomain: "dath-251-cnpm.firebaseapp.com",
    projectId: "dath-251-cnpm",
    storageBucket: "dath-251-cnpm.appspot.com",
    messagingSenderId: "571811781805",
    appId: "1:571811781805:web:89e15bf45c80afc8fefa24",
    measurementId: "G-4J2YQVBMPY"
  };

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);

if (window.location.hostname === "localhost") {
    auth.settings.appVerificationDisabledForTesting = true;
  }