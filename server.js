const express = require('express');
const app = express();
const path = require('path');
const http = require('http').createServer(app);
const { Server } = require('socket.io');
const io = new Server(http);

// 静的ファイル（HTML/CSS/JS）を public フォルダから配信
app.use(express.static('public'));

// 各画面へのルーティング
app.get('/', (req, res) => res.sendFile(path.join(__dirname, 'public/index.html')));
app.get('/room', (req, res) => res.sendFile(path.join(__dirname, 'public/room.html')));
app.get('/create', (req, res) => res.sendFile(path.join(__dirname, 'public/create.html')));
app.get('/join', (req, res) => res.sendFile(path.join(__dirname, 'public/join.html')));
app.get('/waiting', (req, res) => res.sendFile(path.join(__dirname, 'public/waiting.html')));
app.get('/genre', (req, res) => res.sendFile(path.join(__dirname, 'public/genre.html')));
app.get('/quiz', (req, res) => res.sendFile(path.join(__dirname, 'public/quiz.html')));
app.get('/result', (req, res) => res.sendFile(path.join(__dirname, 'public/result.html')));

// ルーム管理用
const rooms = {}; // { roomId: [socketId1, socketId2, ...] }

io.on("connection", (socket) => {
  socket.on("join_room", ({ roomId, isHost }) => {
    socket.join(roomId);
    rooms[roomId] = rooms[roomId] || { players: [], hostId: null };
    rooms[roomId].players.push(socket.id);

    // 最初に接続した人をホストにする
    if (!rooms[roomId].hostId) {
      rooms[roomId].hostId = socket.id;
      socket.emit("you_are_host");
    }

    // 現在の人数を全員に送信
    const userCount = rooms[roomId].players.length;
    io.to(roomId).emit("update_player_count", userCount);

    // 切断時の処理
    socket.on("disconnect", () => {
      if (rooms[roomId]) {
        rooms[roomId].players = rooms[roomId].players.filter(id => id !== socket.id);

        // ホストがいなくなった場合、新しいホストを割り当てる
        if (rooms[roomId].hostId === socket.id) {
          rooms[roomId].hostId = rooms[roomId].players[0] || null;
          if (rooms[roomId].hostId) {
            io.to(rooms[roomId].hostId).emit("you_are_host");
          }
        }

        // 人数更新
        io.to(roomId).emit("update_player_count", rooms[roomId].players.length);

        // 全員いなくなったらルーム削除
        if (rooms[roomId].players.length === 0) {
          delete rooms[roomId];
        }
      }
    });
  });

  socket.on("start_quiz", (roomId) => {
    io.to(roomId).emit("start_quiz");
  });
});

const PORT = process.env.PORT || 3000;
http.listen(PORT, () => {
  console.log(`サーバー起動中: http://localhost:${PORT}`);
});
