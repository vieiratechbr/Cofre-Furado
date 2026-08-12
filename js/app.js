import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import {
    getAuth,
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    GoogleAuthProvider,
    signInWithPopup
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";

import { firebaseConfig } from "./firebase-keys.js";
import { validarFormCadastro, validarFormLogin, aplicarMascaraCPF, configurarToggleSenha } from "./script.js";

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

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
        const email = document.getElementById('email-cadastro').value;
        const senha = document.getElementById('senha-cadastro').value;

        localStorage.setItem("cofre_furado_nome_usuario", nome);

        createUserWithEmailAndPassword(auth, email, senha)
            .then((credenciais) => {
                alert("Cadastro realizado com sucesso! Faça login para continuar.");
                window.location.href = "login.html"; 
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
            .then((resultado) => {
                
                localStorage.setItem("cofre_furado_nome_usuario", resultado.user.displayName);
                window.location.href = "dashboard.html"; 
            })
            .catch((erro) => {
                alert("Erro ao logar com Google: " + erro.message);
            });
    });
}