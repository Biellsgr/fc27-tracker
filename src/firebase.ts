import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyAAjBjdoU3-oOCiuJ4ha3ff95CGsRXPimk",
  authDomain: "fc-27-tracker.firebaseapp.com",
  projectId: "fc-27-tracker",
  storageBucket: "fc-27-tracker.firebasestorage.app",
  messagingSenderId: "416789504126",
  appId: "1:416789504126:web:86b4a28ea3f04cb98df82f",
  measurementId: "G-NXF4PZKXHH"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);