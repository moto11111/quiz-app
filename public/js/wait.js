const socket = io();
const urlParams = new URLSearchParams(window.location.search);
const roomId = urlParams.get("room");
const isHost = sessionStorage.getItem("isHost") === "true";
const avatar = sessionStorage.getItem("playerAvatar") || "default.png";

const playerListDiv = document.getElementById("player-list");
const playerCountDiv = document.getElementById("player-count");
const startButton = document.getElementById("start-button");

// ルーム参加
socket.emit("join_room", { roomId, avatar });

// プレイヤー情報更新
socket.on("players_update", ({ players }) => {
  playerListDiv.innerHTML = "";
  playerCountDiv.textContent = `${players.length}/2`;

  players.forEach(p => {
    const div = document.createElement("div");
    div.classList.add("player");
    div.innerHTML = `
      <img src="images/${p.avatar}" width="60" height="60"><br>
      ${p.id === socket.id ? "自分" : "相手"}<br>
      スコア：${p.score}
    `;
    playerListDiv.appendChild(div);
  });

  if (isHost) {
    startButton.style.display = "block";
    startButton.disabled = players.length < 2;
  }
});

// ホスト判定
socket.on("you_are_host", () => {
  sessionStorage.setItem("isHost", "true");
  if (playerCountDiv.textContent.startsWith("2")) {
    startButton.disabled = false;
  }
});

// 出題開始 → ジャンル選択画面へ遷移
startButton.addEventListener("click", () => {
  window.location.href = `genre.html?room=${roomId}`;
});
