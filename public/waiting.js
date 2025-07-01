const socket = io();

// URLパラメータからroomIdとroleを取得（例: ?roomId=XXXX&host=true）
const urlParams = new URLSearchParams(window.location.search);
const roomId = urlParams.get('roomId');
const isHost = urlParams.get('host') === 'true';

// ルームID表示
document.getElementById("room-id").textContent = `ルームID: ${roomId}`;

// ルームに参加
socket.emit("join_room", { roomId, isHost });

// 人数更新を受信
socket.on("update_player_count", (count) => {
  document.getElementById("player-count").textContent = `現在の人数: ${count}`;
  if (count >= 2 && isHost) {
    document.getElementById("start-btn").style.display = "block";
  }
});

// 出題開始ボタン押下時
document.getElementById("start-btn").addEventListener("click", () => {
  socket.emit("start_quiz", roomId);
});

socket.on("start_quiz", () => {
  window.location.href = "/quiz.html";
});

