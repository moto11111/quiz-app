const socket = io();
let myName = "";

function register() {
  myName = document.getElementById("nameInput").value;
  if (myName) {
    socket.emit("register", myName);
    document.getElementById("register").style.display = "none";
    document.getElementById("game").style.display = "block";
  }
}

function buzz() {
  socket.emit("buzz");
}

function sendAnswer() {
  const answer = document.getElementById("answerInput").value;
  socket.emit("answer", answer);
  document.getElementById("answerArea").style.display = "none";
}

socket.on("start", (question) => {
  document.getElementById("question").innerText = question;
  document.getElementById("status").innerText = "";
  document.getElementById("answerArea").style.display = "none";
});

socket.on("buzzed", (name) => {
  document.getElementById("status").innerText = `${name} が早押ししました`;
  if (name === myName) {
    document.getElementById("answerArea").style.display = "block";
  }
});

socket.on("result", (msg, scores) => {
  document.getElementById("status").innerText = msg;
  let html = "";
  for (let id in scores) {
    html += `${id}: ${scores[id]}点<br>`;
  }
  document.getElementById("scores").innerHTML = html;
});

socket.on("end", (scores) => {
  let msg = "終了！<br>";
  for (let id in scores) {
    msg += `${id}: ${scores[id]}点<br>`;
  }
  document.getElementById("status").innerHTML = msg;
});
