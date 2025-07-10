const express = require('express');
const path = require('path');
const http = require('http');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.static('public'));

// 問題リスト
const questionList = [
  { question: "りんごを英語で？", answer: "apple" },
  { question: "犬を英語で？", answer: "dog" },
  { question: "猫を英語で？", answer: "cat" }
];

// ルームごとの状態
const rooms = {}; // roomId: { players: [], scores: {}, info: {}, current, buzzed, locked, hostId }

io.on("connection", (socket) => {

  // ルーム参加
  socket.on("join_room", ({ roomId, name = "名無し", avatar = "default.png" }) => {
    socket.join(roomId);

    if (!rooms[roomId]) {
      rooms[roomId] = {
        players: [],
        scores: {},
        info: {},
        current: 0,
        buzzed: null,
        locked: new Set(),
        hostId: socket.id // ✅ 初参加者をホストに
      };
      socket.emit("you_are_host");
    } else if (!rooms[roomId].hostId) {
      rooms[roomId].hostId = socket.id;
      socket.emit("you_are_host");
    }

    const room = rooms[roomId];
    room.players.push(socket.id);
    room.scores[socket.id] = 0;
    room.info[socket.id] = { name, avatar };

    console.log(`[参加] ${socket.id} が ${roomId} に参加（${name}）`);

    // プレイヤー情報を送信
    sendPlayerList(roomId);
    io.to(roomId).emit("update_player_count", room.players.length);

    // 切断処理
    socket.on("disconnect", () => {
      if (!rooms[roomId]) return;

      const index = room.players.indexOf(socket.id);
      if (index !== -1) {
        room.players.splice(index, 1);
        delete room.scores[socket.id];
        delete room.info[socket.id];
        room.locked.delete(socket.id);

        // ホストが抜けた場合は交代
        if (room.hostId === socket.id) {
          room.hostId = room.players[0] || null;
          if (room.hostId) {
            io.to(room.hostId).emit("you_are_host");
          }
        }
      }

      sendPlayerList(roomId);
      io.to(roomId).emit("update_player_count", room.players.length);

      if (room.players.length === 0) {
        delete rooms[roomId];
      }
    });
  });

// クイズ開始
socket.on("start_quiz", (roomId) => {
  if (rooms[roomId]) {
    rooms[roomId].current = 0;

    // ✅ ルーム内の全クライアントに「クイズ開始」を通知（画面遷移用）
    io.to(roomId).emit("start_quiz");

    // ✅ 最初の問題を送信
    sendQuestion(roomId);
  }
});


  // 早押し
  socket.on("buzz", (roomId) => {
    const room = rooms[roomId];
    if (!room || room.buzzed || room.locked.has(socket.id)) return;

    room.buzzed = socket.id;
    io.to(roomId).emit("pause_typing");
    socket.emit("your_turn");
    socket.to(roomId).emit("wait");
  });

  // 回答処理
  socket.on("answer", ({ roomId, answer }) => {
    const room = rooms[roomId];
    if (!room || room.buzzed !== socket.id) return;

    const q = questionList[room.current];
    const correct = q.answer.toLowerCase();
    const isCorrect = answer.trim().toLowerCase() === correct;

    if (isCorrect) {
      room.scores[socket.id] += 10;
      io.to(roomId).emit("result", { message: "正解！ +10点", player: socket.id });
    } else {
      room.scores[socket.id] -= 10;
      room.locked.add(socket.id);
      io.to(roomId).emit("result", { message: `不正解… -10点`, player: socket.id });
    }

    sendPlayerList(roomId);
    room.buzzed = null;

    const winner = Object.entries(room.scores).find(([id, score]) => score >= 50);
    if (winner) {
      io.to(roomId).emit("result", { message: `🎉 勝者決定！${room.info[winner[0]].name} が50点達成 🎉`, player: winner[0] });
      return;
    }

    if (room.locked.size === room.players.length) {
      room.current++;
      room.locked.clear();
      if (room.current < questionList.length) {
        setTimeout(() => sendQuestion(roomId), 1500);
      } else {
        io.to(roomId).emit("result", { message: "クイズ終了！", player: null });
      }
    }
  });
});

// 問題送信
function sendQuestion(roomId) {
  const room = rooms[roomId];
  if (!room) return;

  const q = questionList[room.current];
  room.buzzed = null;
  room.locked.clear();

  io.to(roomId).emit("question", {
    question: q.question,
    index: room.current + 1,
    total: questionList.length
  });
}

// プレイヤー一覧送信
function sendPlayerList(roomId) {
  const room = rooms[roomId];
  if (!room) return;

  io.to(roomId).emit("players_update", {
    players: room.players.map(id => ({
      id,
      name: room.info[id]?.name || "名無し",
      avatar: room.info[id]?.avatar || "default.png",
      score: room.scores[id] || 0
    }))
  });
}

// HTMLルーティング
app.get("/", (_, res) => res.sendFile(path.join(__dirname, "public/index.html")));
app.get("/quiz", (_, res) => res.sendFile(path.join(__dirname, "public/quiz.html")));

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`✅ サーバー起動中: http://localhost:${PORT}`);
});
