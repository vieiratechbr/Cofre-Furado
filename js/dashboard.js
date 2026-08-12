const modal = document.getElementById("modal-transacao");
const btnAbrirModal = document.getElementById("btn-abrir-modal");
const btnFecharModal = document.getElementById("btn-fechar-modal");

btnAbrirModal.addEventListener("click", () => modal.classList.remove("oculto"));
btnFecharModal.addEventListener("click", () => modal.classList.add("oculto"));
modal.addEventListener("click", (evento) => {
    if (evento.target === modal) modal.classList.add("oculto");
});

const formTransacao = document.getElementById("form-transacao");
const tbodyTransacoes = document.getElementById("tbody-transacoes");
const saldoAtualEl = document.getElementById("saldo-atual");
const receitasMesEl = document.getElementById("receitas-mes");
const despesasMesEl = document.getElementById("despesas-mes");

let transacoes = JSON.parse(localStorage.getItem("transacoes_cofre_furado")) || [];

const formatarMoeda = (valor) => {
    return new Intl.NumberFormat("pt-BR", {
        style: "currency",
        currency: "BRL"
    }).format(valor);
};

const formatarData = (dataString) => {
    const [ano, mes, dia] = dataString.split('-');
    return `${dia}/${mes}/${ano}`;
};

const atualizarResumo = () => {
    const receitas = transacoes
        .filter(t => t.tipo === "receita")
        .reduce((soma, t) => soma + t.valor, 0);

    const despesas = transacoes
        .filter(t => t.tipo === "despesa")
        .reduce((soma, t) => soma + t.valor, 0);

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

const renderizarTabela = () => {
    tbodyTransacoes.innerHTML = ""; 

    transacoes.forEach((t, index) => {
        const tr = document.createElement("tr");

        const tdDescricao = document.createElement("td");
        tdDescricao.textContent = t.descricao;

        const tdCategoria = document.createElement("td");
        tdCategoria.textContent = t.categoria;

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

const excluirTransacao = (index) => {
    transacoes.splice(index, 1); 
    localStorage.setItem("transacoes_cofre_furado", JSON.stringify(transacoes)); 
    atualizarUI(); 
};

const atualizarUI = () => {
    renderizarTabela();
    atualizarResumo();
};

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

atualizarUI();