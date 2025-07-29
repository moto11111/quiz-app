const socket = io();
const isHost = sessionStorage.getItem("isHost") === "true";
const avatar = sessionStorage.getItem("playerAvatar") || "default.png";
const roomId = localStorage.getItem("roomId") || "defaultRoom";

// ルーム参加通知（アバター情報付き）
socket.emit("join_room", {
  roomId,
  avatar: avatar
});

// 出題開始ボタン表示（ホストのみ）
if (isHost) {
  document.getElementById("start-button").style.display = "block";
  document.getElementById("start-button").addEventListener("click", () => {
    socket.emit("start_genre", roomId);
  });
}

// プレイヤー情報更新
socket.on("players_update", ({ players, count }) => {
  const list = document.getElementById("player-list");
  const countDiv = document.getElementById("player-count");
  // 例: プレイヤー情報を受け取ったとき
const avatar1 = playerData1.avatar; // e.g., avatar01.png
const avatar2 = playerData2.avatar;

document.getElementById("player1Avatar").src = `/images/${avatar1}`;
document.getElementById("player2Avatar").src = `/images/${avatar2}`;


  countDiv.textContent = count;
  list.innerHTML = "";

  players.forEach(p => {
    const div = document.createElement("div");
    div.innerHTML = `
      <img src="images/${p.avatar}" width="60" height="60"><br>
      <strong>${p.name}</strong><br>
      ポイント：${p.score}
    `;
    list.appendChild(div);
  });
});

// ジャンル画面へ遷移
socket.on("go_genre", () => {
  window.location.href = "/genre.html";
});
