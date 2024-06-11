import { firebase } from '@react-native-firebase/app';

const firebaseConfig = {
  apiKey: "AIzaSyBww-JGdnFuDfbxEyBuVi0zxFuSzUu4rNI",
  authDomain: "ailatrieuphu-18e27.firebaseapp.com",
  databaseURL: "https://ailatrieuphu-18e27-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "ailatrieuphu-18e27",
  storageBucket: "ailatrieuphu-18e27.appspot.com",
  messagingSenderId: "711718485134",
  appId: "1:711718485134:web:05803d36ede9b96c505ddf",
  measurementId: "G-LZP4NCKFDH"
};

if (!firebase.apps.length) {
  firebase.initializeApp(firebaseConfig);
}

export default firebase;
