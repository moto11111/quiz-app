const express = require('express');
const app = express();
const path = require('path');

app.use(express.static('public')); // public フォルダを公開

// 画面ごとのルート設定
app.get('/', (req, res) => res.sendFile(path.join(__dirname, 'public/index.html')));
app.get('/room', (req, res) => res.sendFile(path.join(__dirname, 'public/room.html')));
app.get('/avatar', (req, res) => res.sendFile(path.join(__dirname, 'public/avatar.html')));
app.get('/waiting', (req, res) => res.sendFile(path.join(__dirname, 'public/waiting.html')));
app.get('/genre', (req, res) => res.sendFile(path.join(__dirname, 'public/genre.html')));
app.get('/quiz', (req, res) => res.sendFile(path.join(__dirname, 'public/quiz.html')));
app.get('/result', (req, res) => res.sendFile(path.join(__dirname, 'public/result.html')));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
