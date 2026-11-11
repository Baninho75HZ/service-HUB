/* =========================================
   SERVICEHUB - SISTEMA DE LOGIN
   Firebase Authentication
   ========================================= */

import { auth } from "./firebase-config.js";

import {
  signInWithEmailAndPassword,
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/12.4.0/firebase-auth.js";

console.log("ServiceHub: Login.js foi iniciado com sucesso!");

// CAMINHO DO DASHBOARD (Subindo um nível para sair da pasta js e entrar em pages/)
const dashboardURL = "../pages/dashboard.html";

// FUNÇÃO PARA EXIBIR MENSAGENS
function mostrarMensagem(texto, tipo = "error") {
  const message = document.getElementById("login-message");
  if (!message) {
    console.warn("Elemento 'login-message' não encontrado no HTML.");
    return;
  }

  message.textContent = texto;
  message.className = tipo === "success" ? "login-success" : "login-error";
}

// FUNÇÃO PARA REDIRECIONAR
function abrirDashboard() {
  console.log("Redirecionando para o dashboard...");
  window.location.replace(dashboardURL);
}

// VERIFICAR SE O USUÁRIO JÁ ESTÁ LOGADO
onAuthStateChanged(auth, (user) => {
  if (user) {
    console.log("Usuário já autenticado:", user.uid);
    abrirDashboard();
  } else {
    console.log("Nenhum usuário autenticado no momento.");
  }
});

// CONFIGURAR O EVENTO QUANDO O DOM ESTIVER PRONTO
document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("login-form");
  const button = document.getElementById("btn-login");

  if (!form || !button) {
    console.error("ERRO CRÍTICO: O formulário ('login-form') ou o botão ('btn-login') não foram encontrados no HTML do login!");
    return;
  }

  // EVENTO DE SUBMIT DO FORMULÁRIO
  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    console.log("1. Botão de entrar acionado, formulário interceptado.");

    const emailInput = document.getElementById("email");
    const senhaInput = document.getElementById("senha");

    if (!emailInput || !senhaInput) {
      mostrarMensagem("Campos de e-mail ou senha não encontrados.");
      return;
    }

    const email = emailInput.value.trim();
    const senha = senhaInput.value;

    if (!email || !senha) {
      mostrarMensagem("Por favor, preencha o e-mail e a senha.");
      return;
    }

    // ESTADO DE CARREGAMENTO
    button.disabled = true;
    button.textContent = "Entrando...";
    mostrarMensagem("Conectando ao Firebase...", "success");

    try {
      console.log("2. Enviando requisição para o Firebase Auth...");

      const resultado = await signInWithEmailAndPassword(auth, email, senha);

      console.log("3. Sucesso! UID:", resultado.user.uid);
      mostrarMensagem("Login realizado com sucesso! Abrindo painel...", "success");

      abrirDashboard();

    } catch (error) {
      console.error("ERRO NO FIREBASE AUTH:", error.code, error.message);

      switch (error.code) {
        case "auth/invalid-credential":
        case "auth/wrong-password":
        case "auth/user-not-found":
          mostrarMensagem("E-mail ou senha incorretos.");
          break;
        case "auth/invalid-email":
          mostrarMensagem("Formato de e-mail inválido.");
          break;
        case "auth/too-many-requests":
          mostrarMensagem("Muitas tentativas erradas. Tente mais tarde.");
          break;
        case "auth/network-request-failed":
          mostrarMensagem("Erro de conexão com a internet.");
          break;
        default:
          mostrarMensagem("Erro ao entrar: " + (error.code || "desconhecido"));
      }

      button.disabled = false;
      button.textContent = "Entrar no Sistema";
    }
  });
});