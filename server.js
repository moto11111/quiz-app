// 必要なモジュール読み込み
const express = require('express');
const path = require('path');
const http = require('http');
const WebSocket = require('ws'); // ← WebSocket追加（テスト用）

const app = express();
const server = http.createServer(app); // ← httpサーバを作成
const wss = new WebSocket.Server({ server }); // ← WebSocketサーバを http サーバに接続（テスト用）

// public フォルダを公開
app.use(express.static('public'));

// 各画面へのルーティング
app.get('/', (req, res) => res.sendFile(path.join(__dirname, 'public/index.html')));
app.get('/room', (req, res) => res.sendFile(path.join(__dirname, 'public/room.html')));
app.get('/avatar', (req, res) => res.sendFile(path.join(__dirname, 'public/avatar.html')));
app.get('/waiting', (req, res) => res.sendFile(path.join(__dirname, 'public/waiting.html')));
app.get('/genre', (req, res) => res.sendFile(path.join(__dirname, 'public/genre.html')));
app.get('/quiz', (req, res) => res.sendFile(path.join(__dirname, 'public/quiz.html')));
app.get('/result', (req, res) => res.sendFile(path.join(__dirname, 'public/result.html')));
app.get('/test', (req, res) => res.sendFile(path.join(__dirname, 'public/test.html'))); // ← テスト画面

// WebSocket サーバー処理（テスト用）
wss.on('connection', (ws) => {
  console.log('クライアント接続');

  ws.on('message', (message) => {
    console.log(`受信: ${message}`);
    // 接続中の全クライアントに送信
    wss.clients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(message);
      }
    });
  });

  ws.on('close', () => {
    console.log('クライアント切断');
  });
});

// サーバー起動
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`サーバー起動中: http://localhost:${PORT}`);
});
