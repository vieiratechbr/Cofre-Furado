import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { 
    getAuth, 
    createUserWithEmailAndPassword, 
    signInWithEmailAndPassword,
    GoogleAuthProvider,
    signInWithPopup,
    RecaptchaVerifier,
    signInWithPhoneNumber
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";

import { firebaseConfig } from "./firebase-keys.js";
import { validarFormCadastro, validarFormLogin } from "./script.js";

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

const formCadastro = document.getElementById('form-cadastro');
if (formCadastro) {
    formCadastro.addEventListener('submit', (evento) => {
        evento.preventDefault(); 
        if (!validarFormCadastro()) return;

        const email = document.getElementById('email-cadastro').value;
        const senha = document.getElementById('senha-cadastro').value;

        createUserWithEmailAndPassword(auth, email, senha)
            .then((credenciais) => {
                alert("Sucesso! Usuário cadastrado.");
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
                alert("Bem-vindo! Login efetuado com sucesso.");
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
                alert("Sucesso! Bem-vindo, " + resultado.user.displayName);
            })
            .catch((erro) => {
                alert("Erro ao logar com Google: " + erro.message);
            });
    });
}

const btnTelefoneIniciar = document.getElementById('btn-telefone-iniciar');
if (btnTelefoneIniciar) {
    btnTelefoneIniciar.addEventListener('click', () => {

        document.getElementById('area-telefone').style.display = 'block';

        if (!window.recaptchaVerifier) {
            window.recaptchaVerifier = new RecaptchaVerifier(auth, 'recaptcha-container', {
                'size': 'normal'
            });
            window.recaptchaVerifier.render();
        }
    });
}

const btnEnviarSms = document.getElementById('btn-enviar-sms');
if (btnEnviarSms) {
    btnEnviarSms.addEventListener('click', () => {
        const numero = document.getElementById('numero-telefone').value;
        const appVerifier = window.recaptchaVerifier;

        if (numero.length < 13) {
            alert("Digite o número completo com +55 (Ex: +5511999999999)");
            return;
        }

        signInWithPhoneNumber(auth, numero, appVerifier)
            .then((resultadoConfirmacao) => {

                window.confirmationResult = resultadoConfirmacao;

                document.getElementById('area-codigo').style.display = 'block';
                alert("SMS enviado! Verifique seu celular.");
            })
            .catch((erro) => {
                alert("Erro ao enviar SMS: " + erro.message);
                window.recaptchaVerifier.render().then(function(widgetId) {
                    grecaptcha.reset(widgetId); 
                });
            });
    });
}

const btnConfirmarCodigo = document.getElementById('btn-confirmar-codigo');
if (btnConfirmarCodigo) {
    btnConfirmarCodigo.addEventListener('click', () => {
        const codigo = document.getElementById('codigo-sms').value;
        
        window.confirmationResult.confirm(codigo)
            .then((resultado) => {
                alert("Login com celular realizado com sucesso!");
            })
            .catch((erro) => {
                alert("Código inválido ou expirado.");
            });
    });
}