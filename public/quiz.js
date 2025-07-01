const socket = io();
let genre = localStorage.getItem("genre") || "kihon";
let questions = [];
let currentQuestionIndex = 0;
let hasBuzzed = false;

fetch(`/data/${genre}.json`)
  .then(res => res.json())
  .then(data => {
    questions = data;
    showQuestion();
  });

function showQuestion() {
  if (currentQuestionIndex >= questions.length) {
    location.href = "/result.html";
    return;
  }
  const question = questions[currentQuestionIndex];
  document.getElementById("question").textContent = question.q;
  document.getElementById("answerInput").value = "";
  document.querySelector(".answer-box").style.display = "none";
  document.getElementById("message").textContent = "";
  hasBuzzed = false;
}

document.getElementById("buzzerBtn").addEventListener("click", () => {
  if (!hasBuzzed) {
    socket.emit("buzz");
  }
});

socket.on("buzz-winner", () => {
  hasBuzzed = true;
  document.querySelector(".answer-box").style.display = "block";
});

document.getElementById("submitAnswerBtn").addEventListener("click", () => {
  const answer = document.getElementById("answerInput").value.trim();
  socket.emit("submit-answer", { answer });
});

socket.on("answer-result", (result) => {
  document.getElementById("message").textContent = result.correct ? "正解！" : "不正解！";
  if (result.correct) {
    currentQuestionIndex++;
    setTimeout(showQuestion, 2000);
  }
});
