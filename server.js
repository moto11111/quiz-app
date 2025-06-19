const express = require('express');
const app = express();
const path = require('path');

const http = require('http').createServer(app);//テスト用

app.use(express.static('public')); // public フォルダを公開

// 画面ごとのルート設定
app.get('/', (req, res) => res.sendFile(path.join(__dirname, 'public/index.html')));
app.get('/room', (req, res) => res.sendFile(path.join(__dirname, 'public/room.html')));
app.get('/avatar', (req, res) => res.sendFile(path.join(__dirname, 'public/avatar.html')));
app.get('/waiting', (req, res) => res.sendFile(path.join(__dirname, 'public/waiting.html')));
app.get('/genre', (req, res) => res.sendFile(path.join(__dirname, 'public/genre.html')));
app.get('/quiz', (req, res) => res.sendFile(path.join(__dirname, 'public/quiz.html')));
app.get('/result', (req, res) => res.sendFile(path.join(__dirname, 'public/result.html')));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));

wss.on('connection', (ws) => {//ここからテスト用
  console.log('クライアント接続');

  ws.on('message', (message) => {
    console.log(`受信: ${message}`);
    // 全クライアントに送信
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

app.use(express.static('public'));

http.listen(process.env.PORT || 3000, () => {
  console.log('サーバー起動中');
});//テストここまで