const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const app = express();
const server = http.createServer(app);
const io = new Server(server);
const path = require('path');

app.use(express.static('public'));

const questions = [
  { question: "りんごを英語で？", answer: "apple" },
  { question: "犬を英語で？", answer: "dog" },
  { question: "猫を英語で？", answer: "cat" }
];

let currentIndex = 0;
let buzzedPlayer = null;
let scores = {};

io.on('connection', (socket) => {
  scores[socket.id] = 0;

  if (currentIndex < questions.length) {
    io.emit("question", questions[currentIndex]);
  }

  socket.on("buzz", () => {
    if (!buzzedPlayer) {
      buzzedPlayer = socket.id;
      io.emit("pause_typing");
      socket.emit("your_turn");
      socket.broadcast.emit("wait");
    }
  });

  socket.on("answer", (answer) => {
    const correct = questions[currentIndex].answer.toLowerCase();
    if (answer.toLowerCase() === correct) {
      scores[socket.id] += 10;
      io.emit("result", { message: `正解！ +10点`, next: true });
    } else {
      scores[socket.id] -= 10;
      io.emit("result", { message: `不正解 -10点（正解: ${correct}）`, next: true });
    }

    currentIndex++;
    buzzedPlayer = null;

    if (scores[socket.id] >= 50) {
      io.emit("result", { message: `🎉 勝者！ゲーム終了 🎉`, next: false });
    } else if (currentIndex < questions.length) {
      setTimeout(() => {
        io.emit("question", questions[currentIndex]);
      }, 1500);
    } else {
      io.emit("result", { message: "全問終了", next: false });
    }
  });

  socket.on("disconnect", () => {
    delete scores[socket.id];
    if (buzzedPlayer === socket.id) buzzedPlayer = null;
  });
});

server.listen(process.env.PORT || 3000, () => {
  console.log("サーバー起動");
});
