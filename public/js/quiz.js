const questionText = document.getElementById("question-text");
const questionNumber = document.getElementById("question-number");
const timerEl = document.getElementById("timer");
const answerBox = document.getElementById("answer-box");
const answerInput = document.getElementById("answer-input");
const status = document.getElementById("answer-status");

let currentIndex = 0;
let quizList = [];
let state = "typing"; // typing, waiting, answer, locked
let typingInterval, questionTimer, answerTimer;
let index = 0;
let fullText = "";
let questionRemaining = 10;
let answerRemaining = 7;
let points = 0;

window.onload = function () {
    const selectedGenre = localStorage.getItem("selectedGenre") || "kihon";
    console.log("選択されたジャンル:", selectedGenre);

    fetch(`data/${selectedGenre}.json`)
        .then((res) => {
            if (!res.ok) throw new Error("読み込み失敗");
            return res.json();
        })
        .then((data) => {
            console.log("読み込んだデータ:", data);
            if (!data.length) {
                questionText.textContent = "問題データが空です。";
                return;
            }
            quizList = data;
            showQuestion();
        })
        .catch((err) => {
            console.error("読み込みエラー:", err);
            questionText.textContent = "問題の読み込みに失敗しました。";
        });
};

function showQuestion() {
    state = "typing";
    index = 0;
    questionRemaining = 10;
    answerRemaining = 7;
    answerBox.style.display = "none";
    answerInput.disabled = false;
    answerInput.value = "";
    status.textContent = "";

    if (currentIndex >= quizList.length) {
        localStorage.setItem("score", points);
        window.location.href = "result.html";  // ← quiz.htmlをHTMLで動かす場合は.php → .html に
        return;
    }

    questionNumber.textContent = `${currentIndex + 1}/${quizList.length}`;
    fullText = quizList[currentIndex].question;
    questionText.textContent = "";

    typingInterval = setInterval(() => {
        if (index < fullText.length) {
            questionText.textContent += fullText[index++];
        } else {
            clearInterval(typingInterval);
            state = "waiting";
            startQuestionTimer();
        }
    }, 70);
}

function startQuestionTimer() {
    timerEl.textContent = `残り時間：${questionRemaining} 秒`;
    questionTimer = setInterval(() => {
        questionRemaining--;
        timerEl.textContent = `残り時間：${questionRemaining} 秒`;
        if (questionRemaining <= 0) {
            clearInterval(questionTimer);
            moveToNextQuestion();
        }
    }, 1000);
}

function startAnswerTimer() {
    state = "answer";
    timerEl.textContent = `解答時間：${answerRemaining} 秒`;
    answerTimer = setInterval(() => {
        answerRemaining--;
        timerEl.textContent = `解答時間：${answerRemaining} 秒`;
        if (answerRemaining <= 0) {
            clearInterval(answerTimer);
            moveToNextQuestion();
        }
    }, 1000);
}

function showAnswerBox() {
    answerBox.style.display = "flex";
    answerInput.focus();
    startAnswerTimer();
}

function moveToNextQuestion() {
    clearInterval(questionTimer);
    clearInterval(answerTimer);
    currentIndex++;
    setTimeout(showQuestion, 1000);
}

window.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
        if (state === "typing") {
            clearInterval(typingInterval);
            state = "waiting";
            startQuestionTimer();
        } else if (state === "waiting") {
            clearInterval(questionTimer);
            showAnswerBox();
        }
    }
});

answerInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter" && state === "answer") {
        const ans = answerInput.value.trim();
        const correct = quizList[currentIndex].answer;
        if (ans) {
            if (ans.toLowerCase() === correct.toLowerCase()) {
                status.textContent = "正解！";
                points += 10;
                clearInterval(answerTimer);
                setTimeout(moveToNextQuestion, 1500);
            } else {
                status.textContent = `不正解。正解は：${correct}`;
                state = "locked";
                answerInput.disabled = true;
                setTimeout(moveToNextQuestion, 2000);
            }
        }
    }
});
