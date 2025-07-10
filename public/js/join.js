// js/join.js
const socket = io();
const form = document.getElementById("joinForm");

form.addEventListener("submit", (e) => {
  e.preventDefault();
  const roomId = document.getElementById("roomId").value || "defaultRoom";

  // サーバーにルーム参加を通知（パスワードチェックはなし）
  socket.emit("join_room", { roomId, isHost: false });

  socket.emit("join_room", {
  roomId,
  name: "たかし",         // 入力された名前
  avatar: "avatar1.png"   // 選択されたアバター画像（public/images/ 配下に置く）
});


  // ローカルストレージに情報を保存
  localStorage.setItem("roomId", roomId);
  localStorage.setItem("isHost", "false");

  // wait画面に遷移
  window.location.href = "/wait.html";
});
