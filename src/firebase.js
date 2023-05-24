import { initializeApp } from "firebase/app";
import { getFirestore } from 'firebase/firestore';
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyBe3xCXI_09UcSIjUHB9ez8utyi0oJd4l4",
  authDomain: "shiftmaster-cabd2.firebaseapp.com",
  projectId: "shiftmaster-cabd2",
  storageBucket: "shiftmaster-cabd2.appspot.com",
  messagingSenderId: "298061942816",
  appId: "1:298061942816:web:2824f37e3f7a55de90ac45",
  measurementId: "G-8T12YE3EQR"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);