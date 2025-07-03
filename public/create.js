document.getElementById("createRoomBtn").addEventListener("click", () => {
  // ランダムな6桁の英数字でルームID生成
  const roomId = Math.random().toString(36).substring(2, 8).toUpperCase();

  // 表示
  document.getElementById("roomIdDisplay").textContent = `ルームID: ${roomId}`;

  // WebSocketでルームに参加（ホストとして）
  const socket = new WebSocket("wss://" + window.location.host);
  socket.onopen = () => {
    socket.send(JSON.stringify({
      type: "join-room",
      roomId: roomId
    }));
    // 1秒後にwaiting画面に遷移（URLにroomIdを含める）
    setTimeout(() => {
      window.location.href = "/waiting.html?roomId=" + encodeURIComponent(roomId);
    }, 1000);
  };

  socket.onerror = () => {
    alert("WebSocket接続に失敗しました。");
  };
});
