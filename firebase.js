// AI-CHATBOT PROJECT Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { getAuth } from "firebase/auth";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDRnFQfd2OqxhUuegHOBteP5TCmQpmAck4",
  authDomain: "ai-chatbot-cs.firebaseapp.com",
  projectId: "ai-chatbot-cs",
  storageBucket: "ai-chatbot-cs.appspot.com",
  messagingSenderId: "777040405209",
  appId: "1:777040405209:web:b494443808e9c394b914c8",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const firestore = getFirestore(app);
const storage = getStorage(app);
const auth = getAuth();

export { firestore, storage, auth };
