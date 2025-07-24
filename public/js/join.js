const socket = io();
const form = document.getElementById("joinForm");

form.addEventListener("submit", (e) => {
  e.preventDefault();

  const roomId = document.getElementById("roomId").value || "defaultRoom";

  // avatarはselect.htmlなどで事前にsessionStorageに保存されている前提
  const avatar = sessionStorage.getItem("playerAvatar") || "default.png";

  // sessionStorage に保存（統一）
  sessionStorage.setItem("roomId", roomId);
  sessionStorage.setItem("isHost", "false");

  // socket接続してルーム参加を通知
  socket.emit("join_room", {
    roomId: roomId,
    avatar: avatar
  });

  // 待機画面へ遷移
  window.location.href = `wait.html?room=${encodeURIComponent(roomId)}`;
});
