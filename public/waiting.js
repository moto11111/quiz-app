const socket = io();
const playerCount = document.getElementById('player-count');
const startBtn = document.getElementById('start-btn');

socket.on('updatePlayerCount', (count, max) => {
  playerCount.textContent = `参加者: ${count}/${max}`;
  if (count >= max) {
    startBtn.disabled = false;
  }
});

startBtn.addEventListener('click', () => {
  socket.emit('startQuiz');
});
