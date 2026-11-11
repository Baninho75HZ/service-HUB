
/* =========================================
   SERVICEHUB - MÓDULO DE CLIENTES
   Firebase Firestore
   ========================================= */

import { auth, db } from "../Firebase/firebase-config.js";

import {
    onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/12.4.0/firebase-auth.js";

import {
    collection,
    addDoc,
    updateDoc,
    deleteDoc,
    doc,
    query,
    where,
    onSnapshot,
    serverTimestamp
} from "https://www.gstatic.com/firebasejs/12.4.0/firebase-firestore.js";

// ELEMENTOS DO HTML
const grid = document.getElementById("clientes-grid");
const pesquisa = document.getElementById("pesquisa-cliente");
const mensagem = document.getElementById("mensagem-clientes");

const dialog = document.getElementById("cliente-dialog");
const form = document.getElementById("cliente-form");

const btnNovo = document.getElementById("btn-novo-cliente");
const btnFechar = document.getElementById("btn-fechar-modal");
const btnCancelar = document.getElementById("btn-cancelar");
const btnSalvar = document.getElementById("btn-salvar-cliente");

const modalTitulo = document.getElementById("modal-titulo");

// CAMPOS
const campos = {
    nome: document.getElementById("cliente-nome"),
    telefone: document.getElementById("cliente-telefone"),
    email: document.getElementById("cliente-email"),
    cpf: document.getElementById("cliente-cpf"),
    endereco: document.getElementById("cliente-endereco"),
    observacoes: document.getElementById("cliente-observacoes")
};

// VARIÁVEIS
let usuarioAtual = null;
let clientes = [];
let clienteEditando = null;
let cancelarInscricao = null;

// MENSAGENS
function mostrarMensagem(texto, tipo = "sucesso") {
    mensagem.textContent = texto;
    mensagem.className = `mensagem-clientes ${tipo}`;
}

// PROTEÇÃO CONTRA HTML INJETADO
function escaparHTML(valor = "") {
    return String(valor).replace(/[&<>"']/g, caractere => ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#039;"
    })[caractere]);
}

// ABRIR MODAL
function abrirModal(cliente = null) {
    form.reset();
    clienteEditando = cliente;

    if (cliente) {
        modalTitulo.textContent = "Editar Cliente";
        btnSalvar.textContent = "Salvar Alterações";

        campos.nome.value = cliente.nome || "";
        campos.telefone.value = cliente.telefone || "";
        campos.email.value = cliente.email || "";
        campos.cpf.value = cliente.cpf || "";
        campos.endereco.value = cliente.endereco || "";
        campos.observacoes.value = cliente.observacoes || "";

    } else {
        modalTitulo.textContent = "Novo Cliente";
        btnSalvar.textContent = "Salvar Cliente";
    }

    dialog.showModal();
    campos.nome.focus();
}

// FECHAR MODAL
function fecharModal() {
    dialog.close();
    form.reset();
    clienteEditando = null;
}

// CADASTRAR OU EDITAR
form.addEventListener("submit", async (event) => {
    event.preventDefault();

    if (!usuarioAtual) {
        mostrarMensagem("Usuário não autenticado.", "erro");
        return;
    }

    const dados = {
        nome: campos.nome.value.trim(),
        telefone: campos.telefone.value.trim(),
        email: campos.email.value.trim(),
        cpf: campos.cpf.value.trim(),
        endereco: campos.endereco.value.trim(),
        observacoes: campos.observacoes.value.trim()
    };

    if (!dados.nome || !dados.telefone) {
        mostrarMensagem(
            "Preencha o nome e o telefone.",
            "erro"
        );
        return;
    }

    btnSalvar.disabled = true;
    btnSalvar.textContent = "Salvando...";

    try {

        if (clienteEditando) {

            // ATUALIZAR CLIENTE
            await updateDoc(
                doc(db, "clientes", clienteEditando.id),
                {
                    ...dados,
                    updatedAt: serverTimestamp()
                }
            );

            mostrarMensagem("Cliente atualizado com sucesso!");

        } else {

            // CADASTRAR CLIENTE
            await addDoc(collection(db, "clientes"), {
                ...dados,
                ownerId: usuarioAtual.uid,
                createdAt: serverTimestamp(),
                updatedAt: serverTimestamp()
            });

            mostrarMensagem("Cliente cadastrado com sucesso!");
        }

        fecharModal();

    } catch (error) {
        console.error("Erro ao salvar cliente:", error);

        mostrarMensagem(
            "Não foi possível salvar. Verifique sua conexão e as permissões.",
            "erro"
        );

    } finally {
        btnSalvar.disabled = false;
        btnSalvar.textContent = clienteEditando
            ? "Salvar Alterações"
            : "Salvar Cliente";
    }
});

