const socket = io();
const urlParams = new URLSearchParams(window.location.search);
const roomId = urlParams.get('room');

const questionDiv = document.getElementById("question");
const questionNumberDiv = document.getElementById("question-number");
const answerInput = document.getElementById("answer");
const statusDiv = document.getElementById("status");

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
