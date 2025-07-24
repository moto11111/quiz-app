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

const urlParams = new URLSearchParams(window.location.search);
const avatar = urlParams.get("avatar");  // 例: "ヒト3.png"

socket.emit("join_room", {
  roomId,
  name: プレイヤー名,
  avatar: avatar  // 取得済みの画像ファイル名（例: "ヒト3.png"）
});

sessionStorage.setItem("isHost", "false");
sessionStorage.setItem("playerAvatar", selectedAvatar); // avatar名が"xxx.png"など

