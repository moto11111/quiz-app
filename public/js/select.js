document.addEventListener("DOMContentLoaded", () => {
  const avatarButtons = document.querySelectorAll(".avatar-button");

  avatarButtons.forEach((btn) => {
    btn.addEventListener("click", () => {
      const selectedAvatar = btn.dataset.avatar; // 例: "avatar1.png"
      sessionStorage.setItem("playerAvatar", selectedAvatar);

      // 画面遷移（ホスト or 参加者） → 必要に応じて分けてください
      const isHost = sessionStorage.getItem("isHost"); // 必要に応じて設定
      if (isHost === "true") {
        window.location.href = "/create.html";
      } else {
        window.location.href = "/join.html";
      }
    });
  });
});
