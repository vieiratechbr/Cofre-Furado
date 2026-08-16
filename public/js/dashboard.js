import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getAuth, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";
import { getFirestore, doc, getDoc } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore-lite.js";
import { firebaseConfig } from "./firebase-keys.js";

function mostrarAlerta(mensagem, callback) {
    const overlay = document.createElement("div");
    overlay.className = "custom-dialog-overlay";
    overlay.innerHTML = `
        <div class="custom-dialog-box">
            <p class="custom-dialog-message">${mensagem}</p>
            <div class="custom-dialog-buttons">
                <button class="btn-dialog btn-dialog-confirm">OK</button>
            </div>
        </div>
    `;
    document.body.appendChild(overlay);
    
    overlay.querySelector(".btn-dialog-confirm").addEventListener("click", () => {
        overlay.remove();
        if(callback) callback();
    });
}

function mostrarConfirmacao(mensagem, txtConfirmar, btnClass, callback) {
    const overlay = document.createElement("div");
    overlay.className = "custom-dialog-overlay";
    overlay.innerHTML = `
        <div class="custom-dialog-box">
            <p class="custom-dialog-message">${mensagem}</p>
            <div class="custom-dialog-buttons">
                <button class="btn-dialog btn-dialog-cancel">Cancelar</button>
                <button class="btn-dialog ${btnClass}">${txtConfirmar}</button>
            </div>
        </div>
    `;
    document.body.appendChild(overlay);
    
    overlay.querySelector(".btn-dialog-cancel").addEventListener("click", () => {
        overlay.remove();
    });
    
    overlay.querySelector(`.${btnClass}`).addEventListener("click", () => {
        overlay.remove();
        if(callback) callback();
    });
}

