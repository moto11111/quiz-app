const express = require('express');
const app = express();
const path = require('path');
const fs = require('fs');
const http = require('http').createServer(app);
const WebSocket = require('ws');
const wss = new WebSocket.Server({ server: http });

app.use(express.static('public'));

// HTML画面ルーティング
app.get('/', (req, res) => res.sendFile(path.join(__dirname, 'public/index.html')));
app.get('/genre', (req, res) => res.sendFile(path.join(__dirname, 'public/genre.html')));
app.get('/quiz', (req, res) => res.sendFile(path.join(__dirname, 'public/quiz.html')));

// 問題読み込み関数
function loadQuestions(genre) {
  const filePath = path.join(__dirname, 'data', `${genre}.json`);
  try {
    const data = fs.readFileSync(filePath, 'utf-8');
    return JSON.parse(data);
  } catch (err) {
    console.error(`[エラー] 問題読み込み失敗: ${err}`);
    return [];
  }
}

// クイズ状態管理
let currentGenre = 'kihon';
let currentQuestions = [];

wss.on('connection', (ws) => {
  console.log('クライアント接続');

  ws.on('message', (message) => {
    const msg = message.toString();
    console.log(`受信: ${msg}`);

    if (msg.startsWith('GENRE:')) {
      const genre = msg.split(':')[1];
      currentGenre = genre;
      currentQuestions = loadQuestions(genre);
      console.log(`[ジャンル選択] ${genre} 読み込み完了 (${currentQuestions.length}問)`);

      if (currentQuestions.length > 0) {
        ws.send(`QUESTION:${currentQuestions[0].question}`);
      } else {
        ws.send("QUESTION:問題がありません");
      }
    }
  });

  ws.on('close', () => {
    console.log('クライアント切断');
  });
});

const PORT = process.env.PORT || 3000;
http.listen(PORT, () => {
  console.log(`サーバー起動: http://localhost:${PORT}`);
});
