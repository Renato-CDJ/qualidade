// js/auth.js
// Exporta auth utilities para os outros módulos via export
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.13.0/firebase-app.js";
import { getAuth, signInWithEmailAndPassword, signOut as fbSignOut, signInAnonymously } from "https://www.gstatic.com/firebasejs/10.13.0/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.13.0/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyDdLbmyvda93ixUTiGrmIVsFxpJuM_bMsg",
  authDomain: "qualidade-bab05.firebaseapp.com",
  projectId: "qualidade-bab05",
  storageBucket: "qualidade-bab05.firebasestorage.app",
  messagingSenderId: "319259616965",
  appId: "1:319259616965:web:c3f33efa498dfe3956f2ac",
  measurementId: "G-XFYGHTGXMW"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

function saveLocalUser(obj){
  localStorage.setItem('qc_user', JSON.stringify(obj));
  document.body.classList.toggle('admin', !!obj.isAdmin);
}

function getLocalUser(){
  return JSON.parse(localStorage.getItem('qc_user') || 'null');
}

async function doFirebaseEmailLogin(email, password){
  const res = await signInWithEmailAndPassword(auth, email, password);
  return { uid: res.user.uid, name: res.user.email, isAdmin: (email === 'qualidade@grupo') };
}

async function doAnonymousIfPossible(){
  try{
    await signInAnonymously(auth);
  }catch(e){
    // ignore if anonymous disabled
    console.warn('Anonymous sign-in not available', e.message);
  }
}

async function login(username, password){
  // if contains @ -> treat as email and try firebase auth
  if(username.includes('@')){
    try{
      const u = await doFirebaseEmailLogin(username, password);
      saveLocalUser(u);
      return u;
    }catch(err){
      // fallback: if admin email and matching fallback password, create local admin session
      if(username === 'qualidade@grupo.com' && password === 'admin123'){
        const local = { uid: 'local-admin', name: 'Administrador', isAdmin: true, fallback:true };
        saveLocalUser(local);
        return local;
      }
      throw err;
    }
  }else{
    // username without @ -> treat as "user by name"
    // try anonymous Firebase login (if enabled) to satisfy rules; fallback to local session
    try{ await doAnonymousIfPossible(); }catch(e){ /* ignore */ }
    const u = { uid: 'local-' + username.replace(/\s+/g,'_'), name: username, isAdmin: false };
    saveLocalUser(u);
    return u;
  }
}

function logout(){
  try{ fbSignOut(auth); }catch(e){ /* ignore */ }
  localStorage.removeItem('qc_user');
  document.body.classList.remove('admin');
  location.href = 'index.html';
}

function requireAuthRedirect(){
  const u = getLocalUser();
  if(!u) location.href = 'index.html';
  document.body.classList.toggle('admin', !!u?.isAdmin);
  return u;
}

// expose to global for non-module pages if needed
window.QCAuth = { auth, db, login, logout, getLocalUser, requireAuthRedirect };

export { auth, db, login, logout, getLocalUser, requireAuthRedirect };
