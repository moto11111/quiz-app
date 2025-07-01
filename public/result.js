const socket = io();
const resultsDiv = document.getElementById("results");

socket.emit("get-results");

socket.on("results", (scores) => {
  resultsDiv.innerHTML = '';
  const sorted = Object.entries(scores).sort((a, b) => b[1] - a[1]);
  sorted.forEach(([name, score], index) => {
    const div = document.createElement("div");
    div.textContent = `${index + 1}. ${name}：${score}点`;
    resultsDiv.appendChild(div);
  });
});
