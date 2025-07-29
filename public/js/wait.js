const socket = io();
const selfAvatar = document.getElementById("selfAvatar");
const opponentAvatar = document.getElementById("opponentAvatar");
const selfPoint = document.getElementById("selfPoint");
const opponentPoint = document.getElementById("opponentPoint");
const playerCount = document.getElementById("playerCount");
const startButton = document.getElementById("startButton");

let isHost = localStorage.getItem("isHost") === "true";
let avatar = localStorage.getItem("avatar") || "avatar01.png";
let playerName = localStorage.getItem("playerName") || "名無し";

socket.emit("joinRoom", { avatar, playerName });

socket.on("updatePlayers", (players) => {
  playerCount.textContent = `${players.length}/2`;

  if (players.length === 2) {
    const self = players.find((p) => p.id === socket.id);
    const opponent = players.find((p) => p.id !== socket.id);

    if (self) {
      selfAvatar.src = `/images/${self.avatar}`;
      selfPoint.textContent = self.point;
    }

    if (opponent) {
      opponentAvatar.src = `/images/${opponent.avatar}`;
      opponentPoint.textContent = opponent.point;
    }

    if (isHost) {
      startButton.style.display = "block";
    }
  }
});

startButton.addEventListener("click", () => {
  if (!isHost) return;

  const genres = ["anime", "zatsu", "kihon"];
  const selectedGenre = genres[Math.floor(Math.random() * genres.length)];
  localStorage.setItem("genre", selectedGenre);

  socket.emit("genreSelected", selectedGenre);
});

socket.on("genreSelected", (genre) => {
  localStorage.setItem("genre", genre);
  window.location.href = "genre.html";
});
