import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBfY_LcGpj40GR6YlfDQcuN3iXMcDdCC8c",
  authDomain: "carbontrail-74b5b.firebaseapp.com",
  projectId: "carbontrail-74b5b",
  storageBucket: "carbontrail-74b5b.firebasestorage.app",
  messagingSenderId: "874646471982",
  appId: "1:874646471982:web:baae70248b399f7fd6e6bf"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
