
/* =========================================
   SERVICEHUB - CONFIGURAÇÃO FIREBASE
   ========================================= */

import { initializeApp } from
  "https://www.gstatic.com/firebasejs/12.4.0/firebase-app.js";

import { getAuth } from
  "https://www.gstatic.com/firebasejs/12.4.0/firebase-auth.js";

import { getFirestore } from
  "https://www.gstatic.com/firebasejs/12.4.0/firebase-firestore.js";

// CONFIGURAÇÃO ORIGINAL DO FIREBASE
const firebaseConfig = {
  apiKey: "AIzaSyAKmoz5EnQ95Agvu793RqaiKKyNMU_r-U0",
  authDomain: "servicehub-5b7e2.firebaseapp.com",
  projectId: "servicehub-5b7e2",
  storageBucket: "servicehub-5b7e2.firebasestorage.app",
  messagingSenderId: "659754993284",
  appId: "1:659754993284:web:c032a0c7f2647a8c8ce4d1",
  measurementId: "G-8CGL1PDD9G"
};

// INICIALIZAR FIREBASE
const app = initializeApp(firebaseConfig);

// AUTENTICAÇÃO
const auth = getAuth(app);

// BANCO DE DADOS
const db = getFirestore(app);

// EXPORTAR SERVIÇOS
export { app, auth, db };

console.log("ServiceHub: Firebase inicializado!");
