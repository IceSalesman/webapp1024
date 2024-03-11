// Import the functions you need from the SDKs you need
import { deleteApp, getApp, getApps, initializeApp } from "firebase/app";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries
import { getAuth, setPersistence, inMemoryPersistence } from 'firebase/auth'

// Your web app's Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyC_cYjHL0kpIHih5EHJ5pmFgoWVmdaV2Io",
    databaseURL: "https://volejbola-majaslapa-default-rtdb.europe-west1.firebasedatabase.app",
    authDomain: "volejbola-majaslapa.firebaseapp.com",
    projectId: "volejbola-majaslapa",
    storageBucket: "volejbola-majaslapa.appspot.com",
    messagingSenderId: '301976300436',
    appId: '1:301976300436:web:49ee3797e790361be2fd81'
};

// Initialize Firebas\
let firebaseApp;
if (!getApps().length) {
    firebaseApp = initializeApp(firebaseConfig)
} else {
    firebaseApp = getApp()
    deleteApp(firebaseApp)
    firebaseApp = initializeApp(firebaseConfig)
}

export const auth = getAuth(firebaseApp)