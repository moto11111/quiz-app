// js/wait.js
const socket = io();
const roomId = sessionStorage.getItem("roomId") || "defaultRoom";
const isHost = sessionStorage.getItem("isHost") === "true";

// 自分がホストなら出題開始ボタンを表示
if (isHost) {
  document.getElementById("start-button").style.display = "block";
}

// 出題開始ボタン押下時：ジャンル選択へ
document.getElementById("start-button").addEventListener("click", () => {
  socket.emit("start_genre", roomId);
});

// プレイヤー情報更新時：アバター画像などを表示
socket.on("players_update", ({ players, count }) => {
  document.getElementById("player-count").textContent = count;
  const container = document.getElementById("player-list");
  container.innerHTML = "";

  players.forEach((p) => {
    const div = document.createElement("div");
    div.classList.add("player");
    div.innerHTML = `
      <img src="images/${p.avatar}" style="width: 100px;"><br>
      ${p.name}
    `;
    container.appendChild(div);
  });
});

// ジャンル選択画面へ
socket.on("go_genre", () => {
  window.location.href = "/genre.html";
});
