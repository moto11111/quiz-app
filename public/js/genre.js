// public/js/genre.js
const socket = io();
const roomId = localStorage.getItem("roomId");
const isHost = localStorage.getItem("isHost") === "true";

const genres = ["anime", "kihon", "zatsu"];
const genreImages = {
  anime: "images/genre_anime.png",
  kihon: "images/genre_kihon.png",
  zatsu: "images/genre_zatsu.png"
};

const genreImg = document.getElementById("genre-image");
const genreText = document.getElementById("genre-text");

// ホストがジャンルをランダム決定 → 共有
if (isHost) {
  const selected = genres[Math.floor(Math.random() * genres.length)];
  localStorage.setItem("selectedGenre", selected);
  socket.emit("genre_selected", { roomId, genre: selected });
  displayGenre(selected);
}

socket.on("start_quiz", (genre) => {
  // ホスト・参加者ともに受信
  localStorage.setItem("selectedGenre", genre);
  displayGenre(genre);

  // 2秒後にクイズ画面へ遷移
  setTimeout(() => {
    window.location.href = "/quiz.html";
  }, 2000);
});

function displayGenre(genre) {
  genreImg.src = genreImages[genre];
  genreImg.alt = genre;
  genreText.textContent = `ジャンル：${genre}`;
}
