const socket = io();
const roomId = localStorage.getItem("roomId") || "defaultRoom";
const isHost = sessionStorage.getItem("isHost") === "true";

// 画像要素とラベル
const genreImage = document.getElementById("genre-image");
const genreLabel = document.getElementById("genre-label");

// ジャンル画像マップ
const genreImageMap = {
  "anime": "genre_anime.png",
  "kihon": "genre_kihon.png",
  "zatsu": "genre_zatsu.png"
};

// ホストがランダムジャンルを決定し送信
if (isHost) {
  const genres = ["anime", "kihon", "zatsu"];
  const selected = genres[Math.floor(Math.random() * genres.length)];

  localStorage.setItem("selectedGenre", selected); // quiz.js 用
  socket.emit("select_genre", { roomId, genre: selected });
}

// サーバーからジャンル決定通知（全員に）
socket.on("start_quiz", (genre) => {
  if (!genre) {
    console.error("ジャンルが送られてきませんでした");
    return;
  }

  // 表示
  genreLabel.textContent = `選ばれたジャンル: ${genre}`;
  genreImage.src = `images/${genreImageMap[genre]}`;

  localStorage.setItem("selectedGenre", genre); // quiz.js 用に保存

  // 少し待ってから自動で quiz 画面へ遷移
  setTimeout(() => {
    window.location.href = "/quiz.html";
  }, 2500);
});
