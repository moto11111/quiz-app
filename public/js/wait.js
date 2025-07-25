const socket = io();
const roomId = localStorage.getItem("roomId") || "defaultRoom";
const isHost = localStorage.getItem("isHost") === "true";

const playerList = document.getElementById("player-list");
const playerCount = document.getElementById("player-count");
const startButton = document.getElementById("start-button");

socket.emit("join_room", {
  roomId,
  avatar: sessionStorage.getItem("playerAvatar") || "default.png"
});

// プレイヤー情報更新
socket.on("players_update", ({ players, count }) => {
  playerCount.textContent = count;
  playerList.innerHTML = "";

  players.forEach((p) => {
    const div = document.createElement("div");
    div.classList.add("player");
    div.innerHTML = `
      <img src="images/${p.avatar}" width="80"><br>
      ${p.name}<br>
      ポイント：${p.score}
    `;
    playerList.appendChild(div);
  });

  if (isHost && players.length === 2) {
    startButton.style.display = "block";
  }
});

// 出題開始ボタン処理
startButton.addEventListener("click", () => {
  socket.emit("start_genre", roomId);
});

// ジャンル選択へ遷移
socket.on("go_genre", () => {
  window.location.href = "/genre.html";
});
