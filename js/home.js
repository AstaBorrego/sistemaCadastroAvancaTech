// 1. IMPORTAÇÕES
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.8.0/firebase-app.js";
import {
    getFirestore,
    collection,
    addDoc,
    query,
    where,
    getDocs,
    updateDoc,
    deleteDoc,
    doc
} from "https://www.gstatic.com/firebasejs/12.8.0/firebase-firestore.js";

// 2. CONFIGUrgÇÃO
const firebaseConfig = {
    apiKey: "AIzaSyC4iIZ5cALPkHZY4fzk1CjJweUCoxQVG5E",
    authDomain: "projetocadastroalunos.firebaseapp.com",
    projectId: "projetocadastroalunos",
    storageBucket: "projetocadastroalunos.firebasestorage.app",
    messagingSenderId: "274079544555",
    appId: "1:274079544555:web:904e7744de1d038f097aae",
    measurementId: "G-7BP264WGDE"
};

//aqui fica a funcao cadastrar

/* PESQUISA SOBRE O TIPO 'CONST':
   A palavra-chave 'const' cria uma variável cujo valor é fixo, ou seja, uma constante. 
   Diferente do 'let', você não pode reatribuir um novo valor a ela depois de criada. 
   É ideal para segurança e para armazenar conexões como a do Firebase (db) e configurações.
*/

// Inicialização
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// ============================================================
// 📦 GAVETAS GLOBAIS
// ============================================================
let streamDaCamera;
let fotoBase64 = null;

// ============================================================
// 📸 PARTE 1: CÂMERA E FOTO
// ============================================================

window.abrirCamera = async function () {
    const video = document.getElementById('videoCamera');
    const btnCapturar = document.getElementById('btnCapturar');

    try {
        streamDaCamera = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
        video.srcObject = streamDaCamera;
        video.style.display = 'block';
        btnCapturar.style.display = 'block';
    } catch (erro) {
        alert("Câmera bloqueada! Libere o acesso no topo do navegador.");
        console.error("Erro ao ligar câmera:", erro);
    }
};

window.capturarFoto = function () {
    const video = document.getElementById('videoCamera');
    const fotoPreview = document.getElementById('previewFoto');

    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    const contexto = canvas.getContext('2d');
    contexto.drawImage(video, 0, 0, canvas.width, canvas.height);

    fotoBase64 = canvas.toDataURL('image/png');
    fotoPreview.src = fotoBase64;

    if (streamDaCamera) {
        streamDaCamera.getTracks().forEach(track => track.stop());
    }
    video.style.display = 'none';
    document.getElementById('btnCapturar').style.display = 'none';
};

// ============================================================
// 📂 PARTE 2: UPLOAD DE ARQUIVO
// ============================================================

document.getElementById('uploadFoto').addEventListener('change', function (event) {
    const arquivo = event.target.files[0];
    if (arquivo) {
        const leitor = new FileReader();
        leitor.onload = function (e) {
            document.getElementById('previewFoto').src = e.target.result;
            fotoBase64 = e.target.result;
        };
        leitor.readAsDataURL(arquivo);
    }
});



// ============================================================
// 💾 PARTE 4: Buscar CEP
// ============================================================

window.buscarEndereco = function () {
    const cep = document.getElementById('cep').value.replace(/\D/g, '');
    if (cep !== "" && /^[0-9]{8}$/.test(cep)) {
        document.getElementById('endereco').value = "...";
        document.getElementById('bairro').value = "...";
        document.getElementById('cidade').value = "...";
        document.getElementById('estado').value = "...";

        fetch(`https://viacep.com.br/ws/${cep}/json/`)
            .then(res => res.json())
            .then(dados => {
                if (!dados.erro) {
                    document.getElementById('endereco').value = dados.logradouro;
                    document.getElementById('bairro').value = dados.bairro;
                    document.getElementById('cidade').value = dados.localidade;
                    document.getElementById('estado').value = dados.uf;
                } else {
                    alert("CEP não encontrado.");
                }
            });
    }
};
// Função Cadastrar

// ============================================================
// BOTÕES DE AÇÃO (CRUD)
// ============================================================

