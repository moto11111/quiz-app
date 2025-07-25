const socket = io();
const roomId = "defaultRoom";
const isHost = sessionStorage.getItem("isHost") === "true";
const playerAvatar = sessionStorage.getItem("playerAvatar") || "default.png";

// ルーム参加通知
socket.emit("join_room", { roomId, avatar: playerAvatar });

// 出題開始ボタン（ホストのみ表示）
const startButton = document.getElementById("start-button");
if (isHost) {
  startButton.style.display = "block";
  startButton.addEventListener("click", () => {
    socket.emit("start_genre", roomId);
  });
}

// プレイヤー情報の更新
socket.on("players_update", ({ players, count }) => {
  const playerList = document.getElementById("player-list");
  const playerCount = document.getElementById("player-count");

  playerList.innerHTML = "";
  playerCount.textContent = count;

  players.forEach((p) => {
    const div = document.createElement("div");
    div.classList.add("player");

    div.innerHTML = `
      <img src="images/${p.avatar}" width="60" height="60"><br>
      <strong>${p.name}</strong>
    `;
    playerList.appendChild(div);
  });
});

// ジャンル選択画面へ遷移
socket.on("go_genre", () => {
  window.location.href = "genre.html";
});
