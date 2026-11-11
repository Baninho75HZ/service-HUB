/* =========================================
   SERVICEHUB - SCRIPT PRINCIPAL (app.js)
   ========================================= */

document.addEventListener("DOMContentLoaded", () => {
    
    // 1. Simulação de Login
    const loginForm = document.querySelector("#login-form");
    if (loginForm) {
        loginForm.addEventListener("submit", (e) => {
            e.preventDefault();
            // Simula autenticação bem-sucedida e redireciona para o dashboard
            window.location.href = "dashboard.html";
        });
    }

    // 2. Comportamento de Concluir Serviço (Alimenta o Financeiro)
    const btnConcluirServicos = document.querySelectorAll(".btn-concluir-os");
    btnConcluirServicos.forEach(button => {
        button.addEventListener("click", (e) => {
            const card = e.target.closest(".os-card");
            const tituloOS = card.querySelector("h3").innerText;
            
            const confirmar = confirm(`Deseja concluir o serviço "${tituloOS}" e registrar o valor no Financeiro?`);
            if (confirmar) {
                alert("Serviço concluído com sucesso e lançado nas receitas!");
                // Aqui você pode atualizar o status visual via JS
                const statusTag = card.querySelector(".status-tag");
                statusTag.className = "status-tag status-success";
                statusTag.innerText = "Concluído e Pago";
                e.target.remove(); // Remove o botão de concluir
            }
        });
    });

    // 3. Filtros Rápidos de Status (Orçamentos / Serviços)
    const filterButtons = document.querySelectorAll(".filter-btn");
    filterButtons.forEach(btn => {
        btn.addEventListener("click", (e) => {
            filterButtons.forEach(b => b.classList.remove("active"));
            e.target.classList.add("active");
            
            // Lógica de filtragem visual pode ser expandida aqui
            const filtroSelecionado = e.target.innerText;
            console.log(`Filtrando por: ${filtroSelecionado}`);
        });
    });

});