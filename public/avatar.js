const avatars = document.querySelectorAll(".avatar");
let selectedAvatar = null;

avatars.forEach((avatar) => {
  avatar.addEventListener("click", () => {
    avatars.forEach((a) => a.classList.remove("selected"));
    avatar.classList.add("selected");
    selectedAvatar = avatar.getAttribute("src");
  });
});

document.getElementById("confirmBtn").addEventListener("click", () => {
  if (selectedAvatar) {
    localStorage.setItem("avatar", selectedAvatar);
    window.location.href = "waiting.html";
  } else {
    alert("アバターを選択してください");
  }
});
