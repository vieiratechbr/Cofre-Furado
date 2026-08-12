import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";

import { firebaseConfig } from "./firebase-keys.js";
import { validarFormCadastro, validarFormLogin } from "./script.js";

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

const formCadastro = document.getElementById('form-cadastro');
if (formCadastro) {
    formCadastro.addEventListener('submit', (evento) => {
        evento.preventDefault(); 

        if (!validarFormCadastro()) {
            return;
        }

        const email = document.getElementById('email-cadastro').value;
        const senha = document.getElementById('senha-cadastro').value;

        createUserWithEmailAndPassword(auth, email, senha)
            .then((credenciais) => {
                alert("Sucesso! Usuário cadastrado.");
                console.log("Dados do usuário:", credenciais.user);
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

        if (!validarFormLogin()) {
            return;
        }

        const email = document.getElementById('email-login').value;
        const senha = document.getElementById('senha-login').value;

        signInWithEmailAndPassword(auth, email, senha)
            .then((credenciais) => {
                alert("Bem-vindo! Login efetuado com sucesso.");
                console.log("Dados do usuário logado:", credenciais.user);
            })
            .catch((erro) => {
                alert("Erro no login. Verifique e-mail e senha. " + erro.message);
            });
    });
}