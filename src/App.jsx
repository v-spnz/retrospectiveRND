import { useState } from "react";
import Board from "./components/Board";
import "./App.css";

function App() {
  const [boardName, setBoardName] = useState("");
  const [activeBoardName, setActiveBoardName] = useState(null);

  const handleStart = () => {
    if (boardName.trim()) {
      setActiveBoardName(boardName.trim());
    }
  };

  if (!activeBoardName) {
    return (
      <div className="home">
        <h1>LocalLink Retrospectives</h1>
        <p>Enter a board name to get started (e.g. "Sprint 1 Retro")</p>
        <input
          type="text"
          placeholder="Board name..."
          value={boardName}
          onChange={(e) => setBoardName(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleStart()}
        />
        <button onClick={handleStart}>Create / Open Board</button>
      </div>
    );
  }

  return <Board boardName={activeBoardName} onBack={() => setActiveBoardName(null)} />;
}

export default App;