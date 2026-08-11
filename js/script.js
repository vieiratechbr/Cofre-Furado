document.addEventListener("DOMContentLoaded", function() {
    const form = document.getElementById("form-cadastro");

    if (form) {
        form.addEventListener("submit", function(event) {
            let formValido = true;

            function validarCampo(id, mensagemPersonalizada) {
                const campo = document.getElementById(id);
                const erroSpan = document.getElementById("erro-" + id);
                
                if (campo.value.trim() === "") {
                    erroSpan.textContent = mensagemPersonalizada;
                    erroSpan.style.display = "block"; 
                    campo.classList.add("erro-input"); 
                    formValido = false;
                } else {
                    erroSpan.style.display = "none"; 
                    campo.classList.remove("erro-input"); 
                }
            }

            validarCampo("nome", "Por favor, digite o seu nome.");
            validarCampo("email", "Esqueceu de preencher o email!");
            validarCampo("senha", "A senha é obrigatória.");
            validarCampo("repita-senha", "Confirme a sua senha.");

            const senha = document.getElementById("senha").value;
            const repitaSenha = document.getElementById("repita-senha").value;
            const erroRepita = document.getElementById("erro-repita-senha");

            if (senha !== "" && repitaSenha !== "" && senha !== repitaSenha) {
                erroRepita.textContent = "As senhas não coincidem!";
                erroRepita.style.display = "block";
                document.getElementById("repita-senha").classList.add("erro-input");
                formValido = false;
            }

            if (!formValido) {
                event.preventDefault();
            }
        });
    }
});