import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth  } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
    apiKey: "AIzaSyD3GM2HMziomv5iL0diPfFIdc59ZX2U6KM",
    authDomain: "episodedecider.firebaseapp.com",
    projectId: "episodedecider",
    storageBucket: "episodedecider.firebasestorage.app",
    messagingSenderId: "615221222966",
    appId: "1:615221222966:web:6c063953fd5303d2260297",
    measurementId: "G-S13FYGNLEX"
  };

  const app = initializeApp(firebaseConfig);
  
  export const auth = getAuth(app);
  export const db = getFirestore(app);
  export const analytics = getAnalytics(app);