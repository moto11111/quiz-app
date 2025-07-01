const express = require('express');
const app = express();
const path = require('path');
const http = require('http').createServer(app);
const WebSocket = require('ws');
const wss = new WebSocket.Server({ server: http });

// 静的ファイル（HTML/CSS/JS）を public フォルダから配信
app.use(express.static('public'));

// 各画面へのルーティング（必要に応じて追加）
app.get('/', (req, res) => res.sendFile(path.join(__dirname, 'public/index.html')));
app.get('/room', (req, res) => res.sendFile(path.join(__dirname, 'public/room.html')));
app.get('/create', (req, res) => res.sendFile(path.join(__dirname, 'public/create.html')));
app.get('/join', (req, res) => res.sendFile(path.join(__dirname, 'public/join.html')));
app.get('/waiting', (req, res) => res.sendFile(path.join(__dirname, 'public/waiting.html')));
app.get('/genre', (req, res) => res.sendFile(path.join(__dirname, 'public/genre.html')));
app.get('/quiz', (req, res) => res.sendFile(path.join(__dirname, 'public/quiz.html')));
app.get('/result', (req, res) => res.sendFile(path.join(__dirname, 'public/result.html')));

// ルーム管理用
const rooms = {}; // { roomId: [socket1, socket2, ...] }

wss.on('connection', (ws) => {
  let currentRoom = null;
  let isHost = false;

  ws.on('message', (data) => {
    let msg;
    try {
      msg = JSON.parse(data);
    } catch (e) {
      console.error('JSON parse error:', e);
      return;
    }

    // クライアントがルームに参加
    if (msg.type === 'join-room') {
      currentRoom = msg.roomId;

      if (!rooms[currentRoom]) {
        rooms[currentRoom] = [];
        isHost = true; // 最初の接続者をホストに
      }

      rooms[currentRoom].push(ws);

      // 現在の人数をルーム全体に送信
      const userCount = rooms[currentRoom].length;
      rooms[currentRoom].forEach(client => {
        if (client.readyState === WebSocket.OPEN) {
          client.send(JSON.stringify({
            type: 'user-count',
            count: userCount
          }));
        }
      });

      // ホストに出題開始ボタンを表示するよう指示
      if (isHost && ws.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify({
          type: 'you-are-host'
        }));
      }
    }

    // ホストが出題開始ボタンを押したとき
    if (msg.type === 'start-quiz' && currentRoom && rooms[currentRoom]) {
      rooms[currentRoom].forEach(client => {
        if (client.readyState === WebSocket.OPEN) {
          client.send(JSON.stringify({
            type: 'start-quiz'
          }));
        }
      });
    }
  });

  ws.on('close', () => {
    if (currentRoom && rooms[currentRoom]) {
      rooms[currentRoom] = rooms[currentRoom].filter(client => client !== ws);
      // 0人になったらルーム削除
      if (rooms[currentRoom].length === 0) {
        delete rooms[currentRoom];
      }
    }
  });
});

const PORT = process.env.PORT || 3000;
http.listen(PORT, () => {
  console.log(`サーバー起動中: http://localhost:${PORT}`);
});
