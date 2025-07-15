// クイズ画面のJS
const socket = io();
const urlParams = new URLSearchParams(window.location.search);
const roomId = urlParams.get("room");

// クイズ画面要素
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

// ホスト判定とジャンル取得
const isHost = sessionStorage.getItem("isHost") === "true";
const selectedGenre = localStorage.getItem("selectedGenre") || "kihon";

// アバター名の取得
const avatar = sessionStorage.getItem("playerAvatar") || "default.png";

// socket接続・ルーム参加
socket.emit("join_room", {
  roomId,
  avatar: avatar,
  genre: selectedGenre
});

// ホストのみが問題を送信
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
let remainingTime = 15; // 15秒の制限時間

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
      document.getElementById("answer").disabled = true;
      document.getElementById("status").textContent = "時間切れです";
    }
  }, 1000);
}

// question が届いたときに startTimer を呼び出す
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
  startTimer(); // ← ここを追加
});

// 問題受信・タイプライター表示
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

// 回答権獲得・制御
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

// 結果表示
socket.on("result", ({ message }) => {
  statusDiv.textContent = message;
});

// Enterでbuzz
window.addEventListener("keydown", (e) => {
  if (e.key === "Enter" && answerInput.disabled) {
    socket.emit("buzz", roomId);
  }
});

// Enterで解答送信
answerInput.addEventListener("keydown", (e) => {
  if (e.key === "Enter" && !answerInput.disabled) {
    const answer = answerInput.value.trim();
    if (answer) {
      socket.emit("answer", { roomId, answer });
    }
  }
});

// プレイヤー情報更新
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
