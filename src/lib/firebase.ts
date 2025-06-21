import { initializeApp, getApps } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyDPC4ZcGtZ9tUI-pZuP1w8AqgLoIhlIXig",
  authDomain: "pushgrade-801f4.firebaseapp.com",
  projectId: "pushgrade-801f4",
  storageBucket: "pushgrade-801f4.appspot.com",
  messagingSenderId: "970518860194",
  appId: "1:970518860194:web:287408f85d1945798562fb",
  measurementId: "G-47KWT64CPD"
};

const app = getApps().length ? getApps()[0] : initializeApp(firebaseConfig);
const analytics = typeof window !== "undefined" ? getAnalytics(app) : null;
const auth = getAuth(app);

export { app, analytics, auth }; 