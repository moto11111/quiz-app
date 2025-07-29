const socket = io();
const room = "defaultRoom";

// ホストだけがジャンルをランダムに決定
if (localStorage.getItem("isHost") === "true") {
  const genres = ["anime", "kihon", "zatsu"];
  const selectedGenre = genres[Math.floor(Math.random() * genres.length)];

  // サーバーに送信
  socket.emit("selectGenre", { room, genre: selectedGenre });
}

socket.on("genreSelected", (genre) => {
  console.log("ジャンル決定:", genre);
  localStorage.setItem("selectedGenre", genre);

  // 画像を表示
  const genreImage = document.getElementById("genreImage");
  genreImage.src = `/images/genre_${genre}.png`;
  genreImage.alt = genre;

  // 遷移
  setTimeout(() => {
    window.location.href = "quiz.html";
  }, 2000);
});
