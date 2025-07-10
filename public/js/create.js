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
  window.location.href = "/wait.html";
});

const urlParams = new URLSearchParams(window.location.search);
const avatar = urlParams.get("avatar");  // 例: "ヒト3.png"

socket.emit("join_room", {
  roomId,
  name: プレイヤー名,
  avatar: avatar  // 取得済みの画像ファイル名（例: "ヒト3.png"）
});