function mostrarPrompt(mensagem, callback) {
    const overlay = document.createElement("div");
    overlay.className = "custom-dialog-overlay";
    overlay.innerHTML = `
        <div class="custom-dialog-box">
            <p class="custom-dialog-message">${mensagem}</p>
            <input type="text" id="custom-prompt-input" class="custom-dialog-input" placeholder="Digite aqui..." autocomplete="off">
            <div class="custom-dialog-buttons" style="margin-top: 20px;">
                <button class="btn-dialog btn-dialog-cancel">Cancelar</button>
                <button class="btn-dialog btn-dialog-confirm">Salvar</button>
            </div>
        </div>
    `;
    document.body.appendChild(overlay);
    
    const input = overlay.querySelector("#custom-prompt-input");
    input.focus();

    overlay.querySelector(".btn-dialog-cancel").addEventListener("click", () => {
        overlay.remove();
        if(callback) callback(null);
    });
    
    overlay.querySelector(".btn-dialog-confirm").addEventListener("click", () => {
        const val = input.value.trim();
        overlay.remove();
        if(callback) callback(val !== "" ? val : null);
    });
}

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
                        if(saudacaoEl.innerHTML.includes("Carregando")) {
                            const primeiroNome = dados.nome.split(" ")[0];
                            let iconeOuro = planoUsuario === "Ouro" ? " 👑" : "";
                            saudacaoEl.innerHTML = `Olá, ${primeiroNome}! <span class="badge-plano plano-${planoUsuario}">${planoUsuario} ${iconeOuro}</span>`;
                        } else {
                            let iconeOuro = planoUsuario === "Ouro" ? " 👑" : "";
                            saudacaoEl.innerHTML += ` <span class="badge-plano plano-${planoUsuario}" style="font-size: 16px;">${planoUsuario} ${iconeOuro}</span>`;
                        }
                    }

                    const inputAnexo = document.getElementById("anexo-transacao");
                    if (inputAnexo) {
                        if (planoUsuario === "Ouro") {
                            inputAnexo.classList.remove("input-premium-bloqueado");
                        } else {
                            inputAnexo.addEventListener("click", (e) => {
                                e.preventDefault();
                                mostrarAlerta("👑 Recurso Premium! Anexar recibos é uma funcionalidade exclusiva do plano Cofre de Ouro.", () => {
                                    document.body.classList.add("fade-out");
                                    setTimeout(() => window.location.href = "planos.html", 300);
                                });
                            });
                        }
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
            if (planoUsuario !== "Ouro") {
                evento.preventDefault(); 
                mostrarAlerta("🔒 Recurso Premium! O Controle de Cartões de Crédito é exclusivo do Plano Ouro. Faça o upgrade para acessar.", () => {
                    document.body.classList.add("fade-out");
                    setTimeout(() => window.location.href = "planos.html", 300);
                });
            }
        });
    }

    const selectCategoria = document.getElementById("cat-transacao");
    if (selectCategoria) {
        selectCategoria.addEventListener("change", (evento) => {
            if (evento.target.value === "nova_categoria") {
                if (planoUsuario === "Furado") {
                    mostrarAlerta("🔒 Recurso Bloqueado! Criar categorias personalizadas exige o Plano Plástico ou Ouro.", () => {
                        selectCategoria.value = "Outros"; 
                        document.body.classList.add("fade-out");
                        setTimeout(() => window.location.href = "planos.html", 300);
                    });
                } else {
                    selectCategoria.value = "Outros"; 
                    mostrarPrompt("Digite o nome da sua nova categoria personalizada:", (novaCat) => {
                        if (novaCat) {
                            const option = document.createElement("option");
                            option.value = novaCat;
                            option.text = `📌 ${novaCat}`;
                            selectCategoria.add(option);
                            selectCategoria.value = novaCat;
                        }
                    });
                }
            }
        });
    }

    const btnSair = document.getElementById("btn-sair");
    if (btnSair) {
        btnSair.addEventListener("click", () => {
            signOut(auth).then(() => {
                localStorage.clear();
                document.body.classList.add("fade-out");
                setTimeout(() => window.location.href = "../index.html", 300);
            });
        });
    }

    const modalTransacao = document.getElementById("modal-transacao");
    const btnAbrirModalTransacao = document.getElementById("btn-abrir-modal");
    const btnFecharModalTransacao = document.getElementById("btn-fechar-modal");
    const inputData = document.getElementById("data-transacao");

    if (btnAbrirModalTransacao && modalTransacao) {
        btnAbrirModalTransacao.addEventListener("click", () => {
            modalTransacao.classList.remove("oculto");
            if (inputData) inputData.value = new Date().toISOString().split('T')[0];
        });
    }
    if (btnFecharModalTransacao && modalTransacao) {
        btnFecharModalTransacao.addEventListener("click", () => modalTransacao.classList.add("oculto"));
    }

    const formTransacao = document.getElementById("form-transacao");
    const tbodyTransacoes = document.getElementById("tbody-transacoes");
    const saldoAtualEl = document.getElementById("saldo-atual");
    const receitasMesEl = document.getElementById("receitas-mes");
    const despesasMesEl = document.getElementById("despesas-mes");
    const metasContainer = document.getElementById("metas-container");

    let transacoes = JSON.parse(localStorage.getItem("transacoes_cofre_furado")) || [];
    let metas = JSON.parse(localStorage.getItem("metas_cofre_furado")) || [];
    let meuGrafico = null;

    const formatarMoeda = (valor) => new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(valor);
    const formatarData = (dataString) => dataString.split('-').reverse().join('/');

    const atualizarOpcoesCategoria = () => {
        if (!selectCategoria) return;
        
        Array.from(selectCategoria.options).forEach(opt => {
            if (opt.value.startsWith("Meta: ")) opt.remove();
        });

        metas.forEach(m => {
            const option = document.createElement("option");
            option.value = `Meta: ${m.nome}`;
            option.text = `🎯 Meta: ${m.nome}`;
            selectCategoria.add(option);
        });
    };

    const atualizarMetasUI = () => {
        atualizarOpcoesCategoria(); 

        if (!metasContainer) return;

        if (metas.length === 0) {
            metasContainer.innerHTML = `
                <section class="tabela-transacoes box-vazia" style="grid-column: 1 / -1;">
                    <h2 class="titulo-destaque">Nenhuma meta ainda!</h2>
                    <p class="texto-cinza">Comece a planejar seus sonhos clicando em "+ Nova Meta".</p>
                </section>`;
            return;
        }

        metasContainer.innerHTML = "";
        metas.forEach((m, index) => {
            const porcentagemRaw = (m.atual / m.alvo) * 100;
            const porcentagem = Math.min(porcentagemRaw, 100).toFixed(1);
            
            metasContainer.innerHTML += `
                <div class="meta-card">
                    <h3>${m.nome}</h3>
                    <div class="meta-valores">
                        <span>Guardado: R$ ${parseFloat(m.atual).toFixed(2)}</span>
                        <span>Alvo: R$ ${parseFloat(m.alvo).toFixed(2)}</span>
                    </div>
                    <div class="progress-bg">
                        <div class="progress-fill" style="width: ${porcentagem}%"></div>
                    </div>
                    <p class="progress-text">${porcentagem}% concluído</p>
                    <button onclick="excluirMeta(${index})" class="btn-excluir-meta">Excluir Meta</button>
                </div>
            `;
        });
    };

    window.excluirMeta = (index) => {
        mostrarConfirmacao("Tem certeza que deseja excluir esta meta? O histórico de transações continuará salvo.", "Excluir Meta", "btn-dialog-danger", () => {
            metas.splice(index, 1);
            localStorage.setItem("metas_cofre_furado", JSON.stringify(metas));
            atualizarMetasUI();
        });
    };

    const atualizarUI = () => {
        if (!tbodyTransacoes || !saldoAtualEl) return;
        
        tbodyTransacoes.innerHTML = transacoes.length === 0 ? 
            `<tr><td colspan="5" style="text-align: center; color: #A0A0A0; padding: 30px;">Nenhuma transação cadastrada.</td></tr>` : "";
            
        transacoes.forEach((t, index) => {
            const isReceita = t.tipo === 'receita';
            tbodyTransacoes.innerHTML += `
                <tr>
                    <td>${t.descricao}</td>
                    <td>${t.categoria.replace("Meta: ", "🎯 ")}</td>
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
            const cat = t.categoria.replace("Meta: ", "🎯 ");
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
        mostrarConfirmacao("Deseja realmente excluir esta transação?", "Excluir", "btn-dialog-danger", () => {
            const t = transacoes[index];
            
            if (t.categoria.startsWith("Meta: ")) {
                const nomeMeta = t.categoria.replace("Meta: ", "");
                const metaIndex = metas.findIndex(m => m.nome === nomeMeta);
                if (metaIndex !== -1) {
                    if (t.tipo === "despesa") {
                        metas[metaIndex].atual -= t.valor; 
                        if (metas[metaIndex].atual < 0) metas[metaIndex].atual = 0;
                    } else if (t.tipo === "receita") {
                        metas[metaIndex].atual += t.valor; 
                    }
                    localStorage.setItem("metas_cofre_furado", JSON.stringify(metas));
                    atualizarMetasUI();
                }
            }

            transacoes.splice(index, 1);
            localStorage.setItem("transacoes_cofre_furado", JSON.stringify(transacoes));
            atualizarUI();
        });
    };

    if (formTransacao) {
        formTransacao.addEventListener("submit", (evento) => {
            evento.preventDefault();
            const tipo = document.getElementById("tipo-transacao").value;
            const descricao = document.getElementById("desc-transacao").value;
            const categoria = document.getElementById("cat-transacao").value;
            const valor = parseFloat(document.getElementById("valor-transacao").value);
            const data = document.getElementById("data-transacao").value;

            if (categoria.startsWith("Meta: ")) {
                const nomeMeta = categoria.replace("Meta: ", "");
                const metaIndex = metas.findIndex(m => m.nome === nomeMeta);
                
                if (metaIndex !== -1) {
                    if (tipo === "despesa") {
                        metas[metaIndex].atual += valor;
                    } else if (tipo === "receita") {
                        metas[metaIndex].atual -= valor;
                        if (metas[metaIndex].atual < 0) metas[metaIndex].atual = 0; 
                    }
                    localStorage.setItem("metas_cofre_furado", JSON.stringify(metas));
                    atualizarMetasUI();
                }
            }

            transacoes.push({ tipo, descricao, categoria, valor, data });
            localStorage.setItem("transacoes_cofre_furado", JSON.stringify(transacoes));
            atualizarUI();
            modalTransacao.classList.add("oculto");
            formTransacao.reset();
        });
    }

    const modalMeta = document.getElementById("modal-meta");
    const btnNovaMeta = document.getElementById("btn-nova-meta");
    const btnFecharModalMeta = document.getElementById("btn-fechar-modal-meta");
    const formMeta = document.getElementById("form-meta");

    if (btnNovaMeta && modalMeta) {
        btnNovaMeta.addEventListener("click", () => {
            if (planoUsuario === "Furado" && metas.length >= 1) {
                mostrarAlerta("🔒 Limite Atingido! O Plano Furado permite apenas 1 meta ativa. Faça o upgrade para o Plano Plástico ou Ouro para ter metas ilimitadas.", () => {
                    document.body.classList.add("fade-out");
                    setTimeout(() => window.location.href = "planos.html", 300);
                });
                return;
            }
            modalMeta.classList.remove("oculto");
        });
    }

    if (btnFecharModalMeta && modalMeta) {
        btnFecharModalMeta.addEventListener("click", () => modalMeta.classList.add("oculto"));
    }

    if (formMeta) {
        formMeta.addEventListener("submit", (evento) => {
            evento.preventDefault();
            metas.push({
                nome: document.getElementById("nome-meta").value,
                alvo: parseFloat(document.getElementById("valor-alvo-meta").value),
                atual: parseFloat(document.getElementById("valor-atual-meta").value) || 0
            });
            localStorage.setItem("metas_cofre_furado", JSON.stringify(metas));
            atualizarMetasUI();
            modalMeta.classList.add("oculto");
            formMeta.reset();
        });
    }

    setTimeout(() => {
        atualizarUI();
        atualizarMetasUI();
    }, 500); 

    const linksMenu = document.querySelectorAll('.nav-links a');
    linksMenu.forEach(link => {
        link.addEventListener('click', (e) => {
            const href = link.getAttribute('href');
            
            if (!href || href === '#' || window.location.pathname.includes(href)) return;
            if (link.id === 'menu-cartoes' && planoUsuario !== 'Ouro') return;

            e.preventDefault(); 
            document.body.classList.add('fade-out');
            setTimeout(() => {
                window.location.href = href;
            }, 300);
        });
    });
});