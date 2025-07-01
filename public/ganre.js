function selectGenre(genre) {
  localStorage.setItem("genre", genre);
  location.href = "/quiz.html";
}
