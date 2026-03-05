function navegar(destino) {
    console.log("Navegando para: " + destino);

    // Exemplo de redirecionamento:
    if (destino === 'diario') {
        alert("Abrindo Diário de Aula...");
        window.location.href = "diario.html";
    } else if (destino === 'carometro') {
        window.location.href = "carometro.html";
    } else if (destino == "cadastro") {
        window.location.href = "home.html";
    } else {
        alert("Abrindo Lista de Alunos...");
    }
}
