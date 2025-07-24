const socket = io();
const isHost = sessionStorage.getItem("isHost") === "true";
const playerAvatar = sessionStorage.getItem("playerAvatar") || "avatar1.png";
const playerName = isHost ? "自分" : "相手";

const roomId = "defaultRoom"; // 実質どのユーザーも同じルームにするために固定

// ルーム参加をサーバーに通知
socket.emit("join_room", {
  roomId,
  avatar: playerAvatar
});

// プレイヤー情報の更新
socket.on("players_update", ({ players, count }) => {
  const list = document.getElementById("player-list");
  const countDiv = document.getElementById("player-count");
  list.innerHTML = "";
  countDiv.textContent = count;

  players.forEach((player) => {
    const div = document.createElement("div");
    div.className = "player";

    const img = document.createElement("img");
    img.src = `images/${player.avatar}`;  // ← 正しいパスに修正
    img.alt = player.name;
    img.className = "avatar";

    const name = document.createElement("div");
    name.textContent = player.name;

    const score = document.createElement("div");
    score.textContent = `スコア：${player.score}`;

    div.appendChild(img);
    div.appendChild(name);
    div.appendChild(score);
    list.appendChild(div);
  });
});

// ホストなら出題開始ボタンを表示
socket.on("you_are_host", (isHost) => {
  if (isHost) {
    document.getElementById("start-button").style.display = "block";
  }
});

// 出題開始ボタン
document.getElementById("start-button").addEventListener("click", () => {
  socket.emit("start_genre", roomId);
});

// サーバーからジャンル選択画面への遷移指示
socket.on("go_genre", () => {
  window.location.href = "/genre.html";
});
