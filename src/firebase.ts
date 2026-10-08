// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyAAjBjdoU3-oOCiuJ4ha3ff95CGsRXPimk",
  authDomain: "fc-27-tracker.firebaseapp.com",
  projectId: "fc-27-tracker",
  storageBucket: "fc-27-tracker.firebasestorage.app",
  messagingSenderId: "416789504126",
  appId: "1:416789504126:web:86b4a28ea3f04cb98df82f",
  measurementId: "G-NXF4PZKXHH"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);