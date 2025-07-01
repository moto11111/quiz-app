function createRoom() {
  const name = document.getElementById("name").value;
  if (!name) {
    alert("名前を入力してください");
    return;
  }

  const roomId = Math.random().toString(36).substr(2, 6).toUpperCase();
  localStorage.setItem("roomId", roomId);
  localStorage.setItem("playerName", name);
  localStorage.setItem("isHost", "true");

  document.getElementById("roomIdText").innerText = `ルームID: ${roomId}`;
}
