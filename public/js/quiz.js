const socket = io();
const urlParams = new URLSearchParams(window.location.search);
const roomId = urlParams.get('room');
const genre = localStorage.getItem("selectedGenre") || "kihon";
const isHost = sessionStorage.getItem("isHost") === "true";
const playerName = sessionStorage.getItem("playerName") || "名無し";
const playerAvatar = sessionStorage.getItem("playerAvatar") || "default.png";

// DOM
const questionDiv = document.getElementById("question");
const questionNumberDiv = document.getElementById("question-number");
const answerInput = document.getElementById("answer");
const statusDiv = document.getElementById("status");
const playerListDiv = document.getElementById("player-list");
const selfPlayerDiv = document.getElementById("self-player");
const timerDiv = document.getElementById("timer");


if (isHost && genre && roomId) {
  fetch(`/data/${genre}.json`)
    .then(res => res.json())
    .then(questions => {
      socket.emit("send_questions", { roomId, questions });
      console.log("✅ 問題データ送信完了");
    })
    .catch(err => {
      console.error("❌ 問題データ送信失敗:", err);
    });
}


let typingInterval;
let currentText = "";
let charIndex = 0;
let isTypingPaused = false;
let timeLeft = 10;
let timerInterval = null;

// ルーム参加
socket.emit("join_room", {
  roomId,
  name: playerName,
  avatar: playerAvatar,
  genre
});

// 問題送信（ホストのみ）
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

// 出題開始受信
socket.on("question", ({ question, index, total }) => {
  clearInterval(typingInterval);
  clearInterval(timerInterval);
  currentText = question;
  charIndex = 0;
  isTypingPaused = false;

  questionDiv.textContent = "";
  questionNumberDiv.textContent = `${index}/${total}`;
  statusDiv.textContent = "";
  answerInput.value = "";
  answerInput.disabled = true;

  timeLeft = 10;
  timerDiv.textContent = `残り時間：${timeLeft}秒`;

  typingInterval = setInterval(() => {
    if (isTypingPaused) return;
    if (charIndex < currentText.length) {
      questionDiv.textContent += currentText[charIndex++];
    } else {
      clearInterval(typingInterval);
    }
  }, 70);

  timerInterval = setInterval(() => {
    timeLeft--;
    timerDiv.textContent = `残り時間：${timeLeft}秒`;
    if (timeLeft <= 0) {
      clearInterval(timerInterval);
      socket.emit("answer", { roomId, answer: "" }); // 時間切れ回答送信
    }
  }, 1000);
});

// タイピング停止
socket.on("pause_typing", () => {
  isTypingPaused = true;
  clearInterval(timerInterval);
});

// 回答ターン
socket.on("your_turn", () => {
  statusDiv.textContent = "あなたの番です。回答してください";
  answerInput.disabled = false;
  answerInput.focus();

  timeLeft = 10;
  timerInterval = setInterval(() => {
    timeLeft--;
    timerDiv.textContent = `残り時間：${timeLeft}秒`;
    if (timeLeft <= 0) {
      clearInterval(timerInterval);
      answerInput.disabled = true;
      socket.emit("answer", { roomId, answer: "" }); // 時間切れ
    }
  }, 1000);
});

// 他人のターン
socket.on("wait", () => {
  statusDiv.textContent = "他のプレイヤーが回答中です";
  answerInput.disabled = true;
  clearInterval(timerInterval);
});

// 結果
socket.on("result", ({ message }) => {
  statusDiv.textContent = message;
});

// Enterで早押し
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
      clearInterval(timerInterval);
    }
  }
});

// プレイヤー更新
socket.on("players_update", ({ players }) => {
  playerListDiv.innerHTML = "";
  selfPlayerDiv.innerHTML = "";

  players.forEach(p => {
    const playerHtml = `
      <img src="images/${p.avatar}" width="60" height="60"><br>
      <strong>${p.id === socket.id ? "自分" : "相手"}</strong><br>
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
socket.on("players_update", ({ players }) => {
  playerListDiv.innerHTML = "";
  selfPlayerDiv.innerHTML = "";

  players.forEach(p => {
    const isSelf = p.id === socket.id;
    const nameLabel = isSelf ? "自分" : "相手";
    const playerHtml = `
      <img src="images/${p.avatar}" width="60" height="60"><br>
      <strong>${nameLabel}</strong><br>
      ポイント：${p.score}
    `;

    if (isSelf) {
      selfPlayerDiv.innerHTML = playerHtml;
    } else {
      const div = document.createElement("div");
      div.classList.add("player");
      div.innerHTML = playerHtml;
      playerListDiv.appendChild(div);
    }
  });

  if (isHost && genre) {
  fetch(`/data/${genre}.json`)
    .then(res => res.json())
    .then((questions) => {
      console.log("📦 問題データ読込成功:", questions); // ← 追加
      socket.emit("send_questions", { roomId, questions });
    })
    .catch((err) => {
      console.error("❌ 問題読み込みエラー:", err);
      questionDiv.textContent = "問題の読み込みに失敗しました。";
    });
}


});

