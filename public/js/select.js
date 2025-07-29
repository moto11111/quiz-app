document.getElementById("startBtn").addEventListener("click", () => {
  const name = document.getElementById("playerName").value.trim();
  const avatar = document.querySelector("input[name='avatar']:checked").value;

  if (!name) {
    alert("名前を入力してください");
    return;
  }

  // 保存
  localStorage.setItem("playerName", name);
  localStorage.setItem("playerAvatar", avatar);

  // 参加（isHost は false に設定）
  localStorage.setItem("isHost", "false");

  // join.html → socket.emit → wait.html
  window.location.href = "join.html";
});
