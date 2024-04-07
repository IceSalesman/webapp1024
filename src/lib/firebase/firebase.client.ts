// Import the functions you need from the SDKs you need
import { deleteApp, getApp, getApps, initializeApp } from "firebase/app";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries
import { getAuth, setPersistence, inMemoryPersistence } from 'firebase/auth'

import { getStorage } from "@firebase/storage";

import { getFirestore } from "firebase/firestore"


// Your web app's Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyAwkCZ--BTYAZq1jvM_HMBdLD03vM-0XxY",
    authDomain: "volejbols-832d7.firebaseapp.com",
    projectId: "volejbols-832d7",
    storageBucket: "volejbols-832d7.appspot.com",
    messagingSenderId: "1001486154514",
    appId: "1:1001486154514:web:d7a4ed946817a28b0191cb",
    measurementId: "G-Z559M27T22"
};

let firebaseApp;
if (!getApps().length) {
    firebaseApp = initializeApp(firebaseConfig)
} else {
    firebaseApp = getApp()
    deleteApp(firebaseApp)
    firebaseApp = initializeApp(firebaseConfig)
}

export const auth = getAuth(firebaseApp);

export const db = getFirestore(firebaseApp);

export const storage = getStorage(firebaseApp);