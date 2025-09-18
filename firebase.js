// firebase.js
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-analytics.js";

// Configuração do Firebase
const firebaseConfig = {
  apiKey: "AIzaSyDdLbmyvda93ixUTiGrmIVsFxpJuM_bMsg",
  authDomain: "qualidade-bab05.firebaseapp.com",
  projectId: "qualidade-bab05",
  storageBucket: "qualidade-bab05.firebasestorage.app",
  messagingSenderId: "319259616965",
  appId: "1:319259616965:web:c3f33efa498dfe3956f2ac",
  measurementId: "G-XFYGHTGXMW"
};

// Inicializa Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const analytics = getAnalytics(app);

// Exporta para o restante do projeto
export { app, auth, db, analytics };
