// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCjb-VeVi1aUKZgxqRXlvQZi_gxNLWO1rk",
  authDomain: "patientrecordtracker.firebaseapp.com",
  projectId: "patientrecordtracker",
  storageBucket: "patientrecordtracker.appspot.com",
  messagingSenderId: "92767764847",
  appId: "1:92767764847:web:6bd4d8b23ff94bb93c289a"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Export Firestore database
export const db = getFirestore(app);
