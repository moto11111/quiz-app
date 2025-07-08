const socket = io(); // Socket.ioでサーバーに接続

// 仮のルーム名（後で動的にしてもOK）
const room = "room1";
socket.emit("joinRoom", { room });

// サーバーから参加人数が届いたら画面に表示
socket.on("updatePlayerCount", (count) => {
    const playerLabel = document.querySelector(".player-name");
    if (playerLabel) {
        playerLabel.textContent = `参加人数：${count}人`;
    }
});
