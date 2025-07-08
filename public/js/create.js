// js/create.js
const socket = io();
const form = document.getElementById("createForm");

form.addEventListener("submit", (e) => {
  e.preventDefault();
  const roomId = document.getElementById("roomId").value || "defaultRoom";

  // サーバーにルーム参加を通知（形式だけ）
  socket.emit("join_room", { roomId, isHost: true });

  // ローカルストレージに roomId とホスト情報を保存
  localStorage.setItem("roomId", roomId);
  localStorage.setItem("isHost", "true");

  // waiting 画面に遷移
  window.location.href = "/waiting.html";
});
