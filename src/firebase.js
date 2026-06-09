import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyAl3AFJ3FVYfz02GEewMRWy2eFx2vgypiE",
  authDomain: "locallink-capstone.firebaseapp.com",
  projectId: "locallink-capstone",
  storageBucket: "locallink-capstone.firebasestorage.app",
  messagingSenderId: "853232032615",
  appId: "1:853232032615:web:2266db784e96d7f884edc2"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);