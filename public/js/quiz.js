// quiz.js
const socket = io();
const urlParams = new URLSearchParams(window.location.search);
const roomId = urlParams.get("room");

const questionDiv = document.getElementById("question");
const questionNumberDiv = document.getElementById("question-number");
const answerInput = document.getElementById("answer");
const statusDiv = document.getElementById("status");
const playerListDiv = document.getElementById("player-list");
const selfPlayerDiv = document.getElementById("self-player");

let typingInterval;
let currentText = "";
let charIndex = 0;
let isTypingPaused = false;

const isHost = sessionStorage.getItem("isHost") === "true";
const selectedGenre = localStorage.getItem("selectedGenre") || "kihon";
const avatar = sessionStorage.getItem("playerAvatar") || "default.png";

// 1. ルームに参加
socket.emit("join_room", {
  roomId,
  avatar,
  genre: selectedGenre,
});

// 2. ホストのみ問題を送信
if (isHost && selectedGenre) {
  fetch(`/data/${selectedGenre}.json`)
    .then((res) => res.json())
    .then((questions) => {
      socket.emit("send_questions", { roomId, questions });
    })
    .catch((err) => {
      console.error("\u274c \u554f\u984c\u8aad\u307f\u8fbc\u307f\u30a8\u30e9\u30fc:", err);
      questionDiv.textContent = "\u554f\u984c\u306e\u8aad\u307f\u8fbc\u307f\u306b\u5931\u6557\u3057\u307e\u3057\u305f";
    });
}

let timerInterval;
let remainingTime = 15;

function startTimer() {
  const timerDisplay = document.getElementById("timer");
  remainingTime = 15;
  timerDisplay.textContent = `残り時間：${remainingTime}秒`;
  clearInterval(timerInterval);
  timerInterval = setInterval(() => {
    remainingTime--;
    timerDisplay.textContent = `残り時間：${remainingTime}秒`;
    if (remainingTime <= 0) {
      clearInterval(timerInterval);
      answerInput.disabled = true;
      statusDiv.textContent = "時間切れです";
    }
  }, 1000);
}

// 3. 問題受信
socket.on("question", ({ question, index, total }) => {
  clearInterval(typingInterval);
  currentText = question;
  charIndex = 0;
  isTypingPaused = false;

  questionDiv.textContent = "";
  questionNumberDiv.textContent = `${index}/${total}`;
  statusDiv.textContent = "";
  answerInput.value = "";
  answerInput.disabled = true;

  startTyping();
  startTimer();
});

function startTyping() {
  typingInterval = setInterval(() => {
    if (isTypingPaused) return;
    if (charIndex < currentText.length) {
      questionDiv.textContent += currentText[charIndex++];
    } else {
      clearInterval(typingInterval);
    }
  }, 70);
}

socket.on("your_turn", () => {
  statusDiv.textContent = "あなたの番です。回答してください";
  answerInput.disabled = false;
  answerInput.focus();
});

socket.on("wait", () => {
  statusDiv.textContent = "他のプレイヤーが回答中です";
  answerInput.disabled = true;
});

socket.on("pause_typing", () => {
  isTypingPaused = true;
});

socket.on("result", ({ message }) => {
  statusDiv.textContent = message;
});

window.addEventListener("keydown", (e) => {
  if (e.key === "Enter" && answerInput.disabled) {
    socket.emit("buzz", roomId);
  }
});

answerInput.addEventListener("keydown", (e) => {
  if (e.key === "Enter" && !answerInput.disabled) {
    const answer = answerInput.value.trim();
    if (answer) {
      socket.emit("answer", { roomId, answer });
    }
  }
});

socket.on("players_update", ({ players }) => {
  playerListDiv.innerHTML = "";
  selfPlayerDiv.innerHTML = "";

  players.forEach((p) => {
    const html = `
      <img src="images/${p.avatar}" width="60" height="60"><br>
      <strong>${p.id === socket.id ? "自分" : "相手"}</strong><br>
      ポイント：${p.score}
    `;
    if (p.id === socket.id) {
      selfPlayerDiv.innerHTML = html;
    } else {
      const div = document.createElement("div");
      div.classList.add("player");
      div.innerHTML = html;
      playerListDiv.appendChild(div);
    }
  });
});
