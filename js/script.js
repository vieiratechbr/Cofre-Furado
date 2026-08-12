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

export function aplicarMascaraCPF(input) {
    let value = input.value.replace(/\D/g, ""); 
    
    if (value.length > 11) {
        value = value.slice(0, 11);
    }

    if (value.length > 9) {
        value = value.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, "$1.$2.$3-$4");
    } else if (value.length > 6) {
        value = value.replace(/(\d{3})(\d{3})(\d{3})/, "$1.$2.$3");
    } else if (value.length > 3) {
        value = value.replace(/(\d{3})(\d{3})/, "$1.$2");
    }
    
    input.value = value;
}

export function validarCPF(cpf) {
    cpf = cpf.replace(/\D/g, ''); 

    if (cpf.length !== 11 || /^(\d)\1{10}$/.test(cpf)) {
        return false;
    }

    let soma = 0;
    let resto;

    for (let i = 1; i <= 9; i++) {
        soma = soma + parseInt(cpf.substring(i - 1, i)) * (11 - i);
    }
    resto = (soma * 10) % 11;
    if ((resto === 10) || (resto === 11)) resto = 0;
    if (resto !== parseInt(cpf.substring(9, 10))) return false;

    soma = 0;
    for (let i = 1; i <= 10; i++) {
        soma = soma + parseInt(cpf.substring(i - 1, i)) * (12 - i);
    }
    resto = (soma * 10) % 11;
    if ((resto === 10) || (resto === 11)) resto = 0;
    if (resto !== parseInt(cpf.substring(10, 11))) return false;

    return true;
}

export function validarFormCadastro() {
    let formValido = true;
    
    if (!validarCampo("nome-cadastro", "Por favor, digite o seu nome.")) formValido = false;

    const cpfInput = document.getElementById("cpf-cadastro");
    const erroCpf = document.getElementById("erro-cpf-cadastro");
    if (cpfInput) {
        if (cpfInput.value.trim() === "") {
            erroCpf.textContent = "O CPF é obrigatório.";
            erroCpf.style.display = "block";
            cpfInput.classList.add("erro-input");
            formValido = false;
        } else if (!validarCPF(cpfInput.value)) {
            erroCpf.textContent = "CPF inválido. Verifique os números.";
            erroCpf.style.display = "block";
            cpfInput.classList.add("erro-input");
            formValido = false;
        } else {
            erroCpf.style.display = "none";
            cpfInput.classList.remove("erro-input");
        }
    }

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