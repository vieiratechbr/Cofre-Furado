document.addEventListener("DOMContentLoaded", function() {

    function validarCampo(id, mensagemPersonalizada) {
        const campo = document.getElementById(id);
        const erroSpan = document.getElementById("erro-" + id);
        let valido = true;
        
        if (campo.value.trim() === "") {
            erroSpan.textContent = mensagemPersonalizada;
            erroSpan.style.display = "block";
            campo.classList.add("erro-input"); 
            valido = false;
        } else {
            erroSpan.style.display = "none"; 
            campo.classList.remove("erro-input"); 
        }
        return valido;
    }

    const formCadastro = document.getElementById("form-cadastro");
    if (formCadastro) {
        formCadastro.addEventListener("submit", function(event) {
            let formValido = true;

            if (!validarCampo("nome", "Por favor, digite o seu nome.")) formValido = false;
            if (!validarCampo("email", "Esqueceu de preencher o email!")) formValido = false;
            if (!validarCampo("senha", "A senha é obrigatória.")) formValido = false;
            if (!validarCampo("repita-senha", "Confirme a sua senha.")) formValido = false;

            // Verifica se as senhas coincidem
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

    const formLogin = document.getElementById("form-login");
    if (formLogin) {
        formLogin.addEventListener("submit", function(event) {
            let formValido = true;

            if (!validarCampo("email", "Por favor, digite seu email.")) formValido = false;
            if (!validarCampo("senha", "Por favor, digite sua senha.")) formValido = false;

            if (!formValido) {
                event.preventDefault(); 
            }
        });
    }
});