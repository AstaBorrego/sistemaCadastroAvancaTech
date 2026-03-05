// 1. IMPORTAÇÕES: Pegando as ferramentas necessárias no site oficial do Firebase
// Esta linha traz o "coração" do Firebase para o projeto funcionar
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.10.0/firebase-app.js";

// Esta linha traz a ferramenta que conta quantas pessoas visitam o site
import { getAnalytics } from "https://www.gstatic.com/firebasejs/12.10.0/firebase-analytics.js";

// Esta linha traz 4 ferramentas específicas para controlar nomes de usuário e senhas
import {
    getAuth,                        // Ferramenta que ativa o sistema de segurança
    signInWithEmailAndPassword,     // Ferramenta que confere se o e-mail e a senha estão certos para entrar
    sendPasswordResetEmail,         // Ferramenta que envia um e-mail para trocar a senha perdida
    createUserWithEmailAndPassword  // Ferramenta que cria uma conta nova para um aluno novo
} from "https://www.gstatic.com/firebasejs/12.10.0/firebase-auth.js";

// 2. CONFIGURAÇÃO: Os dados que identificam que este site pertence ao SEU projeto
 const firebaseConfig = {
    apiKey: "AIzaSyC4iIZ5cALPkHZY4fzk1CjJweUCoxQVG5E",
    authDomain: "projetocadastroalunos.firebaseapp.com",
    projectId: "projetocadastroalunos",
    storageBucket: "projetocadastroalunos.firebasestorage.app",
    messagingSenderId: "274079544555",
    appId: "1:274079544555:web:904e7744de1d038f097aae",
    measurementId: "G-7BP264WGDE"
  };

// 3. Inicialização dos serviços
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const analytics = getAnalytics(app);

// --- FUNÇÕES DE INTERFACE (VALIDAÇÃO) ---

// Cria a função que vai vigiar os campos de texto o tempo todo
window.validateFields = function () {

    // 1. CAPTURA: Pega o que está escrito no campo de E-mail agora
    const email = document.getElementById('email').value;

    // 2. CAPTURA: Pega o que está escrito no campo de Senha agora
    const password = document.getElementById('password').value;

    // 3. TESTE: Verifica se o e-mail tem o formato certo (ex: nome@site.com)
    const emailValido = /\S+@\S+\.\S+/.test(email);

    // // 4. BOTÃO RECUPERAR: Destrava se o e-mail estiver preenchido corretamente
    // document.getElementById('recover-password-button').disabled = !emailValido;

    // // 5. BOTÃO CADASTRAR: Também destrava se o e-mail estiver correto
    // document.getElementById('register-button').disabled = !emailValido;

    // 6. BOTÃO ENTRAR: Só destrava se o e-mail for válido E a senha tiver 6+ ou mais caracteres
    document.getElementById('entrar').disabled = !(emailValido && password.length >= 6);

    // 7. AVISOS: Chama a função que mostra/esconde erros de e-mail na tela
    toggleEmailErrors(email, emailValido);

    // 8. AVISOS: Chama a função que mostra/esconde erros de senha na tela
    togglePasswordErrors(password);
}

//Criando as funtions(Funções)

// 1. INÍCIO: Função que decide se mostra ou esconde os avisos de erro de e-mail
function toggleEmailErrors(email, emailValido) {

    // 2. ALVO 1: Encontra na tela o aviso "E-mail é obrigatório"
    const emailRequired = document.getElementById('email-required-error');

    // 3. ALVO 2: Encontra na tela o aviso "E-mail inválido"
    const emailInvalid = document.getElementById('email-invalid-error');

    // 4. REGRA 1: Se o campo estiver VAZIO (!email), MOSTRA o aviso. Se não, ESCONDE.
    emailRequired.style.display = !email ? "block" : "none";

    // 5. REGRA 2: Se ESCREVEU algo, mas o formato está ERRADO, MOSTRA o aviso. Se não, ESCONDE.
    emailInvalid.style.display = (email && !emailValido) ? "block" : "none";
}
//☝🏼Resumo Visual para o Cérebro Focar:
/*!email = Campo vazio? ➔ Aparece erro de "Obrigatório".

email && !emailValido = Digitou algo, mas faltou o @? ➔ Aparece erro de "Inválido".

"block" = Ligar (Mostrar na tela).

"none" = Desligar (Sumir da tela).*/

