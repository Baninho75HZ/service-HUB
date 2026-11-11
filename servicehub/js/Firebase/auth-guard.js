// Importe a instância do auth configurada no seu firebase-config.js
import { auth } from './firebase-config.js';
import { onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

// Monitora o estado de autenticação do usuário em tempo real
onAuthStateChanged(auth, (user) => {
    if (user) {
        // Usuário está logado! Vamos atualizar os elementos da UI com os dados dele, se existirem
        console.log("Usuário autenticado:", user.email);

        // Atualiza o nome ou email do usuário no header, caso haja um elemento com o ID 'user-name-display'
        const userNameElement = document.getElementById('user-name-display');
        if (userNameElement) {
            userNameElement.textContent = user.displayName || user.email;
        }

    } else {
        // Usuário NÃO está logado. Redireciona para a página de login
        console.log("Usuário não autenticado. Redirecionando para o login...");
        window.location.href = '../pages/login.html';
    }
});

// Função opcional de Logout caso queira adicionar um botão de sair depois
window.fazerLogout = function() {
    signOut(auth).then(() => {
        window.location.href = '../pages/login.html';
    }).catch((error) => {
        console.error("Erro ao fazer logout:", error);
    });
};