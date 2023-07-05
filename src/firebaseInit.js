// create firebase config here and export the db object
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

// TODO: Replace the following with your app's Firebase project configuration
const firebaseConfig = {
  apiKey: "AIzaSyDiwbYg6Ivcyjase5_bhhuX4BqlfwMQwK0",
  authDomain: "react-learn-http-60c29.firebaseapp.com",
  databaseURL: "https://react-learn-http-60c29-default-rtdb.firebaseio.com",
  projectId: "react-learn-http-60c29",
  storageBucket: "react-learn-http-60c29.appspot.com",
  messagingSenderId: "475365465530",
  appId: "1:475365465530:web:3818d70a8e2c29b4d89183"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);

