// src/components/TitleScreen.jsx
import React from 'react';

const TitleScreen = ({ onStart }) => {
  return (
    <div className="title-screen">
      <h1>早押しクイズ！</h1>
      <button onClick={onStart}>ゲーム開始</button>
    </div>
  );
};

export default TitleScreen;
