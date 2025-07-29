const express = require("express");
const http = require("http");
const path = require("path");
const { Server } = require("socket.io");
const fs = require("fs");

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.static("public"));

const DATA_PATH = path.join(__dirname, "public/data");

const rooms = {
  defaultRoom: {
    players: [],
    scores: {},
    info: {},
    genre: null,
    questions: [],
    current: 0,
    hostId: null,
    locked: new Set(),
    buzzed: null,
  }
};

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

io.on("connection", (socket) => {
  // ルーム参加
  socket.on("join_room", ({ name, avatar }) => {
    const roomId = "defaultRoom";
    socket.join(roomId);
    const room = rooms[roomId];

    if (!room.players.includes(socket.id)) {
      room.players.push(socket.id);
      room.scores[socket.id] = 0;
      room.info[socket.id] = {
        name: name || "プレイヤー",
        avatar: avatar || "default.png",
      };
    }

    if (!room.hostId) {
      room.hostId = socket.id;
    }

    console.log(`[JOIN] ${socket.id} joined ${roomId} as ${room.info[socket.id].name}`);

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
      const idx = room.players.indexOf(socket.id);
      if (idx !== -1) {
        room.players.splice(idx, 1);
        delete room.scores[socket.id];
        delete room.info[socket.id];
        room.locked.delete(socket.id);
        if (room.buzzed === socket.id) {
          room.buzzed = null;
        }
        if (room.hostId === socket.id) {
          room.hostId = room.players[0] || null;
          if (room.hostId) {
            io.to(room.hostId).emit("you_are_host", true);
          }
        }
        if (room.players.length === 0) {
          // 全員退出で初期化
          rooms[roomId] = {
            players: [],
            scores: {},
            info: {},
            genre: null,
            questions: [],
            current: 0,
            hostId: null,
            locked: new Set(),
            buzzed: null,
          };
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

  // 出題開始ボタン → ジャンル選択画面へ
  socket.on("start_genre", () => {
    io.to("defaultRoom").emit("go_genre");
  });

  // ジャンル決定（ホスト）
  socket.on("genreSelected", (genre) => {
    const room = rooms["defaultRoom"];
    if (!room) return;
    room.genre = genre;
    room.questions = loadQuestions(genre);
    room.current = 0;
    io.to("defaultRoom").emit("genreSelected", genre);
  });

  // バズ
  socket.on("buzz", () => {
    const room = rooms["defaultRoom"];
    if (!room || room.buzzed || room.locked.has(socket.id)) return;
    room.buzzed = socket.id;
    io.to("defaultRoom").emit("pause_typing");
    socket.emit("your_turn");
    socket.to("defaultRoom").emit("wait");
  });

  // 回答
  socket.on("answer", ({ answer }) => {
    const room = rooms["defaultRoom"];
    if (!room || room.buzzed !== socket.id) return;

    const q = room.questions[room.current];
    const correct = answer.trim().toLowerCase() === q.answer.toLowerCase();
    if (correct) {
      room.scores[socket.id] += 10;
      io.to("defaultRoom").emit("result", {
        message: "正解！ +10点",
        player: socket.id,
      });
    } else {
      room.scores[socket.id] -= 10;
      room.locked.add(socket.id);
      io.to("defaultRoom").emit("result", {
        message: "不正解… -10点",
        player: socket.id,
      });
    }

    room.buzzed = null;
    io.to("defaultRoom").emit("players_update", {
      players: room.players.map((id) => ({
        id,
        name: room.info[id].name,
        avatar: room.info[id].avatar,
        score: room.scores[id],
      })),
    });

    const winner = Object.entries(room.scores).find(([_, s]) => s >= 50);
    if (winner) {
      io.to("defaultRoom").emit("result", {
        message: `🎉 勝者決定！${room.info[winner[0]].name} が50点達成 🎉`,
        player: winner[0],
      });
      return;
    }

    if (room.locked.size === room.players.length) {
      room.current++;
      room.locked.clear();
      if (room.current < room.questions.length) {
        setTimeout(() => sendQuestion("defaultRoom"), 1500);
      } else {
        io.to("defaultRoom").emit("result", {
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

app.get("/", (_, res) => res.sendFile(path.join(__dirname, "public/index.html")));
app.get("/quiz", (_, res) => res.sendFile(path.join(__dirname, "public/quiz.html")));
app.get("/genre", (_, res) => res.sendFile(path.join(__dirname, "public/genre.html")));
app.get("/wait", (_, res) => res.sendFile(path.join(__dirname, "public/wait.html")));

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`✅ サーバー起動: http://localhost:${PORT}`);
});
