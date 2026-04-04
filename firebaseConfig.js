// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import{getAuth,GoogleAuthProvider} from "firebase/auth";
import { getDatabase } from "firebase/database";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCMEIlp-8_WmZfoWWXrjUyYF58fURpyXBI",
  authDomain: "bookcycleapp-155b5.firebaseapp.com",
  databaseURL: "https://bookcycleapp-155b5-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "bookcycleapp-155b5",
  storageBucket: "bookcycleapp-155b5.firebasestorage.app",
  messagingSenderId: "480877114724",
  appId: "1:480877114724:web:1d3b5e79ee09534469f671"
};

// Initialize Firebase
export const FIREBASE_APP = initializeApp(firebaseConfig);
export const FIREBASE_AUTH = getAuth(FIREBASE_APP);
export const FIREBASE_DB = getDatabase(FIREBASE_APP);
export const GOOGLE_AUTH_PROVIDER = new GoogleAuthProvider();