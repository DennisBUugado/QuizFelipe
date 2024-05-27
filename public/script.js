document.addEventListener('DOMContentLoaded', (event) => {
    const perguntaDiv = document.getElementById('pergunta');
    const alternativasDiv = document.getElementById('alternativas');
    const pontuacaoDiv = document.getElementById('pontuação');
    let playerName = prompt("Nick do Jogador:");

    const socket = new WebSocket('ws://localhost:3000');

    socket.addEventListener('open', (event) => {
        console.log('Conectado.');
    });

    socket.addEventListener('message', (event) => {
        const message = JSON.parse(event.data);
        console.log('Mensagem do servidor:', message);

        if (message.type === 'question') {
            displayQuestion(message.data);
        } else if (message.type === 'result') {
            alert(message.data === 'correct' ? 'CORRETO!' : 'Resposta ERRADA.');
        } else if (message.type === 'pontuação') {
            updatePontuacao(message.data);
        } else if (message.type === 'end') {
            alert(message.data);
            resetGame();
        }
    });

    function displayQuestion(perguntaData) {
        perguntaDiv.textContent = perguntaData.pergunta;
        alternativasDiv.innerHTML = '';

        perguntaData.alternativas.forEach(alternativa => {
            const alternativaDiv = document.createElement('div');
            alternativaDiv.className = 'alternativa';
            alternativaDiv.textContent = alternativa;
            alternativaDiv.addEventListener('click', () => sendResposta(perguntaData.pergunta, alternativa));
            alternativasDiv.appendChild(alternativaDiv);
        });
    }

    function sendResposta(pergunta, resposta) {
        const message = {
            type: 'resposta',
            player: playerName,
            pergunta: pergunta,
            data: resposta
        };
        socket.send(JSON.stringify(message));
    }

    function updatePontuacao(pontuações) {
        pontuacaoDiv.textContent = `Pontuação: ${pontuações[playerName] || 0}`;
    }

    function resetGame() {
        playerName = prompt("Nick do Jogador:");
        socket.send(JSON.stringify({ type: 'restart', player: playerName }));
    }
});
