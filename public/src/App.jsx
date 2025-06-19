// src/App.jsx
import React, { useState } from 'react';
import TitleScreen from './components/TitleScreen';
import RoomSelection from './components/RoomSelection';

const App = () => {
  const [screen, setScreen] = useState("title");

  const handleStart = () => setScreen("room");
  const handleCreateRoom = () => {
    // ルーム作成処理（仮）
    alert("ルームを作成しました！");
  };

  const handleJoinRoom = (code) => {
    // ルーム参加処理（仮）
    alert(`ルーム ${code} に参加しました！`);
  };

  return (
    <div>
      {screen === "title" && <TitleScreen onStart={handleStart} />}
      {screen === "room" && (
        <RoomSelection
          onCreateRoom={handleCreateRoom}
          onJoinRoom={handleJoinRoom}
        />
      )}
    </div>
  );
};

export default App;
