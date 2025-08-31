import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyCcb3Aue4Z_S-Xz5q9_nRRZB9dT71qbkdQ",
  authDomain: "arnoldfon-9971f.firebaseapp.com",
  projectId: "arnoldfon-9971f",
  storageBucket: "arnoldfon-9971f.firebasestorage.app",
  messagingSenderId: "263121236325",
  appId: "1:263121236325:web:237f7eca4e60ef6a99318c"
};

export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
