document.addEventListener('DOMContentLoaded', function () {
    const form = document.getElementById('inscricaoForm');
    const saveButton = document.getElementById('saveButton');

    // Validação de campos
    const emailInput = document.getElementById('email');
    emailInput.addEventListener('blur', validateEmail);

    const cpfInput = document.getElementById('cpf');
    cpfInput.addEventListener('blur', validateCPF);
    cpfInput.addEventListener('input', formatCPF);

    const telefoneInput = document.getElementById('telefone');
    telefoneInput.addEventListener('blur', validateTelefone);
    telefoneInput.addEventListener('input', formatTelefone);

    const cepInput = document.getElementById('cep');
    cepInput.addEventListener('blur', validateCEP);
    cepInput.addEventListener('input', formatCEP);

    const passwordInput = document.getElementById('password');
    const confirmPasswordInput = document.getElementById('confirmPassword');
    confirmPasswordInput.addEventListener('blur', validatePasswordMatch);

    // Carregar dados salvos
    loadSavedData();

    // Evento de salvar
    saveButton.addEventListener('click', saveFormData);

    // Evento de envio
    form.addEventListener('submit', handleSubmit);

    // Funções de validação
    function validateEmail() {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(emailInput.value)) {
            showError(emailInput, 'Por favor, insira um email válido.');
            return false;
        }
        clearError(emailInput);
        return true;
    }

    function validateCPF() {
        const cpfRegex = /^\d{3}\.\d{3}\.\d{3}-\d{2}$/;
        if (!cpfRegex.test(cpfInput.value)) {
            showError(cpfInput, 'Por favor, insira um CPF válido no formato 000.000.000-00');
            return false;
        }
        clearError(cpfInput);
        return true;
    }

    function formatCPF(e) {
        let value = e.target.value.replace(/\D/g, '');

        if (value.length > 3 && value.length <= 6) {
            value = value.replace(/(\d{3})(\d{1,3})/, '$1.$2');
        } else if (value.length > 6 && value.length <= 9) {
            value = value.replace(/(\d{3})(\d{3})(\d{1,3})/, '$1.$2.$3');
        } else if (value.length > 9) {
            value = value.replace(/(\d{3})(\d{3})(\d{3})(\d{1,2})/, '$1.$2.$3-$4');
        }

        e.target.value = value;
    }

    function validateTelefone() {
        const telefoneRegex = /^\(\d{2}\) \d{5}-\d{4}$/;
        if (!telefoneRegex.test(telefoneInput.value)) {
            showError(telefoneInput, 'Por favor, insira um telefone válido no formato (99) 99999-9999');
            return false;
        }
        clearError(telefoneInput);
        return true;
    }

    function formatTelefone(e) {
        let value = e.target.value.replace(/\D/g, '');

        if (value.length > 0) {
            value = value.replace(/^(\d{0,2})/, '($1)');
        }
        if (value.length > 3) {
            value = value.replace(/(\(\d{2}\))(\d{0,5})/, '$1 $2');
        }
        if (value.length > 10) {
            value = value.replace(/(\(\d{2}\) \d{5})(\d{0,4})/, '$1-$2');
        }

        e.target.value = value;
    }

    function validateCEP() {
        const cepRegex = /^\d{5}-\d{3}$/;
        if (!cepRegex.test(cepInput.value)) {
            showError(cepInput, 'Por favor, insira um CEP válido no formato 00000-000');
            return false;
        }
        clearError(cepInput);
        return true;
    }

    function formatCEP(e) {
        let value = e.target.value.replace(/\D/g, '');

        if (value.length > 5) {
            value = value.replace(/^(\d{5})(\d{0,3})/, '$1-$2');
        }

        e.target.value = value;
    }

    function validatePasswordMatch() {
        if (passwordInput.value !== confirmPasswordInput.value) {
            showError(confirmPasswordInput, 'As senhas não coincidem.');
            return false;
        }
        clearError(confirmPasswordInput);
        return true;
    }

    function showError(input, message) {
        const parent = input.parentElement;
        let errorElement = parent.querySelector('.error-message');

        if (!errorElement) {
            errorElement = document.createElement('div');
            errorElement.className = 'error-message';
            parent.appendChild(errorElement);
        }

        errorElement.textContent = message;
        input.style.borderColor = 'red';
    }

    function clearError(input) {
        const parent = input.parentElement;
        const errorElement = parent.querySelector('.error-message');

        if (errorElement) {
            parent.removeChild(errorElement);
        }

        input.style.borderColor = '#ccc';
    }

    function saveFormData() {
        const formData = {};
        const inputs = form.querySelectorAll('input, select');

        inputs.forEach(input => {
            if (input.type !== 'file' && input.type !== 'submit' && input.type !== 'button') {
                formData[input.id] = input.value;
            }
        });

        localStorage.setItem('formData', JSON.stringify(formData));

        // Salvar também como usuário se tiver ID e senha
        if (formData.userId && formData.password) {
            const userData = {
                ...formData,
                password: formData.password // Salvar a senha (em um caso real, seria hash)
            };
            localStorage.setItem(formData.userId, JSON.stringify(userData));
        }

        alert('Progresso salvo com sucesso! Você pode continuar depois.');
    }

    function loadSavedData() {
        const savedData = localStorage.getItem('formData');
        if (savedData) {
            const formData = JSON.parse(savedData);
            for (const id in formData) {
                const input = document.getElementById(id);
                if (input) {
                    input.value = formData[id];
                }
            }
        }
    }

    function handleSubmit(e) {
        e.preventDefault();

        // Validar todos os campos
        const isEmailValid = validateEmail();
        const isCPFValid = validateCPF();
        const isTelefoneValid = validateTelefone();
        const isCEPValid = validateCEP();
        const isPasswordMatch = validatePasswordMatch();

        // Verificar campos obrigatórios
        let isValid = true;
        const requiredInputs = form.querySelectorAll('[required]');
        requiredInputs.forEach(input => {
            if (!input.value.trim()) {
                showError(input, 'Este campo é obrigatório.');
                isValid = false;
            }
        });

        if (!isEmailValid || !isCPFValid || !isTelefoneValid || !isCEPValid || !isPasswordMatch || !isValid) {
            alert('Por favor, corrija os erros no formulário antes de enviar.');
            return;
        }

        // Verificar termos aceitos
        const termosCheckbox = document.getElementById('termos');
        if (!termosCheckbox.checked) {
            alert('Por favor, aceite os termos e condições para continuar.');
            return;
        }

        // Verificar trilha selecionada
        const trilhaSelecionada = form.querySelector('input[name="trilha"]:checked');
        if (!trilhaSelecionada) {
            alert('Por favor, selecione uma trilha de interesse.');
            return;
        }

        // Verificar se senhas coincidem
        if (passwordInput.value !== confirmPasswordInput.value) {
            alert('As senhas não coincidem. Por favor, verifique.');
            return;
        }

        // Se tudo estiver válido, enviar
        const formData = new FormData(form);
        const data = {};

        formData.forEach((value, key) => {
            if (key !== 'documento' && key !== 'comprovante') {
                data[key] = value;
            }
        });

        // Salvar como usuário
        localStorage.setItem(data.userId, JSON.stringify(data));

        // Limpar dados temporários
        localStorage.removeItem('formData');

        // Mostrar mensagem de sucesso
        alert('Inscrição realizada com sucesso! Você pode fazer login com seu ID e senha.');

        // Redirecionar para login
        window.location.href = 'login.html';
    }
});
// Botão modo escuro-claro
document.addEventListener('DOMContentLoaded', () => {
    let trilho = document.getElementById('trilho');
    let indicador = document.querySelector('.indicador');
    let elementosDark = {
        loginContainer: document.querySelector('.login-container'),
        loginForm: document.querySelector('.login-form'),
        button: document.querySelector('.button'),
        labels: document.querySelectorAll('.label'),
        h2: document.querySelector('.h2'),
        inputs: document.querySelectorAll('.login-form input'),
        a: document.querySelector('.login-form a'),
        containers: document.querySelectorAll('.container'),
        formContainer: document.querySelectorAll('.form-container'),
        imageContainer: document.querySelectorAll('.image-container'),
        backButton: document.querySelectorAll('.back-button'),
        p: document.querySelectorAll('.p'),
        legenda: document.querySelectorAll('.legenda'),
        label: document.querySelectorAll('label'),
        tipoTrilha: document.querySelectorAll('.tipoTrilha'),
        h4: document.querySelectorAll('.h4'),
        destaque: document.querySelectorAll('.destaque'),
        buttonProgresso: document.querySelectorAll('#saveButton'),
        input: document.querySelectorAll('.input'),
        select: document.querySelectorAll('.select'),
        marcação: document.querySelectorAll('.marcaçao'),
    };

   
    let toggleModoEscuro = (ativo) => {
        // Verifica se os elementos da página de Login
        
        if (trilho && indicador) {
            trilho.classList.toggle('ativo', ativo);
            trilho.classList.toggle('dark', ativo);
            indicador.style.left = ativo ? '50px' : '0';
        }
    
        // Aplica o modo escuro aos elementos de todas as páginas
        Object.values(elementosDark).forEach(el => {
            if (el instanceof NodeList) { // Para NodeLists (querySelectorAll)
                el.forEach(item => item.classList.toggle('dark', ativo));
            } else if (el) { // Para elementos únicos (querySelector)
                el.classList.toggle('dark', ativo);
            }
        });
    };

    // Manter o modo de acordo 
    let modoSalvo = sessionStorage.getItem('modoEscuro') || localStorage.getItem('modoEscuro'); 
    if (modoSalvo === 'LIGADO') {
        toggleModoEscuro(true);
    }

    // de acordo com o clique do usuário
    trilho.addEventListener('click', () => {
        let novoEstado = !trilho.classList.contains('ativo');
        
        
        toggleModoEscuro(novoEstado);
        
        // LocalStoragen e SessionStorage
        try {
            localStorage.setItem('modoEscuro', novoEstado ? 'LIGADO' : 'DESLIGADO');
            sessionStorage.setItem('modoEscuro', novoEstado ? 'LIGADO' : 'DESLIGADO');
        } catch (e) {
            console.error('Erro ao salvar no localStorage/sessionStorage:', e.name);
        }
    });
});






