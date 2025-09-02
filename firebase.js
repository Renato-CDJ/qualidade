// Importações Firebase (SDK Modular v12.2.1)
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.2.1/firebase-app.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/12.2.1/firebase-analytics.js";
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/12.2.1/firebase-auth.js";
import { getFirestore, collection, addDoc, getDocs } from "https://www.gstatic.com/firebasejs/12.2.1/firebase-firestore.js";

// Configuração do Firebase
const firebaseConfig = {
  apiKey: "AIzaSyAwJGqqCP-Az0417sVG8nwWQnrm13DG5Po",
  authDomain: "qualidade-1b08b.firebaseapp.com",
  projectId: "qualidade-1b08b",
  storageBucket: "qualidade-1b08b.firebasestorage.app",
  messagingSenderId: "114135209119",
  appId: "1:114135209119:web:05b1b352cba2265f6c3eaa",
  measurementId: "G-TR73F48LKX"
};

// Inicialização
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const auth = getAuth(app);
const db = getFirestore(app);

// Login com Google
export async function loginWithGoogle() {
  const provider = new GoogleAuthProvider();
  try {
    await signInWithPopup(auth, provider);
  } catch (err) {
    console.error("Erro no login:", err);
  }
}

// Logout
export async function logout() {
  try {
    await signOut(auth);
  } catch (err) {
    console.error("Erro no logout:", err);
  }
}

// Escutar mudanças de autenticação
export function onAuth(callback) {
  onAuthStateChanged(auth, callback);
}

// CRUD simples para Treinamentos
export async function addTraining(training) {
  try {
    await addDoc(collection(db, "trainings"), training);
  } catch (err) {
    console.error("Erro ao salvar treinamento:", err);
  }
}

export async function getTrainings() {
  const snapshot = await getDocs(collection(db, "trainings"));
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
}

export { auth, db };
