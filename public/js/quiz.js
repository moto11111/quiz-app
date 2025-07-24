const socket = io();
const roomId = "defaultRoom";

// プレイヤー名やアバターを初期表示
const isHost = sessionStorage.getItem("isHost") === "true";
const myAvatar = sessionStorage.getItem("playerAvatar") || "default.png";

// 表示枠の取得
const questionEl = document.getElementById("question");
const timerEl = document.getElementById("timer");
const answerInput = document.getElementById("answerInput");
const answerForm = document.getElementById("answerForm");

// プレイヤー情報を表示
socket.on("players_update", ({ players }) => {
  const myId = socket.id;
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

// 問題の受信
socket.on("question", ({ question, index, total }) => {
  questionEl.textContent = `Q${index}/${total}：${question}`;
  answerInput.value = "";
  answerInput.disabled = true;
  timerEl.textContent = "10";
  startTimer();
});

function startTimer() {
  let timeLeft = 10;
  const interval = setInterval(() => {
    timeLeft--;
    timerEl.textContent = timeLeft;
    if (timeLeft <= 0) clearInterval(interval);
  }, 1000);
}

// Enterで早押し
window.addEventListener("keydown", (e) => {
  if (e.key === "Enter" && answerInput.disabled) {
    socket.emit("buzz", roomId);
  }
});

// 回答ターンが来た
socket.on("your_turn", () => {
  answerInput.disabled = false;
  answerInput.focus();
});

// 他プレイヤーが回答中
socket.on("wait", () => {
  questionEl.textContent = "相手が回答中...";
});

// 回答処理
answerForm.addEventListener("submit", (e) => {
  e.preventDefault();
  const answer = answerInput.value;
  socket.emit("answer", { roomId, answer });
  answerInput.disabled = true;
});

// 結果メッセージの受信
socket.on("result", ({ message }) => {
  questionEl.textContent = message;
});

// タイピング停止
socket.on("pause_typing", () => {
  clearInterval(); // タイマー停止
});

// ページ読み込み完了 → 準備完了を通知
socket.emit("ready", roomId);
