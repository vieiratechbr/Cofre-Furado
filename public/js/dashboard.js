import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getAuth, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";
import { getFirestore, doc, getDoc } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore-lite.js";
import { firebaseConfig } from "./firebase-keys.js";

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

document.addEventListener("DOMContentLoaded", () => {
    
    let planoUsuario = "Furado"; 

    onAuthStateChanged(auth, async (usuarioLogado) => {
        if (usuarioLogado) {
            try {
                
                const usuarioRef = doc(db, "usuarios", usuarioLogado.uid);
                const usuarioDoc = await getDoc(usuarioRef);
                
                if (usuarioDoc.exists()) {
                    const dados = usuarioDoc.data();
                    planoUsuario = dados.plano || "Furado";
                    
                    const saudacaoEl = document.getElementById("saudacao-usuario");
                    if (saudacaoEl) {
                        const primeiroNome = dados.nome.split(" ")[0];
                        let iconeOuro = planoUsuario === "Ouro" ? "👑" : "";
                        saudacaoEl.innerHTML = `Olá, ${primeiroNome}! <span class="badge-plano plano-${planoUsuario}">${planoUsuario} ${iconeOuro}</span>`;
                    }
                }
            } catch (erro) {
                console.error("Erro ao buscar dados do plano:", erro);
            }
        } else {
            window.location.href = "login.html"; 
        }
    });

    const menuCartoes = document.getElementById("menu-cartoes");
    if (menuCartoes) {
        menuCartoes.addEventListener("click", (evento) => {
            evento.preventDefault();
            if (planoUsuario !== "Ouro") {
                alert("🔒 Recurso Premium! O Controle de Cartões de Crédito é exclusivo do Plano Ouro. Faça o upgrade para acessar.");
                window.location.href = "planos.html";
            } else {
                alert("Bem-vindo aos seus Cartões de Crédito!");
            }
        });
    }

    const selectCategoria = document.getElementById("cat-transacao");
    if (selectCategoria) {
        selectCategoria.addEventListener("change", (evento) => {
            if (evento.target.value === "nova_categoria") {
                if (planoUsuario === "Furado") {
                    alert("🔒 Recurso Bloqueado! Criar categorias personalizadas exige o Plano Plástico ou Ouro.");
                    selectCategoria.value = "Outros"; 
                    window.location.href = "planos.html";
                } else {
                    const novaCat = prompt("Digite o nome da sua nova categoria personalizada:");
                    if (novaCat) {
                       
                        const option = document.createElement("option");
                        option.value = novaCat;
                        option.text = `⭐ ${novaCat}`;
                        selectCategoria.add(option);
                        selectCategoria.value = novaCat;
                    } else {
                        selectCategoria.value = "Outros";
                    }
                }
            }
        });
    }

    const btnSair = document.getElementById("btn-sair");
    if (btnSair) {
        btnSair.addEventListener("click", () => {
            signOut(auth).then(() => {
                localStorage.clear();
                window.location.href = "../index.html";
            });
        });
    }

    const modal = document.getElementById("modal-transacao");
    const btnAbrirModal = document.getElementById("btn-abrir-modal");
    const btnFecharModal = document.getElementById("btn-fechar-modal");
    const inputData = document.getElementById("data-transacao");

    if (btnAbrirModal && modal) {
        btnAbrirModal.addEventListener("click", () => {
            modal.classList.remove("oculto");
            if (inputData) inputData.value = new Date().toISOString().split('T')[0];
        });
    }
    if (btnFecharModal && modal) {
        btnFecharModal.addEventListener("click", () => modal.classList.add("oculto"));
    }

    const formTransacao = document.getElementById("form-transacao");
    const tbodyTransacoes = document.getElementById("tbody-transacoes");
    const saldoAtualEl = document.getElementById("saldo-atual");
    const receitasMesEl = document.getElementById("receitas-mes");
    const despesasMesEl = document.getElementById("despesas-mes");
    let transacoes = JSON.parse(localStorage.getItem("transacoes_cofre_furado")) || [];
    let meuGrafico = null;

    const formatarMoeda = (valor) => new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(valor);
    const formatarData = (dataString) => dataString.split('-').reverse().join('/');

    const atualizarUI = () => {
        if (!tbodyTransacoes || !saldoAtualEl) return;
        
        tbodyTransacoes.innerHTML = transacoes.length === 0 ? 
            `<tr><td colspan="5" style="text-align: center; color: #A0A0A0; padding: 30px;">Nenhuma transação cadastrada.</td></tr>` : "";
            
        transacoes.forEach((t, index) => {
            const isReceita = t.tipo === 'receita';
            tbodyTransacoes.innerHTML += `
                <tr>
                    <td>${t.descricao}</td>
                    <td>${t.categoria || "Outros"}</td>
                    <td>${formatarData(t.data)}</td>
                    <td class="${isReceita ? 'positivo' : 'negativo'}">${isReceita ? '+' : '-'} ${formatarMoeda(t.valor)}</td>
                    <td><button onclick="excluirTransacao(${index})" style="background:none;border:none;color:#ff4d4d;cursor:pointer;">Excluir</button></td>
                </tr>`;
        });

        const receitas = transacoes.filter(t => t.tipo === "receita").reduce((acc, t) => acc + t.valor, 0);
        const despesas = transacoes.filter(t => t.tipo === "despesa").reduce((acc, t) => acc + t.valor, 0);
        const saldo = receitas - despesas;

        receitasMesEl.textContent = `+ ${formatarMoeda(receitas)}`;
        despesasMesEl.textContent = `- ${formatarMoeda(despesas)}`;
        saldoAtualEl.textContent = formatarMoeda(saldo);
        saldoAtualEl.className = `valor ${saldo < 0 ? 'negativo' : 'positivo'}`;

        const canvas = document.getElementById('graficoCategorias');
        if (!canvas) return;
        const categorias = {};
        transacoes.filter(t => t.tipo === 'despesa').forEach(t => {
            const cat = t.categoria || "Outros";
            categorias[cat] = (categorias[cat] || 0) + t.valor;
        });

        if (meuGrafico) meuGrafico.destroy();
        meuGrafico = new Chart(canvas.getContext('2d'), {
            type: 'doughnut',
            data: {
                labels: Object.keys(categorias).length ? Object.keys(categorias) : ['Sem despesas'],
                datasets: [{
                    data: Object.values(categorias).length ? Object.values(categorias) : [1],
                    backgroundColor: Object.values(categorias).length ? ['#ff4d4d', '#ffcc00', '#08d884', '#3399ff', '#9933ff'] : ['#333'],
                    borderWidth: 0
                }]
            },
            options: { responsive: true, maintainAspectRatio: false, cutout: '75%', plugins: { legend: { position: 'bottom', labels: { color: '#A0A0A0' } } } }
        });
    };

    window.excluirTransacao = (index) => {
        transacoes.splice(index, 1);
        localStorage.setItem("transacoes_cofre_furado", JSON.stringify(transacoes));
        atualizarUI();
    };

    if (formTransacao) {
        formTransacao.addEventListener("submit", (evento) => {
            evento.preventDefault();
            transacoes.push({
                tipo: document.getElementById("tipo-transacao").value,
                descricao: document.getElementById("desc-transacao").value,
                categoria: document.getElementById("cat-transacao").value,
                valor: parseFloat(document.getElementById("valor-transacao").value),
                data: document.getElementById("data-transacao").value
            });
            localStorage.setItem("transacoes_cofre_furado", JSON.stringify(transacoes));
            atualizarUI();
            modal.classList.add("oculto");
            formTransacao.reset();
        });
    }

    setTimeout(atualizarUI, 500); 
});