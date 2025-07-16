// server.js
const express = require("express");
const path = require("path");
const http = require("http");
const { Server } = require("socket.io");
const fs = require("fs");

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.static("public"));
const DATA_PATH = path.join(__dirname, "public/data");

function loadQuestions(genre) {
  try {
    const filePath = path.join(DATA_PATH, `${genre}.json`);
    const data = fs.readFileSync(filePath, "utf-8");
    return JSON.parse(data);
  } catch (e) {
    console.error(`❌ 問題読み込み失敗: ${genre}`, e);
    return [];
  }
}

const rooms = {}; // { roomId: { ... } }

io.on("connection", (socket) => {
  socket.on("join_room", ({ roomId, avatar = "default.png", genre }) => {
    socket.join(roomId);

    if (!rooms[roomId]) {
      const questions = loadQuestions(genre);
      rooms[roomId] = {
        players: [],
        scores: {},
        info: {},
        current: 0,
        buzzed: null,
        locked: new Set(),
        hostId: socket.id,
        genre,
        questions
      };
      socket.emit("you_are_host");
    } else {
      socket.emit("you_are_guest");
    }

    const room = rooms[roomId];
    room.players.push(socket.id);
    room.scores[socket.id] = 0;
    room.info[socket.id] = { avatar };

    sendPlayerList(roomId);
    io.to(roomId).emit("update_player_count", room.players.length);
    io.to(socket.id).emit("genre_selected", room.genre);

    socket.on("disconnect", () => {
      if (!rooms[roomId]) return;

      const index = room.players.indexOf(socket.id);
      if (index !== -1) {
        room.players.splice(index, 1);
        delete room.scores[socket.id];
        delete room.info[socket.id];
        room.locked.delete(socket.id);

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

  socket.on("start_quiz", (roomId) => {
    if (rooms[roomId]) {
      rooms[roomId].current = 0;
      io.to(roomId).emit("start_quiz");
      sendQuestion(roomId);
    }
  });

  socket.on("buzz", (roomId) => {
    const room = rooms[roomId];
    if (!room || room.buzzed || room.locked.has(socket.id)) return;

    room.buzzed = socket.id;
    io.to(roomId).emit("pause_typing");
    socket.emit("your_turn");
    socket.to(roomId).emit("wait");
  });

  socket.on("answer", ({ roomId, answer }) => {
    const room = rooms[roomId];
    if (!room || room.buzzed !== socket.id) return;

    const q = room.questions[room.current];
    const correct = q.answer.toLowerCase();
    const isCorrect = answer.trim().toLowerCase() === correct;

    if (isCorrect) {
      room.scores[socket.id] += 10;
      io.to(roomId).emit("result", { message: "正解！ +10点", player: socket.id });
    } else {
      room.scores[socket.id] -= 10;
      room.locked.add(socket.id);
      io.to(roomId).emit("result", { message: "不正解… -10点", player: socket.id });
    }

    sendPlayerList(roomId);
    room.buzzed = null;

    const winner = Object.entries(room.scores).find(([id, score]) => score >= 50);
    if (winner) {
      io.to(roomId).emit("result", {
        message: `🎉 勝者決定！${room.info[winner[0]].avatar} が50点達成 🎉`,
        player: winner[0]
      });
      return;
    }

    if (room.locked.size === room.players.length) {
      room.current++;
      room.locked.clear();
      if (room.current < room.questions.length) {
        setTimeout(() => sendQuestion(roomId), 1500);
      } else {
        io.to(roomId).emit("result", { message: "クイズ終了！", player: null });
      }
    }
  });
});

function sendQuestion(roomId) {
  const room = rooms[roomId];
  if (!room) return;

  const q = room.questions[room.current];
  room.buzzed = null;
  room.locked.clear();

  io.to(roomId).emit("question", {
    question: q.question,
    index: room.current + 1,
    total: room.questions.length
  });
}

function sendPlayerList(roomId) {
  const room = rooms[roomId];
  if (!room) return;

  io.to(roomId).emit("players_update", {
    players: room.players.map(id => ({
      id,
      avatar: room.info[id]?.avatar || "default.png",
      score: room.scores[id] || 0
    }))
  });
}

app.get("/", (_, res) => res.sendFile(path.join(__dirname, "public/index.html")));
app.get("/quiz", (_, res) => res.sendFile(path.join(__dirname, "public/quiz.html")));

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`✅ サーバー起動中: http://localhost:${PORT}`);
});
