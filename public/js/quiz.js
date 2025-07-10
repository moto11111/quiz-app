const socket = io();
const questionDiv = document.getElementById("question");
const timerDiv = document.getElementById("timer");
const answerInput = document.getElementById("answer");
const statusDiv = document.getElementById("status");

let fullText = "";
let typingIndex = 0;
let typingInterval;
let score = 0;
let canBuzz = true;

socket.on("question", (data) => {
  fullText = data.question;
  typingIndex = 0;
  questionDiv.textContent = "";
  statusDiv.textContent = "";
  answerInput.disabled = true;
  startTyping();
});

socket.on("pause_typing", () => {
  clearInterval(typingInterval);
});

socket.on("resume_typing", () => {
  startTyping();
});

socket.on("your_turn", () => {
  statusDiv.textContent = "あなたが回答者です";
  answerInput.disabled = false;
  answerInput.focus();
  canBuzz = false;
});

socket.on("wait", () => {
  statusDiv.textContent = "他の人が回答中…";
  answerInput.disabled = true;
});

socket.on("result", (data) => {
  statusDiv.textContent = data.message;
  setTimeout(() => {
    answerInput.value = "";
    if (data.next) socket.emit("next_request");
  }, 2000);
});

function startTyping() {
  typingInterval = setInterval(() => {
    if (typingIndex < fullText.length) {
      questionDiv.textContent += fullText[typingIndex++];
    } else {
      clearInterval(typingInterval);
    }
  }, 70);
}

window.addEventListener("keydown", (e) => {
  if (e.key === "Enter" && canBuzz) {
    socket.emit("buzz");
  }
});

answerInput.addEventListener("keydown", (e) => {
  if (e.key === "Enter" && !answerInput.disabled) {
    socket.emit("answer", answerInput.value.trim());
  }
});
