// src/components/RoomSelection.jsx
import React, { useState } from 'react';

const RoomSelection = ({ onCreateRoom, onJoinRoom }) => {
  const [roomCode, setRoomCode] = useState("");

  return (
    <div className="room-selection">
      <h2>ルームに参加または作成</h2>
      <button onClick={onCreateRoom}>ルームを作成する</button>

      <div style={{ marginTop: "20px" }}>
        <input
          type="text"
          placeholder="ルームコードを入力"
          value={roomCode}
          onChange={(e) => setRoomCode(e.target.value)}
        />
        <button onClick={() => onJoinRoom(roomCode)}>ルームに参加</button>
      </div>
    </div>
  );
};

export default RoomSelection;
