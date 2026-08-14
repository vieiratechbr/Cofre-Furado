import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";

import { getFirestore, doc, updateDoc } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore-lite.js";
import { firebaseConfig } from "./firebase-keys.js";

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

document.addEventListener("DOMContentLoaded", () => {
    const botoesPlano = document.querySelectorAll(".btn-plano");

    botoesPlano.forEach(botao => {
        botao.addEventListener("click", (evento) => {
            const planoEscolhido = evento.target.getAttribute("data-plano");
            
            onAuthStateChanged(auth, async (usuarioLogado) => {
                if (usuarioLogado) {
                    try {
                        
                        const usuarioRef = doc(db, "usuarios", usuarioLogado.uid);
                        await updateDoc(usuarioRef, {
                            plano: planoEscolhido
                        });

                        alert(`Fantástico! O plano Cofre de ${planoEscolhido} foi ativado na sua conta.`);
                        window.location.href = "dashboard.html"; 

                    } catch (erro) {
                        console.error("Erro ao salvar o plano:", erro);
                        alert("Houve um problema ao processar seu plano. Tente novamente.");
                    }
                } else {
                    
                    window.location.href = "login.html";
                }
            });
        });
    });
});