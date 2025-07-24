const socket = io();
const roomId = "defaultRoom";

// ジャンルボタン（手動選択）
document.querySelectorAll(".genre-button").forEach((btn) => {
  btn.addEventListener("click", () => {
    const genre = btn.dataset.genre;
    localStorage.setItem("selectedGenre", genre);
    socket.emit("select_genre", { roomId, genre });
  });
});

// ランダム選択ボタン
document.getElementById("randomGenre").addEventListener("click", () => {
  const genres = ["anime", "zatsu", "kihon"];
  const randomGenre = genres[Math.floor(Math.random() * genres.length)];
  localStorage.setItem("selectedGenre", randomGenre);
  socket.emit("select_genre", { roomId, genre: randomGenre });
});

// ジャンルが決定されたら quiz.html へ遷移
socket.on("start_quiz", () => {
  window.location.href = "/quiz.html";
});

socket.on("select_genre", ({ roomId, genre }) => {
  const room = rooms[roomId];
  if (!room) return;

  room.genre = genre;
  room.questions = loadQuestions(genre);
  room.current = 0;

  io.to(roomId).emit("start_quiz");
  sendQuestion(roomId);
});

