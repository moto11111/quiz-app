const socket = io();
const genreImage = document.getElementById("genreImage");

let isHost = localStorage.getItem("isHost") === "true";

// ホストがジャンルをランダムに決定して送信
if (isHost) {
  const genres = ["anime", "kihon", "zatsu"];
  const selected = genres[Math.floor(Math.random() * genres.length)];
  localStorage.setItem("genre", selected);
  socket.emit("genreSelected", selected);
} else {
  // ゲストはサーバーからジャンル受信を待機
  socket.on("genreSelected", (genre) => {
    localStorage.setItem("genre", genre);
    showGenreImage(genre);
    setTimeout(() => {
      window.location.href = "quiz.html";
    }, 2000);
  });
}

// ホストも画像を表示して自動遷移（再受信に備えて）
socket.on("genreSelected", (genre) => {
  localStorage.setItem("genre", genre);
  showGenreImage(genre);
  setTimeout(() => {
    window.location.href = "quiz.html";
  }, 2000);
});

function showGenreImage(genre) {
  genreImage.src = `/images/genre_${genre}.png`;
}
