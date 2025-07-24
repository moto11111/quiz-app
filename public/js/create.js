// js/create.js
const socket = io();
const form = document.getElementById("createForm");

form.addEventListener("submit", (e) => {
  e.preventDefault();

  const roomId = "defaultRoom"; // 実質的に固定
  const avatar = "avatar2.png"; // アバターはホスト用

  sessionStorage.setItem("isHost", "true");
  sessionStorage.setItem("playerAvatar", avatar);
  localStorage.setItem("roomId", roomId);

  socket.emit("join_room", { roomId, avatar });

  window.location.href = "/wait.html";
});
