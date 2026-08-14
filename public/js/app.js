import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import {
    getAuth,
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    GoogleAuthProvider,
    signInWithPopup
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";

import { getFirestore, doc, setDoc } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore-lite.js";

import { firebaseConfig } from "./firebase-keys.js";
import { validarFormCadastro, validarFormLogin, aplicarMascaraCPF, configurarToggleSenha } from "./script.js";

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app); 

configurarToggleSenha();

const inputCpf = document.getElementById('cpf-cadastro');
if (inputCpf) {
    inputCpf.addEventListener('input', function() {
        aplicarMascaraCPF(this);
    });
}

const formCadastro = document.getElementById('form-cadastro');
if (formCadastro) {
    formCadastro.addEventListener('submit', (evento) => {
        evento.preventDefault();
        
        if (!validarFormCadastro()) return;
        
        const nome = document.getElementById('nome-cadastro').value;
        const cpf = document.getElementById('cpf-cadastro').value;
        const email = document.getElementById('email-cadastro').value;
        const senha = document.getElementById('senha-cadastro').value;

        createUserWithEmailAndPassword(auth, email, senha)
            .then(async (credenciais) => {
                const usuario = credenciais.user;
                
                try {
                    
                    await setDoc(doc(db, "usuarios", usuario.uid), {
                        nome: nome,
                        email: email,
                        cpf: cpf,
                        plano: "Pendente",
                        data_cadastro: new Date().toISOString()
                    });

                    localStorage.setItem("cofre_furado_nome_usuario", nome);

                    window.location.href = "planos.html"; 

                } catch (erroFirestore) {
                    console.error("Erro no Firestore Lite:", erroFirestore);
                    alert("A conta foi criada, mas ocorreu um erro de conexão com o banco de dados. Tente fazer login.");
                    window.location.href = "login.html";
                }
            })
            .catch((erro) => {
                alert("Erro no cadastro: " + erro.message);
            });
    });
}

const formLogin = document.getElementById('form-login');
if (formLogin) {
    formLogin.addEventListener('submit', (evento) => {
        evento.preventDefault();
        
        if (!validarFormLogin()) return;
        
        const email = document.getElementById('email-login').value;
        const senha = document.getElementById('senha-login').value;
        
        signInWithEmailAndPassword(auth, email, senha)
            .then((credenciais) => {
                window.location.href = "dashboard.html"; 
            })
            .catch((erro) => {
                alert("Erro no login. Verifique e-mail e senha. " + erro.message);
            });
    });
}

const btnGoogle = document.getElementById('btn-google');
if (btnGoogle) {
    const providerGoogle = new GoogleAuthProvider();
    btnGoogle.addEventListener('click', () => {
        signInWithPopup(auth, providerGoogle)
            .then(async (resultado) => {
                const usuario = resultado.user;

                try {
                    await setDoc(doc(db, "usuarios", usuario.uid), {
                        nome: usuario.displayName,
                        email: usuario.email
                    }, { merge: true });
                    
                    localStorage.setItem("cofre_furado_nome_usuario", usuario.displayName);
                } catch(e) {
                    console.warn("Erro não crítico ao salvar dados do Google", e);
                }

                window.location.href = "dashboard.html"; 
            })
            .catch((erro) => {
                alert("Erro ao logar com Google: " + erro.message);
            });
    });
}