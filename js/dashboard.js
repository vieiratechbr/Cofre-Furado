document.addEventListener("DOMContentLoaded", () => {
    
    const saudacaoEl = document.getElementById("saudacao-usuario");
    if (saudacaoEl) {
        const nomeCompleto = localStorage.getItem("cofre_furado_nome_usuario") || "Usuário";
        const primeiroNome = nomeCompleto.split(" ")[0]; 
        saudacaoEl.textContent = `Olá, ${primeiroNome}! 👋`;
    }

    const btnSair = document.getElementById("btn-sair");
    if (btnSair) {
        btnSair.addEventListener("click", () => {
            localStorage.removeItem("cofre_furado_nome_usuario");
            window.location.href = "../index.html";
        });
    }

    const modal = document.getElementById("modal-transacao");
    const btnAbrirModal = document.getElementById("btn-abrir-modal");
    const btnFecharModal = document.getElementById("btn-fechar-modal");
    const inputData = document.getElementById("data-transacao");

    if (btnAbrirModal && modal) {
        btnAbrirModal.addEventListener("click", () => {
            modal.classList.remove("oculto");
            if (inputData) {
                const hoje = new Date().toISOString().split('T')[0];
                inputData.value = hoje;
            }
        });
    }

    if (btnFecharModal && modal) {
        btnFecharModal.addEventListener("click", () => modal.classList.add("oculto"));
    }

    if (modal) {
        modal.addEventListener("click", (evento) => {
            if (evento.target === modal) modal.classList.add("oculto");
        });
    }

    const formTransacao = document.getElementById("form-transacao");
    const tbodyTransacoes = document.getElementById("tbody-transacoes");
    const saldoAtualEl = document.getElementById("saldo-atual");
    const receitasMesEl = document.getElementById("receitas-mes");
    const despesasMesEl = document.getElementById("despesas-mes");
    
    let transacoes = JSON.parse(localStorage.getItem("transacoes_cofre_furado")) || [];
    let meuGrafico = null; 

    const formatarMoeda = (valor) => {
        return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(valor);
    };

    const formatarData = (dataString) => {
        const [ano, mes, dia] = dataString.split('-');
        return `${dia}/${mes}/${ano}`;
    };

    const atualizarResumo = () => {
        if (!saldoAtualEl || !receitasMesEl || !despesasMesEl) return;

        const receitas = transacoes.filter(t => t.tipo === "receita").reduce((acc, t) => acc + t.valor, 0);
        const despesas = transacoes.filter(t => t.tipo === "despesa").reduce((acc, t) => acc + t.valor, 0);
        const saldo = receitas - despesas;

        receitasMesEl.textContent = `+ ${formatarMoeda(receitas)}`;
        despesasMesEl.textContent = `- ${formatarMoeda(despesas)}`;
        saldoAtualEl.textContent = formatarMoeda(saldo);

        if (saldo < 0) {
            saldoAtualEl.classList.remove("positivo");
            saldoAtualEl.classList.add("negativo");
        } else {
            saldoAtualEl.classList.remove("negativo");
            saldoAtualEl.classList.add("positivo");
        }
    };

    const atualizarGrafico = () => {
        const canvas = document.getElementById('graficoCategorias');
        if (!canvas) return; 

        const despesas = transacoes.filter(t => t.tipo === 'despesa');
        
        const categorias = {};
        despesas.forEach(t => {
            
            let nomeCategoria = t.categoria.trim();
            if (nomeCategoria === "") {
                nomeCategoria = "Outros"; 
            }

            if (categorias[nomeCategoria]) {
                categorias[nomeCategoria] += t.valor;
            } else {
                categorias[nomeCategoria] = t.valor;
            }
        });

        const labels = Object.keys(categorias);
        const data = Object.values(categorias);

        if (meuGrafico) {
            meuGrafico.destroy();
        }

        const ctx = canvas.getContext('2d');
        const coresVibrantes = ['#ff4d4d', '#ffcc00', '#08d884', '#3399ff', '#9933ff', '#ff9999', '#00b3b3'];

        meuGrafico = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: labels.length > 0 ? labels : ['Sem despesas'], 
                datasets: [{
                    data: data.length > 0 ? data : [1], 
                    backgroundColor: data.length > 0 ? coresVibrantes : ['#333333'],
                    borderWidth: 0,
                    hoverOffset: 6
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                cutout: '75%', 
                plugins: {
                    legend: {
                        position: 'bottom',
                        labels: {
                            color: '#A0A0A0',
                            font: { family: "'Jost', sans-serif", size: 13 },
                            padding: 20 
                        }
                    },
                    tooltip: {
                        backgroundColor: '#1E1E1E',
                        titleFont: { family: "'Jost', sans-serif", size: 14 },
                        bodyFont: { family: "'Jost', sans-serif", size: 14 },
                        padding: 12,
                        cornerRadius: 8,
                        callbacks: {
                           
                            label: function(context) {
                                let label = context.label || '';
                                if (label) {
                                    label += ': ';
                                }
                                if (context.parsed !== null) {
                                    label += new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(context.parsed);
                                }
                                return label;
                            }
                        }
                    }
                }
            }
        });
    };

    window.excluirTransacao = (index) => { 
        transacoes.splice(index, 1);
        localStorage.setItem("transacoes_cofre_furado", JSON.stringify(transacoes));
        atualizarUI();
    };

    const renderizarTabela = () => {
        if (!tbodyTransacoes) return;
        
        tbodyTransacoes.innerHTML = "";

        if (transacoes.length === 0) {
            tbodyTransacoes.innerHTML = `<tr><td colspan="5" style="text-align: center; color: #A0A0A0; padding: 30px;">Nenhuma transação cadastrada ainda. Comece a controlar suas finanças!</td></tr>`;
            return;
        }

        transacoes.forEach((t, index) => {
            const tr = document.createElement("tr");

            const tdDescricao = document.createElement("td");
            tdDescricao.textContent = t.descricao;

            const tdCategoria = document.createElement("td");
            tdCategoria.textContent = t.categoria.trim() === "" ? "Outros" : t.categoria;

            const tdData = document.createElement("td");
            tdData.textContent = formatarData(t.data);

            const tdValor = document.createElement("td");
            tdValor.textContent = t.tipo === 'receita' ? `+ ${formatarMoeda(t.valor)}` : `- ${formatarMoeda(t.valor)}`;
            tdValor.classList.add(t.tipo === 'receita' ? "positivo" : "negativo");

            const tdAcoes = document.createElement("td");
            const btnExcluir = document.createElement("button");
            btnExcluir.innerHTML = `
                <svg width="20" height="20" fill="none" stroke="#ff4d4d" stroke-width="2" viewBox="0 0 24 24" style="cursor: pointer;">
                    <path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                </svg>
            `;
            btnExcluir.style.background = "none";
            btnExcluir.style.border = "none";
            btnExcluir.onclick = () => excluirTransacao(index); 
            tdAcoes.appendChild(btnExcluir);

            tr.appendChild(tdDescricao);
            tr.appendChild(tdCategoria);
            tr.appendChild(tdData);
            tr.appendChild(tdValor);
            tr.appendChild(tdAcoes);

            tbodyTransacoes.appendChild(tr);
        });
    };

    const atualizarUI = () => {
        renderizarTabela();
        atualizarResumo();
        atualizarGrafico(); 
    };

    if (formTransacao) {
        formTransacao.addEventListener("submit", (evento) => {
            evento.preventDefault();
            
            const tipo = document.getElementById("tipo-transacao").value;
            const descricao = document.getElementById("desc-transacao").value;
            const categoria = document.getElementById("cat-transacao").value;
            const valor = parseFloat(document.getElementById("valor-transacao").value);
            const data = document.getElementById("data-transacao").value;

            const novaTransacao = { tipo, descricao, categoria, valor, data };

            transacoes.push(novaTransacao);
            localStorage.setItem("transacoes_cofre_furado", JSON.stringify(transacoes));

            atualizarUI();
            modal.classList.add("oculto");
            formTransacao.reset();
        });
    }

    atualizarUI();
});