const selectedGenre = localStorage.getItem("selectedGenre");
const isHost = sessionStorage.getItem("isHost") === "true";

// ホストのみジャンルに応じて問題データを送信
if (isHost && selectedGenre) {
fetch(/data/$,{selectedGenre}.json)
.then((res) => res.json())
.then((questions) => {
socket.emit("send_questions", { roomId, questions });
})
.catch((err) => {
console.error("問題読み込みエラー:", err);
});
}


// ルームに参加（ジャンル付き）
socket.emit("join_room", { roomId, genre });


const questionDiv = document.getElementById("question");
const questionNumberDiv = document.getElementById("question-number");
const answerInput = document.getElementById("answer");
const statusDiv = document.getElementById("status");

const socket = io();
const urlParams = new URLSearchParams(window.location.search);
const roomId = urlParams.get('room');

// 🔽 localStorage からジャンルを取得
const genre = localStorage.getItem("selectedGenre") || "kihon";

// 🔽 ルーム参加時にジャンルも送信
socket.emit("join_room", {
  roomId,
  avatar: "default.png", // 必要に応じて補完
  genre: genre
});



let typingInterval;
let currentText = "";
let charIndex = 0;
let isTypingPaused = false;

socket.emit("join_room", { roomId });

// 問題が届いたらタイプライター表示開始
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

// タイピング一時停止
socket.on("pause_typing", () => {
  isTypingPaused = true;
});

// 自分の番
socket.on("your_turn", () => {
  statusDiv.textContent = "あなたの番です。回答してください";
  answerInput.disabled = false;
  answerInput.focus();
});

// 他人が回答中
socket.on("wait", () => {
  statusDiv.textContent = "他のプレイヤーが回答中です";
  answerInput.disabled = true;
});

// 結果表示
socket.on("result", ({ message, player }) => {
  statusDiv.textContent = message;
});

// Buzz（Enterキー）で回答権要求
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

const playerListDiv = document.getElementById("player-list");

socket.on("players_update", ({ players }) => {
  playerListDiv.innerHTML = "";

  players.forEach(p => {
    const playerDiv = document.createElement("div");
    playerDiv.style.textAlign = "center";

    playerDiv.innerHTML = `
      <img src="images/${p.avatar}" width="60" height="60"><br>
      <strong>${p.name}</strong><br>
      スコア: ${p.score}
    `;

    playerListDiv.appendChild(playerDiv);
  });
});

