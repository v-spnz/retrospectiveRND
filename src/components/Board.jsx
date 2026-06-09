import { useState, useEffect } from "react";
import { db } from "../firebase";
import {
  collection,
  addDoc,
  onSnapshot,
  updateDoc,
  deleteDoc,
  doc,
  query,
  orderBy,
} from "firebase/firestore";
import Card from "./Card";
import "./Board.css";

const COLUMNS = [
  { id: "liked", label: "👍 Liked", color: "#12B886" },
  { id: "learned", label: "🧠 Learned", color: "#3B5BDB" },
  { id: "lacked", label: "😕 Lacked", color: "#e03131" },
  { id: "longed", label: "✨ Longed For", color: "#FCC419" },
];

function Board({ boardName, onBack }) {
  const [cards, setCards] = useState([]);
  const [inputs, setInputs] = useState({ liked: "", learned: "", lacked: "", longed: "" });

  const boardId = boardName.toLowerCase().replace(/\s+/g, "-");

  useEffect(() => {
    const q = query(
      collection(db, "boards", boardId, "cards"),
      orderBy("createdAt", "asc")
    );
    const unsub = onSnapshot(q, (snap) => {
      setCards(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
    });
    return () => unsub();
  }, [boardId]);

  const addCard = async (column) => {
    const text = inputs[column].trim();
    if (!text) return;
    await addDoc(collection(db, "boards", boardId, "cards"), {
      column,
      text,
      votes: 0,
      createdAt: Date.now(),
    });
    setInputs((prev) => ({ ...prev, [column]: "" }));
  };

  const upvote = async (cardId, currentVotes) => {
    await updateDoc(doc(db, "boards", boardId, "cards", cardId), {
      votes: currentVotes + 1,
    });
  };

  const deleteCard = async (cardId) => {
    await deleteDoc(doc(db, "boards", boardId, "cards", cardId));
  };

  return (
    <div className="board">
      <div className="board-header">
        <button className="back-btn" onClick={onBack}>← Back</button>
        <h2>{boardName}</h2>
      </div>
      <div className="columns">
        {COLUMNS.map((col) => (
          <div className="column" key={col.id} style={{ borderTop: `4px solid ${col.color}` }}>
            <h3 style={{ color: col.color }}>{col.label}</h3>
            <div className="cards">
              {cards
                .filter((c) => c.column === col.id)
                .sort((a, b) => b.votes - a.votes)
                .map((card) => (
                  <Card
                    key={card.id}
                    card={card}
                    onUpvote={() => upvote(card.id, card.votes)}
                    onDelete={() => deleteCard(card.id)}
                  />
                ))}
            </div>
            <div className="add-card">
              <input
                type="text"
                placeholder="Add a card..."
                value={inputs[col.id]}
                onChange={(e) => setInputs((prev) => ({ ...prev, [col.id]: e.target.value }))}
                onKeyDown={(e) => e.key === "Enter" && addCard(col.id)}
              />
              <button onClick={() => addCard(col.id)}>+</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Board;