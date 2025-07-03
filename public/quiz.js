const socket = new WebSocket(`wss://${location.host}`);
let questions = [];

socket.addEventListener("open", () => {
  const genre = sessionStorage.getItem("genre");
  const roomId = sessionStorage.getItem("roomId");
  socket.send(JSON.stringify({ type: "join-room", roomId }));
});

socket.addEventListener("message", (event) => {
  const msg = JSON.parse(event.data);

  if (msg.type === "you-are-host") {
    document.getElementById("startBtn").style.display = "block";
  }

  if (msg.type === "start-quiz") {
    showRandomQuestion();
  }
});

function fetchQuestions() {
  const genre = sessionStorage.getItem("genre");
  fetch(`/data/${genre}.json`)
    .then((res) => res.json())
    .then((data) => {
      questions = data;
    })
    .catch((err) => console.error("問題の読み込みに失敗しました", err));
}

function showRandomQuestion() {
  const questionBox = document.getElementById("questionBox");
  questionBox.innerHTML = "";
  const q = questions[Math.floor(Math.random() * questions.length)];

  let i = 0;
  const interval = setInterval(() => {
    if (i < q.question.length) {
      questionBox.innerHTML += q.question[i];
      i++;
    } else {
      clearInterval(interval);
    }
  }, 50); // タイプライター速度（ミリ秒）
}

document.addEventListener("DOMContentLoaded", () => {
  fetchQuestions();

  const startBtn = document.getElementById("startBtn");
  startBtn.addEventListener("click", () => {
    const roomId = sessionStorage.getItem("roomId");
    socket.send(JSON.stringify({ type: "start-quiz", roomId }));
  });
});
