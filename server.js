const express = require("express");
const http = require("http");
const path = require("path");
const { Server } = require("socket.io");
const fs = require("fs");

const app = express();
const server = http.createServer(app);
const io = new Server(server);

// 静的ファイル
app.use(express.static("public"));

// データディレクトリ
const DATA_PATH = path.join(__dirname, "public/data");

// ルーム管理
const rooms = {}; // { roomId: { players, scores, info, genre, current, questions, hostId, locked, buzzed } }

function loadQuestions(genre) {
  try {
    const filePath = path.join(DATA_PATH, `${genre}.json`);
    const data = fs.readFileSync(filePath, "utf-8");
    return JSON.parse(data);
  } catch (e) {
    console.error("❌ 問題読み込み失敗:", genre, e);
    return [];
  }
}

// ソケット接続
io.on("connection", (socket) => {
  // ルーム参加
  socket.on("join_room", ({ roomId, avatar }) => {
    socket.join(roomId);
    if (!rooms[roomId]) {
      rooms[roomId] = {
        players: [],
        scores: {},
        info: {},
        genre: null,
        questions: [],
        current: 0,
        hostId: socket.id,
        locked: new Set(),
        buzzed: null,
      };
    }

    console.log(`[JOIN_ROOM] socket.id=${socket.id}, roomId=${roomId}, avatar=${avatar}`);

    const room = rooms[roomId];
    room.players.push(socket.id);
    room.scores[socket.id] = 0;
    room.info[socket.id] = {
      name: socket.id === room.hostId ? "自分" : "相手",
      avatar: avatar || "default.png",
    };

    socket.emit("you_are_host", socket.id === room.hostId);
    io.to(roomId).emit("players_update", {
      players: room.players.map((id) => ({
        id,
        name: room.info[id].name,
        avatar: room.info[id].avatar,
        score: room.scores[id],
      })),
      count: `${room.players.length}/2`,
    });

    socket.on("disconnect", () => {
      if (!rooms[roomId]) return;
      const index = room.players.indexOf(socket.id);
      if (index !== -1) {
        room.players.splice(index, 1);
        delete room.scores[socket.id];
        delete room.info[socket.id];
        room.locked?.delete(socket.id);

        if (room.hostId === socket.id) {
          room.hostId = room.players[0] || null;
          if (room.hostId) {
            io.to(room.hostId).emit("you_are_host", true);
          }
        }

        if (room.players.length === 0) {
          delete rooms[roomId];
        } else {
          io.to(roomId).emit("players_update", {
            players: room.players.map((id) => ({
              id,
              name: room.info[id].name,
              avatar: room.info[id].avatar,
              score: room.scores[id],
            })),
            count: `${room.players.length}/2`,
          });
        }
      }
    });
  });

  // 出題開始（ジャンル選択へ）
  socket.on("start_genre", (roomId) => {
    io.to(roomId).emit("go_genre");
  });

  // ジャンル決定
  socket.on("select_genre", ({ roomId, genre }) => {
    const room = rooms[roomId];
    if (!room) return;
    room.genre = genre;
    room.questions = loadQuestions(genre);
    room.current = 0;
    io.to(roomId).emit("start_quiz");
    sendQuestion(roomId);
  });

  socket.on("genre_selected", ({ roomId, genre }) => {
    const room = rooms[roomId];
    if (!room) return;

    room.genre = genre;
    room.questions = loadQuestions(genre);

    // 全員にジャンルと開始命令を送る
    io.to(roomId).emit("start_quiz", genre);
  });

  

  // バズ
  socket.on("buzz", (roomId) => {
    const room = rooms[roomId];
    if (!room || room.buzzed || room.locked.has(socket.id)) return;
    room.buzzed = socket.id;
    io.to(roomId).emit("pause_typing");
    socket.emit("your_turn");
    socket.to(roomId).emit("wait");
  });

  // 回答
  socket.on("answer", ({ roomId, answer }) => {
    const room = rooms[roomId];
    if (!room || room.buzzed !== socket.id) return;
    const q = room.questions[room.current];
    const isCorrect = answer.trim().toLowerCase() === q.answer.toLowerCase();

    if (isCorrect) {
      room.scores[socket.id] += 10;
      io.to(roomId).emit("result", {
        message: "正解！ +10点",
        player: socket.id,
      });
    } else {
      room.scores[socket.id] -= 10;
      room.locked.add(socket.id);
      io.to(roomId).emit("result", {
        message: "不正解… -10点",
        player: socket.id,
      });
    }

    room.buzzed = null;
    io.to(roomId).emit("players_update", {
      players: room.players.map((id) => ({
        id,
        name: room.info[id].name,
        avatar: room.info[id].avatar,
        score: room.scores[id],
      })),
    });

      // ホストがジャンルを選択したとき
    socket.on("genre_selected", ({ roomId, genre }) => {
      const room = rooms[roomId];
      if (!room) return;

      room.genre = genre;
      room.questions = loadQuestions(genre);

      // 全員にジャンルと開始命令を送る
      io.to(roomId).emit("start_quiz", genre);
    });


    const winner = Object.entries(room.scores).find(([_, s]) => s >= 50);
    if (winner) {
      io.to(roomId).emit("result", {
        message: `🎉 勝者決定！${room.info[winner[0]].name} が50点達成 🎉`,
        player: winner[0],
      });
      return;
    }

    if (room.locked.size === room.players.length) {
      room.current++;
      room.locked.clear();
      if (room.current < room.questions.length) {
        setTimeout(() => sendQuestion(roomId), 1500);
      } else {
        io.to(roomId).emit("result", {
          message: "クイズ終了！",
          player: null,
        });
      }
    }
  });
});

function sendQuestion(roomId) {
  const room = rooms[roomId];
  if (!room || !room.questions[room.current]) return;
  const q = room.questions[room.current];
  io.to(roomId).emit("question", {
    question: q.question,
    index: room.current + 1,
    total: room.questions.length,
  });
}

// ルーティング
app.get("/", (_, res) => res.sendFile(path.join(__dirname, "public/index.html")));
app.get("/quiz", (_, res) => res.sendFile(path.join(__dirname, "public/quiz.html")));
app.get("/genre", (_, res) => res.sendFile(path.join(__dirname, "public/genre.html")));
app.get("/wait", (_, res) => res.sendFile(path.join(__dirname, "public/wait.html")));

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`✅ サーバー起動: http://localhost:${PORT}`);
});
