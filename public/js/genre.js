const socket = io();
const isHost = sessionStorage.getItem("isHost") === "true";
const roomId = "defaultRoom";

// ジャンルボタンをクリック
document.querySelectorAll(".genre-button").forEach((btn) => {
  btn.addEventListener("click", () => {
    const genre = btn.dataset.genre;

    if (isHost) {
      // ホストがジャンルを選択したらサーバーに送信
      socket.emit("select_genre", { roomId, genre });
    }
  });
});

// ジャンルが選ばれたら全員 quiz.html に遷移
socket.on("start_quiz", (genre) => {
  // ジャンルを保存しておく（クイズ画面で使う）
  localStorage.setItem("selectedGenre", genre);
  window.location.href = "/quiz.html";
});