window.cadastrar = async function () {

    const rg = document.getElementById('rg').value;
    const nome = document.getElementById('nome').value;
    const responsavel = document.getElementById('responsavel').value;
    const cep = document.getElementById('cep').value;
    const endereco = document.getElementById('endereco').value;
    const bairro = document.getElementById('bairro').value;
    const cidade = document.getElementById('cidade').value;
    const estado = document.getElementById('estado').value;
    const telefone = document.getElementById('telefone').value;
    const email = document.getElementById('emailResponsavel').value;

    if (!rg || !nome) {
        alert("Ei! Esqueceu de preencher o RA ou o Nome!");
        return;
    }

    try {

        const docRef = await addDoc(collection(db, "alunos"), {

            foto: fotoBase64,
            rg: rg,
            nome: nome,
            nomeResp: responsavel,
            cep: cep,
            endereco: endereco,
            bairro: bairro,
            cidade: cidade,
            estado: estado,
            telefone: telefone,
            email: email,
            dataCadastro: new Date()
        });
        //Aviso que o aluno foi cadastrado
        alert("Boa! O aluno " + nome + " foi salvo com o ID: " + docRef.id);
        // limpa todos os campos e posiciona o curso na primeira linha

        limpar();
    }

    catch (erro) {
        console.error("Erro no Firebase: ", erro);
        alert("Erro ao salvar! Verifique as permissões do Firestore." + erro);
    }
};
//CONSULTAR (Busca pelo RG)
window.consultar = async function () {
    const rg = document.getElementById('rg').value;

    if (!rg) {
        alert("Digite o RG para pesquisar!");
        return;
    }

    try {
        
        const q = query(collection(db, "alunos"), where("rg", "==", rg));
        const querySnapshot = await getDocs(q);

        if (querySnapshot.empty) {
            alert("Aluno não encontrado!");
            return;
        }

        // Preenche os campos com os dados encontrados
        querySnapshot.forEach((documento) => {
            const dados = documento.data();
            // Guardamos o ID do Firebase em um atributo invisível para usar no Alterar/Deletar
            document.getElementById('studentForm').setAttribute('data-id', documento.id);
            document.getElementById('nome').value = dados.nome;
            document.getElementById('responsavel').value = dados.nome;
            document.getElementById('cep').value = dados.cep;
            document.getElementById('endereco').value = dados.endereco;
            document.getElementById('bairro').value = dados.bairro;
            document.getElementById('cidade').value = dados.cidade;
            document.getElementById('estado').value = dados.estado;
            document.getElementById('responsavel').value = dados.responsavel;
            document.getElementById('emailResponsavel').value = dados.emailResp;
            document.getElementById('telefone').value = dados.telContato;
            document.getElementById('previewFoto').src = dados.foto || "https://via.placeholder.com/150";
            fotoBase64 = dados.foto;

            alert("Aluno localizado!");
        });
    } catch (erro) {
        console.error("Erro ao consultar:", erro);
    }
};

//ALTERAR (Atualiza os dados do aluno carregado)
window.alterar = async function () {
    const idNoFirebase = document.getElementById('studentForm').getAttribute('data-id');

    if (!idNoFirebase) {
        alert("Primeiro, consulte um aluno pelo RA para poder alterá-lo.");
        return;
    }

    const novosDados = {
        nome: document.getElementById('nome').value,
        responsavel: document.getElementById('responsavel').value,
        cep: document.getElementById('cep').value,
        endereco: document.getElementById('endereco').value,
        bairro: document.getElementById('bairro').value,
        cidade: document.getElementById('cidade').value,
        estado: document.getElementById('estado').value,
        emailResp: document.getElementById('emailResponsavel').value,
        telContato: document.getElementById('telefone').value,
        foto: fotoBase64
    };

    try {
        const alunoRef = doc(db, "alunos", idNoFirebase);
        await updateDoc(alunoRef, novosDados);
        alert("Dados atualizados com sucesso!");

        // limpa todos os campos e posiciona o curso na primeira linha
        limpar();

    } catch (erro) {
        console.error("Erro ao alterar:", erro);
        alert("Erro ao atualizar dados.");
    }
};

// DELETAR
window.deletar = async function () {
    const idNoFirebase = document.getElementById('studentForm').getAttribute('data-id');

    if (!idNoFirebase) {
        alert("Consulte um aluno pelo RA antes de deletar.");
        return;
    }

    if (confirm("Tem certeza que deseja excluir este aluno definitivamente?")) {
        try {
            await deleteDoc(doc(db, "alunos", idNoFirebase));
            alert("Aluno removido do sistema.");

            // Limpa o formulário após deletar
            document.getElementById('studentForm').reset();
            document.getElementById('studentForm').removeAttribute('data-id');
            document.getElementById('previewFoto').src = "https://via.placeholder.com/150";
        } catch (erro) {
            console.error("Erro ao deletar:", erro);
        }
    }
};

function limpar() {
    document.getElementById('previewFoto').src = "";
    document.getElementById('rg').value = "";
    document.getElementById('nome').value = "";
    document.getElementById('responsavel').value = "";
    document.getElementById('cep').value = "";
    document.getElementById('endereco').value = "";
    document.getElementById('bairro').value = "";
    document.getElementById('cidade').value = "";
    document.getElementById('estado').value = "";
    document.getElementById('emailResponsavel').value = ""
    document.getElementById('telefone').value = ""

    // posicionando o cursor no primeiro campo do forms
    document.forms[0].elements[0].focus();
}

// funções de mascará
window.mascaraRG = async function (input) {
    // Remove tudo que não é número
    input.value = input.value.replace(/\D/g, '');
    // Aplica a máscara: 00.000.000-0
    input.value = input.value.replace(/^(\d{2})(\d{3})(\d{3})(\d{1})$/, '$1.$2.$3-$4');
}

window.maskTelefone = async function (input) {
    // Remove tudo que não for número
    let value = input.value.replace(/\D/g, '');

    // Aplica a máscara baseada na quantidade de dígitos
    if (value.length > 10) {
        // Celular (11 dígitos): (00) 00000-0000
        value = value.replace(/^(\d{2})(\d{5})(\d{4})$/, '($1) $2-$3');
    } else {
        // Fixo (10 dígitos): (00) 0000-0000
        value = value.replace(/^(\d{2})(\d{4})(\d{0,4})$/, '($1) $2-$3');
    }

    input.value = value;
}