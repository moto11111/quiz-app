// タイトル画面機能
class TitleScreen {
  show() {
    console.log("タイトル画面を表示");
  }
}

// ルーム機能
class RoomManager {
  createRoom() {
    console.log("ルームを作成");
  }

  joinRoom() {
    console.log("ルームに参加");
  }
}

// アバター選択機能
class AvatarSelector {
  selectAvatar(id) {
    console.log(`アバター ${id} を選択`);
  }
}

// クイズ進行機能（スコアやタイマーなどを含む）
class QuizGame {
  startQuiz() {
    console.log("クイズ開始");
  }
  submitAnswer(answer) {
    console.log(`回答：${answer}`);
  }
}
