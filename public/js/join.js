// js/join.js
const socket = io();
const form = document.getElementById("joinForm");

form.addEventListener("submit", (e) => {
  e.preventDefault();

  const roomId = "defaultRoom"; // 実質的に固定
  const avatar = "avatar1.png"; // アバターは選択可能にする場合、変更してください

  // ルーム情報保存
  sessionStorage.setItem("isHost", "false");
  sessionStorage.setItem("playerAvatar", avatar);
  localStorage.setItem("roomId", roomId);

  // サーバーに参加を通知
  socket.emit("join_room", { roomId, avatar });

  // 待機画面へ遷移
  window.location.href = "/wait.html";
});
  sessionStorage.setItem("playerAvatar", selectedAvatar); // avatar選択時に設定
  const selectedAvatar = document.querySelector(".avatar.selected").dataset.filename;
