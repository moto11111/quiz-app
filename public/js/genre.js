const socket = io();
const roomId = "defaultRoom";

// 画像付きジャンル選択（ランダム）
const genres = ["anime", "kihon", "zatsu"];
const genreImages = {
  anime: "genre_anime.png",
  kihon: "genre_kihon.png",
  zatsu: "genre_zatsu.png",
};

// 作成者のみジャンルを決定して送信
const isHost = sessionStorage.getItem("isHost") === "true";
if (isHost) {
  const selected = genres[Math.floor(Math.random() * genres.length)];
  const genreImage = genreImages[selected];
  document.getElementById("genre-img").src = `images/${genreImage}`;
  localStorage.setItem("selectedGenre", selected);

  // サーバにジャンル決定通知
  socket.emit("select_genre", { roomId, genre: selected });
}

// サーバから start_quiz を受信したら遷移
socket.on("start_quiz", (genre) => {
  localStorage.setItem("selectedGenre", genre); // 参加者もジャンルを保存
  setTimeout(() => {
    window.location.href = "quiz.html";
  }, 2000); // アニメーション表示のため2秒待つなど
});
