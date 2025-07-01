function joinRoom() {
  const name = document.getElementById("name").value;
  const roomId = document.getElementById("roomId").value;

  if (!name || !roomId) {
    alert("名前とルームIDを入力してください");
    return;
  }

  localStorage.setItem("roomId", roomId.toUpperCase());
  localStorage.setItem("playerName", name);
  localStorage.setItem("isHost", "false");

  window.location.href = "waiting.html";
}
