const express = require('express');
const app = express();
const path = require('path');
const fs = require('fs');
const http = require('http').createServer(app);
const WebSocket = require("ws");
const wss = new WebSocket.Server({ server: http });
const rooms = {};  // ルームIDごとの接続管理


app.use(express.static('public'));

// HTML画面ルーティング
app.get('/', (req, res) => res.sendFile(path.join(__dirname, 'public/index.html')));
app.get('/genre', (req, res) => res.sendFile(path.join(__dirname, 'public/genre.html')));
app.get('/quiz', (req, res) => res.sendFile(path.join(__dirname, 'public/quiz.html')));
app.get('/waiting', (req, res) => {
res.sendFile(path.join(__dirname, 'public/waiting.html'));
});

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

wss.on("connection", (ws) => {
  ws.on("message", (data) => {
    let msg;
    try {
      msg = JSON.parse(data);
    } catch (e) {
      console.error("不正なJSON:", data);
      return;
    }

    if (msg.type === "join_waiting") {
      const roomId = msg.roomId;
      if (!rooms[roomId]) {
        rooms[roomId] = { clients: [], max: 2 };
      }

      rooms[roomId].clients.push(ws);
      ws.roomId = roomId;

      // 現在の人数をルーム内全員に通知
      const count = rooms[roomId].clients.length;
      rooms[roomId].clients.forEach(client => {
        if (client.readyState === WebSocket.OPEN) {
          client.send(JSON.stringify({
            type: "update_player_count",
            count: count,
            max: rooms[roomId].max
          }));
        }
      });
    }

    if (msg.type === "start_quiz") {
      const roomId = msg.roomId;
      if (rooms[roomId]) {
        rooms[roomId].clients.forEach(client => {
          if (client.readyState === WebSocket.OPEN) {
            client.send(JSON.stringify({ type: "start_quiz" }));
          }
        });
      }
    }
  });

  ws.on("close", () => {
    const roomId = ws.roomId;
    if (roomId && rooms[roomId]) {
      rooms[roomId].clients = rooms[roomId].clients.filter(c => c !== ws);
    }
  });
});

const PORT = process.env.PORT || 3000;
http.listen(PORT, () => {
  console.log(`サーバー起動: http://localhost:${PORT}`);
});
