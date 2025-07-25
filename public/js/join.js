// js/join.js
const socket = io();
const form = document.getElementById("joinForm");

form.addEventListener("submit", (e) => {
  e.preventDefault();

  const roomId = "defaultRoom"; // 実際はルームID不要の仕様
  const avatar = sessionStorage.getItem("playerAvatar") || "ヒト1.png";
  const name = sessionStorage.getItem("playerName") || "相手";

  // サーバーへ参加情報を送信
  socket.emit("join_room", {
    roomId,
    name,
    avatar
  });

  // 情報を保存
  sessionStorage.setItem("isHost", "false");
  sessionStorage.setItem("roomId", roomId);

  // 待機画面へ遷移
  window.location.href = "/wait.html";
});
