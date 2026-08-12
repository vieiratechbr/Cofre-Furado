export function validarCampo(id, mensagemPersonalizada) {
    const campo = document.getElementById(id);
    const erroSpan = document.getElementById("erro-" + id);
    
    if (!campo || !erroSpan) return false;

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

export function validarFormCadastro() {
    let formValido = true;
    if (!validarCampo("nome-cadastro", "Por favor, digite o seu nome.")) formValido = false;
    if (!validarCampo("email-cadastro", "Esqueceu de preencher o email!")) formValido = false;
    if (!validarCampo("senha-cadastro", "A senha é obrigatória.")) formValido = false;
    if (!validarCampo("repita-senha-cadastro", "Confirme a sua senha.")) formValido = false;

    const senha = document.getElementById("senha-cadastro")?.value;
    const repitaSenha = document.getElementById("repita-senha-cadastro")?.value;
    const erroRepita = document.getElementById("erro-repita-senha-cadastro");

    if (senha && repitaSenha && senha !== repitaSenha) {
        if (erroRepita) {
            erroRepita.textContent = "As senhas não coincidem!";
            erroRepita.style.display = "block";
        }
        document.getElementById("repita-senha-cadastro").classList.add("erro-input");
        formValido = false;
    }
    return formValido;
}

export function validarFormLogin() {
    let formValido = true;
    if (!validarCampo("email-login", "Por favor, digite seu email.")) formValido = false;
    if (!validarCampo("senha-login", "Por favor, digite sua senha.")) formValido = false;
    return formValido;
}