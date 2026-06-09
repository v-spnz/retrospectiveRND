import { useState, useEffect } from "react";
import { db } from "./firebase";
import { collection, addDoc, onSnapshot, orderBy, query } from "firebase/firestore";
import Board from "./components/Board";
import "./App.css";

function App() {
  const [boardName, setBoardName] = useState("");
  const [activeBoardName, setActiveBoardName] = useState(null);
  const [boards, setBoards] = useState([]);

  useEffect(() => {
    const q = query(collection(db, "boards-list"), orderBy("createdAt", "desc"));
    const unsub = onSnapshot(q, (snap) => {
      setBoards(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
    });
    return () => unsub();
  }, []);

  const handleStart = async () => {
    const name = boardName.trim();
    if (!name) return;
    const exists = boards.find((b) => b.name.toLowerCase() === name.toLowerCase());
    if (!exists) {
      await addDoc(collection(db, "boards-list"), {
        name,
        createdAt: Date.now(),
      });
    }
    setActiveBoardName(name);
    setBoardName("");
  };

  if (activeBoardName) {
    return <Board boardName={activeBoardName} onBack={() => setActiveBoardName(null)} />;
  }

  return (
    <div className="home">
      <div className="home-header">
        <h1>LocalLink Retrospectives</h1>
        <p>Create or open a sprint retrospective board</p>
      </div>

      <div className="home-create">
        <input
          type="text"
          placeholder='e.g. "Sprint 1 Retro"'
          value={boardName}
          onChange={(e) => setBoardName(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleStart()}
        />
        <button onClick={handleStart}>+ New Board</button>
      </div>

      <div className="home-boards">
        <h2>Your Boards</h2>
        {boards.length === 0 ? (
          <p className="no-boards">No boards yet — create one above</p>
        ) : (
          <div className="boards-grid">
            {boards.map((b) => (
              <div
                key={b.id}
                className="board-card"
                onClick={() => setActiveBoardName(b.name)}
              >
                <span className="board-card-icon">📋</span>
                <span className="board-card-name">{b.name}</span>
                <span className="board-card-arrow">→</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default App;