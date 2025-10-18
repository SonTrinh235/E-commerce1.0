import { initializeApp } from "firebase/app";
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

if (window.location.hostname === "localhost") {
    auth.settings.appVerificationDisabledForTesting = true;
  }