// ==========================================
// 1. ALERTA DE SENHA VAZIA
// Objetivo: Mostrar ou esconder a mensagem de erro da senha.
// ==========================================
function togglePasswordErrors(password) {
    // Busca o elemento da mensagem de erro no HTML
    const passwordRequired = document.getElementById('password-required-error');

    // REGRA: Se NÃO tem senha (!password), mostra o erro ("block"). 
    // Se tem senha, esconde o erro ("none").
    passwordRequired.style.display = !password ? "block" : "none";
}


// ==========================================
// 2. FUNÇÃO DE LOGIN (FIREBASE)
// Objetivo: Validar o usuário e entrar no sistema.
// ==========================================
window.login = function () {
    // AÇÃO: Pega o que o usuário digitou nas caixinhas de E-mail e Senha
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    // AÇÃO: Tenta fazer o login usando a ferramenta do Firebase
    signInWithEmailAndPassword(auth, email, password)
        .then(() => {
            // SE DEU CERTO: Manda o usuário para a página inicial (home)
            window.location.href = "home.html";
        })
        .catch(error => {
            // SE DEU ERRO: Mostra um alerta explicando o que aconteceu de errado
            alert("Erro ao entrar: " + getErrorMessage(error.code));
        });
}

// ============================================================
// FUNÇÃO: RECUPERAR SENHA
// Objetivo: Mandar um link de "nova senha" para o e-mail do usuário.
// ============================================================

// window.recoverPassword = function () {

//     // PASSO 1: Ir até o HTML e pegar o que o usuário escreveu na caixa de e-mail.
//     const email = document.getElementById('email').value;

//     // PASSO 2: Pedir ao Firebase para enviar o e-mail de recuperação.
//     sendPasswordResetEmail(auth, email)

//         .then(() => {
//             // SE TUDO DEU CERTO: Avisa o usuário para olhar a caixa de entrada.
//             alert("Email de recuperação enviado! Verifique sua caixa de entrada.");
//         })

//         .catch(error => {
//             // SE ALGO DEU ERRADO: Mostra um alerta explicando o motivo do erro.
//             alert("Erro: " + getErrorMessage(error.code));
//         });
// }

//==========================================
// 🚀 FUNÇÃO: CRIAR NOVA CONTA (CADASTRO)
// Objetivo: Registrar um novo usuário no banco de dados.
// ==========================================

// window.register = function () {

//     // 1️⃣ COLETA: Pega o que foi digitado nas caixinhas de E-mail e Senha.
//     const email = document.getElementById('email').value;
//     const password = document.getElementById('password').value;

//     // 2️⃣ AÇÃO: Envia esses dados para o Firebase criar o usuário.
//     createUserWithEmailAndPassword(auth, email, password)

//         // ✅ CASO DE SUCESSO: O usuário foi criado!
//         .then(() => {
//             alert("Usuário criado com sucesso!"); // Avisa que deu certo
//             window.location.href = "home.html";    // Leva o usuário para dentro do app
//         })

//         // ❌ CASO DE ERRO: Algo impediu o cadastro.
//         .catch(error => {
//             // Mostra o erro exato (ex: e-mail já cadastrado ou senha curta).
//             alert("Erro ao cadastrar: " + getErrorMessage(error.code));
//         });

    // ==========================================
    // 📢 FUNÇÃO: TRADUTOR DE ERROS
    // Objetivo: Transformar os códigos estranhos do Firebase 
    // em mensagens que qualquer pessoa entenda.
    // ==========================================

    function getErrorMessage(code) {

        // O "switch" funciona como um menu: ele olha o "code" (o erro) 
        // e procura a tradução certa abaixo.
        switch (code) {

            // 🔍 CASO 1: Problemas com os dados de entrada
            case "auth/user-not-found":    // Usuário não achado
            case "auth/wrong-password":    // Senha errada
            case "auth/invalid-credential": // Credencial inválida
                return "E-mail ou senha incorretos.";

            // 📧 CASO 2: E-mail repetido
            case "auth/email-already-in-use":
                return "Este e-mail já está cadastrado.";

            // 🔑 CASO 3: Senha muito simples
            case "auth/weak-password":
                return "A senha deve ter pelo menos 6 caracteres.";

            // ❓ CASO PADRÃO (DEFAULT): 
            // Se o erro for algo novo ou desconhecido, mostra o código original.
            default:
                return code;
        }
    }
// }