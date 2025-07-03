const socket = io();
const roomId = sessionStorage.getItem("roomId");
const playerName = sessionStorage.getItem("playerName") || "ゲスト";

document.getElementById("roomIdDisplay").textContent = `ルームID: ${roomId}`;

// サーバーへ参加を通知
socket.emit("join_room", { roomId });

// 現在人数を受け取って表示
socket.on("update_player_count", (count) => {
  document.getElementById("playerCount").textContent = `参加者: ${count} / 2`;
  if (count === 2) {
    if (sessionStorage.getItem("isHost") === "true") {
      document.getElementById("startButton").style.display = "block";
    }
  }
});

// ホスト通知を受け取ったらフラグを保存
socket.on("you_are_host", () => {
  sessionStorage.setItem("isHost", "true");
});

// 出題開始ボタンクリック
document.getElementById("startButton").addEventListener("click", () => {
  socket.emit("start_quiz", roomId);
});

// クイズ開始通知で画面遷移
socket.on("start_quiz", () => {
  window.location.href = "/quiz.html";
});
