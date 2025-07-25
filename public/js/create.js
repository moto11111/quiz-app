// js/create.js
const socket = io();
const form = document.getElementById("createForm");

form.addEventListener("submit", (e) => {
  e.preventDefault();

  const roomId = "defaultRoom";
  const avatar = sessionStorage.getItem("playerAvatar") || "ヒト1.png";
  const name = sessionStorage.getItem("playerName") || "自分";

  // サーバーへホスト情報を送信
  socket.emit("join_room", {
    roomId,
    name,
    avatar
  });

  sessionStorage.setItem("isHost", "true");
  sessionStorage.setItem("roomId", roomId);

  // 待機画面へ遷移
  window.location.href = "/wait.html";
});
