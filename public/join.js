document.getElementById("join-form").addEventListener("submit", function (e) {
  e.preventDefault();
  const roomId = document.getElementById("roomId").value;

  if (!roomId) {
    document.getElementById("error-message").textContent = "ルームIDを入力してください。";
    return;
  }

  // WebSocketでルームに参加する通知を送信
  const socket = new WebSocket("wss://" + window.location.host);
  socket.onopen = () => {
    socket.send(JSON.stringify({
      type: "join-room",
      roomId: roomId
    }));
    // waiting画面に遷移
    window.location.href = "/waiting.html?roomId=" + encodeURIComponent(roomId);
  };

  socket.onerror = () => {
    document.getElementById("error-message").textContent = "接続に失敗しました。";
  };
});
