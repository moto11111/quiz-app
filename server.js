const express = require('express');
const path = require('path');
const http = require('http');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.static('public')); // public内を静的公開

// 問題リスト（ジャンル選択後はジャンル別に置き換えても可）
const questionList = [
  { question: "りんごを英語で？", answer: "apple" },
  { question: "犬を英語で？", answer: "dog" },
  { question: "猫を英語で？", answer: "cat" }
];

// ルームごとに情報管理
const rooms = {}; // { roomId: { players: [socket.id], scores: {}, current: 0, buzzed: null, locked: Set } }

io.on("connection", (socket) => {
  socket.on("join_room", ({ roomId }) => {
    socket.join(roomId);

    // ルーム初期化
    if (!rooms[roomId]) {
      rooms[roomId] = {
        players: [],
        scores: {},
        current: 0,
        buzzed: null,
        locked: new Set()
      };
    }

    rooms[roomId].players.push(socket.id);
    rooms[roomId].scores[socket.id] = 0;

    // 接続確認
    console.log(`[参加] ${socket.id} が ${roomId} に参加`);

    // プレイヤー数を待機画面へ通知
    io.to(roomId).emit("update_player_count", rooms[roomId].players.length);

    // 切断時の処理
    socket.on("disconnect", () => {
      const index = rooms[roomId]?.players.indexOf(socket.id);
      if (index !== -1) {
        rooms[roomId].players.splice(index, 1);
        delete rooms[roomId].scores[socket.id];
        rooms[roomId].locked.delete(socket.id);

        // プレイヤー数更新
        io.to(roomId).emit("update_player_count", rooms[roomId].players.length);

        // 全員退出ならルーム削除
        if (rooms[roomId].players.length === 0) {
          delete rooms[roomId];
        }
      }
    });
  });

  // クイズ開始
  socket.on("start_quiz", (roomId) => {
    rooms[roomId].current = 0;
    sendQuestion(roomId);
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

    room.buzzed = null;

    const winner = Object.entries(room.scores).find(([id, score]) => score >= 50);
    if (winner) {
      io.to(roomId).emit("result", { message: `🎉 勝者決定！${winner[0]} が50点達成 🎉`, player: winner[0] });
      return;
    }

    // 全員お手付き or 回答終わったら次の問題
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

// 問題送信（タイプライター式用）
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

// HTMLルーティング
app.get("/", (_, res) => res.sendFile(path.join(__dirname, "public/index.html")));
app.get("/quiz", (_, res) => res.sendFile(path.join(__dirname, "public/quiz.html")));

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`✅ サーバー起動中: http://localhost:${PORT}`);
});
