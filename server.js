const express = require('express');
const http = require('http');
const WebSocket = require('ws');
const fs = require('fs');

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

const perguntas = JSON.parse(fs.readFileSync('perguntas.json', 'utf-8'));

app.use(express.static('public'));

let playerPontuacoes = {};

wss.on('connection', (ws) => {
    console.log('Cliente conectado.');

    sendQuestion(ws);

    ws.on('message', (message) => {
        const parsedMessage = JSON.parse(message);

        if (parsedMessage.type === 'resposta') {
            const player = parsedMessage.player;
            const resposta = parsedMessage.data;
            const respostaCorreta = perguntas.find(q => q.pergunta === parsedMessage.pergunta).resposta;

            if (!playerPontuacoes[player]) {
                playerPontuacoes[player] = 0;
            }

            if (resposta === respostaCorreta) {
                playerPontuacoes[player] += 1;
                ws.send(JSON.stringify({ type: 'result', data: 'correct' }));
            } else {
                ws.send(JSON.stringify({ type: 'result', data: 'incorrect' }));
            }

            if (playerPontuacoes[player] >= 6) {
                ws.send(JSON.stringify({ type: 'end', data: `Você ganhou! Pontuação final: ${playerPontuacoes[player]}` }));
                playerPontuacoes[player] = 0; 
            } else {
                sendQuestion(ws);
            }

            ws.send(JSON.stringify({ type: 'pontuação', data: playerPontuacoes }));
        }
    });

    ws.on('close', () => {
        console.log('Cliente desconectado.');
    });
});

function sendQuestion(ws) {
    const pergunta = getRandomQuestion();
    ws.send(JSON.stringify({ type: 'question', data: pergunta }));
}

function getRandomQuestion() {
    const randomIndex = Math.floor(Math.random() * perguntas.length);
    const pergunta = perguntas[randomIndex];
    return {
        pergunta: pergunta.pergunta,
        alternativas: pergunta.alternativas
    };
}

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`Servidor rodando. Porta: ${PORT}`);
});
