const socket = io();
const roomId = "defaultRoom";
let myId = null;

// 表示要素
const questionEl = document.getElementById("question");
const timerEl = document.getElementById("timer");
const answerInput = document.getElementById("answerInput");
const answerForm = document.getElementById("answerForm");

// 初期化時に自分のID取得
socket.on("connect", () => {
  myId = socket.id;
});

// プレイヤー表示
socket.on("players_update", ({ players }) => {
  players.forEach((p) => {
    if (p.id === myId) {
      document.getElementById("right-name").textContent = "自分";
      document.getElementById("right-avatar").src = "/images/" + p.avatar;
      document.getElementById("right-score").textContent = `スコア：${p.score}`;
    } else {
      document.getElementById("left-name").textContent = "相手";
      document.getElementById("left-avatar").src = "/images/" + p.avatar;
      document.getElementById("left-score").textContent = `スコア：${p.score}`;
    }
  });
});

// 問題表示
socket.on("question", ({ question, index, total }) => {
  questionEl.textContent = `Q${index}/${total}：${question}`;
  answerInput.value = "";
  answerInput.disabled = true;
  startTimer();
});

// タイマー
let timerInterval;
function startTimer() {
  let time = 10;
  clearInterval(timerInterval);
  timerEl.textContent = time;
  timerInterval = setInterval(() => {
    time--;
    timerEl.textContent = time;
    if (time <= 0) clearInterval(timerInterval);
  }, 1000);
}

// 早押し
window.addEventListener("keydown", (e) => {
  if (e.key === "Enter" && answerInput.disabled) {
    socket.emit("buzz", roomId);
  }
});

// 回答可能
socket.on("your_turn", () => {
  answerInput.disabled = false;
  answerInput.focus();
});

// 他の人が回答中
socket.on("wait", () => {
  questionEl.textContent = "相手が回答中...";
});

// 回答送信
answerForm.addEventListener("submit", (e) => {
  e.preventDefault();
  const answer = answerInput.value.trim();
  if (answer) {
    socket.emit("answer", { roomId, answer });
    answerInput.disabled = true;
  }
});

// 結果表示
socket.on("result", ({ message }) => {
  questionEl.textContent = message;
});

// 出題停止
socket.on("pause_typing", () => {
  clearInterval(timerInterval);
});

// 準備完了通知（全員揃ったら出題）
socket.emit("ready", roomId);
