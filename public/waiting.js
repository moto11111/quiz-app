const socket = new WebSocket(`ws://${location.host}`);

const roomId = sessionStorage.getItem('roomId') || 'default';
socket.addEventListener('open', () => {
  socket.send(JSON.stringify({
    type: 'join-room',
    roomId: roomId
  }));
});

socket.addEventListener('message', (event) => {
  const msg = JSON.parse(event.data);

  if (msg.type === 'user-count') {
    document.getElementById('userCount').textContent = `現在の人数: ${msg.count}`;
  }

  if (msg.type === 'you-are-host') {
    document.getElementById('startButton').style.display = 'block';
  }

  if (msg.type === 'start-quiz') {
    // クイズ画面へ遷移
    window.location.href = '/genre';
  }
});

document.getElementById('startButton').addEventListener('click', () => {
  socket.send(JSON.stringify({
    type: 'start-quiz',
    roomId: roomId
  }));
});
