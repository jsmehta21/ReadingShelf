// src/firebase.js
import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyDClXRZGf3A39Rq4a4ut1TyLOknbMONugU",
  authDomain: "my-reading-shelf.firebaseapp.com",
  projectId: "my-reading-shelf",
  storageBucket: "my-reading-shelf.firebasestorage.app",
  messagingSenderId: "157774739913",
  appId: "1:157774739913:web:6289b09461b8b47e375018",
  measurementId: "G-MX8Z47VHZ2"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const provider = new GoogleAuthProvider();
export const db = getFirestore(app);