const express = require("express");
const http = require("http");
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.static("public"));

let players = {};
let scores = {};
let buzzedPlayer = null;
let currentQuestion = 0;

const questions = [
    { question: "日本の首都は？", answer: "東京" },
    { question: "3×4は？", answer: "12" },
    { question: "Pythonの作者は？", answer: "Guido" }
];

io.on("connection", (socket) => {
    console.log("接続:", socket.id);

    socket.on("register", (name) => {
        players[socket.id] = name;
        scores[socket.id] = 0;
        console.log(`${name} が参加しました`);

        if (Object.keys(players).length >= 2) {
            io.emit("start", questions[currentQuestion].question);
        }
    });

    socket.on("buzz", () => {
        if (!buzzedPlayer) {
            buzzedPlayer = socket.id;
            io.emit("buzzed", players[socket.id]);
        }
    });

    socket.on("answer", (text) => {
        const correct = questions[currentQuestion].answer;
        if (text.trim().toLowerCase() === correct.toLowerCase()) {
            scores[socket.id] += 10;
            io.emit("result", `${players[socket.id]} 正解！`, scores);
        } else {
            scores[socket.id] -= 10;
            io.emit("result", `${players[socket.id]} 不正解！`, scores);
        }

        buzzedPlayer = null;
        currentQuestion++;

        if (currentQuestion < questions.length) {
            setTimeout(() => {
                io.emit("start", questions[currentQuestion].question);
            }, 2000);
        } else {
            io.emit("end", scores);
        }
    });

    socket.on("disconnect", () => {
        console.log("切断:", socket.id);
        delete players[socket.id];
        delete scores[socket.id];
    });
});

server.listen(3000,'0.0.0.0',() => {
    console.log("http://localhost:3000 にてサーバー実行中");
});
