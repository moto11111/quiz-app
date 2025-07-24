const socket = io();
const urlParams = new URLSearchParams(window.location.search);
const roomId = urlParams.get("room");
const avatar = sessionStorage.getItem("playerAvatar") || "default.png";

const playerListDiv = document.getElementById("player-list");
const playerCountDiv = document.getElementById("player-count");
const startButton = document.getElementById("start-button");

let isHost = false;

// ルームに参加
socket.emit("join_room", { roomId, avatar });

// ホスト判定
socket.on("you_are_host", (hostStatus) => {
  isHost = hostStatus;
  if (isHost) {
    startButton.style.display = "block";
  }
});

// プレイヤーリスト更新
socket.on("players_update", ({ players, count }) => {
  playerListDiv.innerHTML = "";
  playerCountDiv.textContent = count;

  players.forEach((p) => {
    const div = document.createElement("div");
    div.classList.add("player");
    div.innerHTML = `
      <img src="images/${p.avatar}" width="60" height="60"><br>
      ${p.name}<br>
      ${p.score}点
    `;
    playerListDiv.appendChild(div);
  });
});

// 出題開始ボタン
startButton.addEventListener("click", () => {
  socket.emit("start_genre", roomId);
});

// ジャンル選択へ遷移
socket.on("go_genre", () => {
  sessionStorage.setItem("isHost", isHost);
  window.location.href = `genre.html?room=${roomId}`;
});