// LISTAR CLIENTES
function acompanharClientes() {

    const consulta = query(
        collection(db, "clientes"),
        where("ownerId", "==", usuarioAtual.uid)
    );

    cancelarInscricao = onSnapshot(
        consulta,

        (snapshot) => {

            clientes = snapshot.docs.map(documento => ({
                id: documento.id,
                ...documento.data()
            }));

            clientes.sort((a, b) =>
                (a.nome || "").localeCompare(b.nome || "", "pt-BR")
            );

            renderizarClientes();
        },

        (error) => {
            console.error("Erro ao carregar clientes:", error);

            mostrarMensagem(
                "Erro ao carregar clientes. Confira as regras do Firestore.",
                "erro"
            );

            grid.innerHTML = "";
        }
    );
}

// RENDERIZAR CLIENTES
function renderizarClientes() {

    const termo = pesquisa.value.trim().toLowerCase();

    const filtrados = clientes.filter(cliente => {

        const nome = (cliente.nome || "").toLowerCase();
        const telefone = (cliente.telefone || "").toLowerCase();
        const email = (cliente.email || "").toLowerCase();

        return nome.includes(termo)
            || telefone.includes(termo)
            || email.includes(termo);
    });

    if (filtrados.length === 0) {

        grid.innerHTML = `
            <div class="clientes-vazio">
                <h3>Nenhum cliente encontrado</h3>
                <p>Cadastre um cliente ou tente outra pesquisa.</p>
            </div>
        `;

        return;
    }

    grid.innerHTML = filtrados.map(cliente => {

        const nome = escaparHTML(cliente.nome);
        const telefone = escaparHTML(cliente.telefone);
        const email = escaparHTML(cliente.email);
        const endereco = escaparHTML(cliente.endereco);

        const numeroWhatsApp = telefone.replace(/\D/g, "");
        const numeroCompleto = numeroWhatsApp.startsWith("55")
            ? numeroWhatsApp
            : `55${numeroWhatsApp}`;

        return `
            <article class="cliente-card">

                <div class="cliente-header">
                    <div>
                        <h3 class="cliente-nome">${nome}</h3>

                        <div class="cliente-contato">
                            <span>📱 ${telefone}</span>
                            ${email ? `<span>✉️ ${email}</span>` : ""}
                            ${endereco ? `<span>📍 ${endereco}</span>` : ""}
                        </div>
                    </div>
                </div>

                <div class="cliente-acoes">

                    <a
                        href="https://wa.me/${numeroCompleto}"
                        target="_blank"
                        rel="noopener noreferrer"
                        class="btn btn-whatsapp"
                    >
                        Conversar no WhatsApp
                    </a>

                    <a
                        href="novo-orcamento.html?clienteId=${encodeURIComponent(cliente.id)}"
                        class="btn btn-outline"
                    >
                        Novo Orçamento
                    </a>

                    <a
                        href="cliente-detalhes.html?id=${encodeURIComponent(cliente.id)}"
                        class="btn btn-info"
                    >
                        Ver Histórico
                    </a>

                    <button
                        class="btn btn-outline"
                        data-action="editar"
                        data-id="${escaparHTML(cliente.id)}"
                    >
                        Editar
                    </button>

                    <button
                        class="btn btn-excluir"
                        data-action="excluir"
                        data-id="${escaparHTML(cliente.id)}"
                    >
                        Excluir
                    </button>

                </div>

            </article>
        `;

    }).join("");
}

// EDITAR E EXCLUIR
grid.addEventListener("click", async (event) => {

    const botao = event.target.closest("[data-action]");

    if (!botao) return;

    const id = botao.dataset.id;
    const acao = botao.dataset.action;

    const cliente = clientes.find(item => item.id === id);

    if (!cliente) return;

    if (acao === "editar") {
        abrirModal(cliente);
    }

    if (acao === "excluir") {

        const confirmar = confirm(
            `Deseja realmente excluir o cliente ${cliente.nome}?`
        );

        if (!confirmar) return;

        try {

            await deleteDoc(doc(db, "clientes", id));

            mostrarMensagem("Cliente excluído com sucesso!");

        } catch (error) {

            console.error("Erro ao excluir:", error);

            mostrarMensagem(
                "Não foi possível excluir o cliente.",
                "erro"
            );
        }
    }
});

// EVENTOS
btnNovo.addEventListener("click", () => abrirModal());

btnFechar.addEventListener("click", fecharModal);
btnCancelar.addEventListener("click", fecharModal);

pesquisa.addEventListener("input", renderizarClientes);

// AUTENTICAÇÃO
onAuthStateChanged(auth, (user) => {

    if (!user) {
        return;
    }

    usuarioAtual = user;

    if (cancelarInscricao) {
        cancelarInscricao();
    }

    acompanharClientes();

    console.log(
        "ServiceHub: módulo de clientes conectado!",
        user.uid
    );
});
