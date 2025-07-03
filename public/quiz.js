window.addEventListener('DOMContentLoaded', () => {
  const genre = sessionStorage.getItem('genre');
  if (!genre) {
    alert('ジャンルが選択されていません。');
    window.location.href = '/genre';
    return;
  }

  fetch(`/data/${genre}.json`)
    .then((res) => {
      if (!res.ok) {
        throw new Error('問題ファイルの読み込みに失敗しました');
      }
      return res.json();
    })
    .then((questions) => {
      displayQuestions(questions);
    })
    .catch((err) => {
      console.error(err);
      alert('問題の読み込み中にエラーが発生しました');
    });
});

function displayQuestions(questions) {
  const container = document.createElement('div');
  container.style.padding = '20px';
  document.body.appendChild(container);

  questions.forEach((q, index) => {
    const p = document.createElement('p');
    p.textContent = `Q${index + 1}: ${q.question}`;
    container.appendChild(p);
  });
}
