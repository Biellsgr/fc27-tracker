import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// Cole as suas chaves do Firebase aqui:
const firebaseConfig = {
  apiKey: "SUA_API_KEY_AQUI",
  authDomain: "fc-27-tracker.firebaseapp.com",
  projectId: "fc-27-tracker",
  storageBucket: "fc-27-tracker.firebasestorage.app",
  messagingSenderId: "41678604126",
  appId: "1:41678604126:web:b5d22ea2f..."
};

// É IMPORTANTE TER A PALAVRA "export" ANTES DE auth E db:
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);