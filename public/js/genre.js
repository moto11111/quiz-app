const socket = io();
const roomId = localStorage.getItem("roomId") || "defaultRoom";
const isHost = localStorage.getItem("isHost") === "true";

const genres = ["anime", "kihon", "zatsu"];
const genreImages = {
  anime: "images/genre_anime.png",
  kihon: "images/genre_kihon.png",
  zatsu: "images/genre_zatsu.png"
};

if (isHost) {
  const selectedGenre = genres[Math.floor(Math.random() * genres.length)];
  localStorage.setItem("selectedGenre", selectedGenre);
  socket.emit("genre_selected", { roomId, genre: selectedGenre });
}

socket.on("start_quiz", (genre) => {
  const selectedGenre = genre || localStorage.getItem("selectedGenre");
  localStorage.setItem("selectedGenre", selectedGenre);

  // 表示
  const image = document.createElement("img");
  image.src = genreImages[selectedGenre];
  image.alt = selectedGenre;
  image.style.width = "300px";
  document.getElementById("genre-image").appendChild(image);

  // 数秒後に遷移
  setTimeout(() => {
    window.location.href = "/quiz.html";
  }, 3000);
});
