const socket = io();
const urlParams = new URLSearchParams(window.location.search);
const roomId = urlParams.get('room');
const genre = localStorage.getItem("selectedGenre") || "kihon";
const isHost = sessionStorage.getItem("isHost") === "true";

// 自分の名前とアバター（必要に応じて取得して置き換えてください）
const playerName = "プレイヤー名";
const playerAvatar = "avatar1.png";

// DOM 要素
const questionDiv = document.getElementById("question");
const questionNumberDiv = document.getElementById("question-number");
const answerInput = document.getElementById("answer");
const statusDiv = document.getElementById("status");
const playerListDiv = document.getElementById("player-list");
const selfPlayerDiv = document.getElementById("self-player");

// ルームに参加（ジャンル含む）
socket.emit("join_room", {
  roomId,
  name: playerName,
  avatar: playerAvatar,
  genre
});

// ホストはジャンルに応じて問題を送信（念のため）
if (isHost && genre) {
  fetch(`/data/${genre}.json`)
    .then(res => res.json())
    .then((questions) => {
      socket.emit("send_questions", { roomId, questions });
    })
    .catch((err) => {
      console.error("問題読み込みエラー:", err);
      questionDiv.textContent = "問題の読み込みに失敗しました。";
    });
}

// 問題表示関連
let typingInterval;
let currentText = "";
let charIndex = 0;
let isTypingPaused = false;

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

// 回答関連イベント
socket.on("pause_typing", () => {
  isTypingPaused = true;
});

socket.on("your_turn", () => {
  statusDiv.textContent = "あなたの番です。回答してください";
  answerInput.disabled = false;
  answerInput.focus();
});

socket.on("wait", () => {
  statusDiv.textContent = "他のプレイヤーが回答中です";
  answerInput.disabled = true;
});

socket.on("result", ({ message, player }) => {
  statusDiv.textContent = message;
});

// Buzz（Enterで早押し）
window.addEventListener("keydown", (e) => {
  if (e.key === "Enter" && answerInput.disabled) {
    socket.emit("buzz", roomId);
  }
});

// 回答送信
answerInput.addEventListener("keydown", (e) => {
  if (e.key === "Enter" && !answerInput.disabled) {
    const answer = answerInput.value.trim();
    if (answer) {
      socket.emit("answer", { roomId, answer });
    }
  }
});

// プレイヤー表示
socket.on("players_update", ({ players }) => {
  playerListDiv.innerHTML = "";
  selfPlayerDiv.innerHTML = "";

  players.forEach(p => {
    const playerHtml = `
      <img src="images/${p.avatar}" width="60" height="60"><br>
      <strong>${p.name}</strong><br>
      ポイント：${p.score}
    `;

    if (p.id === socket.id) {
      selfPlayerDiv.innerHTML = playerHtml;
    } else {
      const div = document.createElement("div");
      div.classList.add("player");
      div.innerHTML = playerHtml;
      playerListDiv.appendChild(div);
    }
  });
});
