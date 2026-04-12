import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getAnalytics } from "firebase/analytics";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCfpU4Wme90GfOY41NB2p6okB83e4_uyvE",
  authDomain: "swasthya-setu-b89b9.firebaseapp.com",
  projectId: "swasthya-setu-b89b9",
  storageBucket: "swasthya-setu-b89b9.firebasestorage.app",
  messagingSenderId: "1004672012156",
  appId: "1:1004672012156:web:3f7ef75757dbe90d3f9ef9",
  measurementId: "G-7BSZX9N71T"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

// Initialize Firebase Auth and providers
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();

export { analytics };
export default app;
