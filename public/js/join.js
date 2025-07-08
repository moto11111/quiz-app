// js/join.js
const socket = io();
const form = document.getElementById("joinForm");

form.addEventListener("submit", (e) => {
  e.preventDefault();
  const roomId = document.getElementById("roomId").value || "defaultRoom";

  // サーバーにルーム参加を通知（パスワードチェックはなし）
  socket.emit("join_room", { roomId, isHost: false });

  // ローカルストレージに情報を保存
  localStorage.setItem("roomId", roomId);
  localStorage.setItem("isHost", "false");

  // wait画面に遷移
  window.location.href = "/wait.html";
});
