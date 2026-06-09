import { useState, useEffect } from "react";
import { db } from "../firebase";
import {
  collection, addDoc, onSnapshot, updateDoc,
  deleteDoc, doc, query, orderBy, writeBatch,
} from "firebase/firestore";
import {
  DndContext, closestCorners, PointerSensor,
  useSensor, useSensors, DragOverlay, useDroppable,
} from "@dnd-kit/core";
import {
  SortableContext, verticalListSortingStrategy, arrayMove,
} from "@dnd-kit/sortable";
import Card from "./Card";
import "./Board.css";

const COLUMNS = [
  { id: "liked",   label: "👍 Liked",      color: "#12B886" },
  { id: "learned", label: "🧠 Learned",    color: "#3B5BDB" },
  { id: "lacked",  label: "😕 Lacked",     color: "#e03131" },
  { id: "longed",  label: "✨ Longed For", color: "#FCC419" },
];

function DroppableColumn({ id, children }) {
  const { setNodeRef } = useDroppable({ id });
  return <div ref={setNodeRef} className="cards">{children}</div>;
}

function Board({ boardName, onBack }) {
  const [cards, setCards] = useState([]);
  const [addingTo, setAddingTo] = useState(null);
  const [draftText, setDraftText] = useState("");
  const [activeId, setActiveId] = useState(null);

  const boardId = boardName.toLowerCase().replace(/\s+/g, "-");

  const sensors = useSensors(useSensor(PointerSensor, {
    activationConstraint: { distance: 5 },
  }));

  useEffect(() => {
    const q = query(collection(db, "boards", boardId, "cards"), orderBy("createdAt", "asc"));
    const unsub = onSnapshot(q, (snap) => {
      setCards(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
    });
    return () => unsub();
  }, [boardId]);

  const openAdd = (columnId) => { setAddingTo(columnId); setDraftText(""); };

  const saveCard = async (column) => {
    const text = draftText.trim();
    if (!text) { setAddingTo(null); return; }
    const now = Date.now();
    await addDoc(collection(db, "boards", boardId, "cards"), {
      column, text, votes: 0, pinned: false, createdAt: now, order: now,
    });
    setAddingTo(null);
    setDraftText("");
  };

  const upvote = (cardId, currentVotes) =>
    updateDoc(doc(db, "boards", boardId, "cards", cardId), { votes: currentVotes + 1 });

  const deleteCard = (cardId) =>
    deleteDoc(doc(db, "boards", boardId, "cards", cardId));

  const editCard = (cardId, text) =>
    updateDoc(doc(db, "boards", boardId, "cards", cardId), { text });

  const pinCard = (cardId, current) =>
    updateDoc(doc(db, "boards", boardId, "cards", cardId), { pinned: !current });

  const handleDragStart = ({ active }) => setActiveId(active.id);

  const handleDragEnd = async ({ active, over }) => {
    setActiveId(null);
    if (!over || active.id === over.id) return;

    const activeCard = cards.find((c) => c.id === active.id);
    const overCard = cards.find((c) => c.id === over.id);
    const overColumn = overCard ? overCard.column : over.id;

    if (!activeCard || !overColumn) return;

    if (activeCard.column !== overColumn) {
      await updateDoc(doc(db, "boards", boardId, "cards", active.id), { column: overColumn });
    } else {
      const colCards = sortedCards(activeCard.column);
      const oldIndex = colCards.findIndex((c) => c.id === active.id);
      const newIndex = colCards.findIndex((c) => c.id === over.id);
      if (oldIndex === -1 || newIndex === -1 || oldIndex === newIndex) return;
      const reordered = arrayMove(colCards, oldIndex, newIndex);
      const batch = writeBatch(db);
      reordered.forEach((card, i) => {
        batch.update(doc(db, "boards", boardId, "cards", card.id), { order: i });
      });
      await batch.commit();
    }
  };

  const activeCard = cards.find((c) => c.id === activeId);

  const sortedCards = (colId) => {
    const col = cards.filter((c) => c.column === colId);
    const byOrder = (a, b) => (a.order ?? a.createdAt ?? 0) - (b.order ?? b.createdAt ?? 0);
    return [
      ...col.filter((c) => c.pinned).sort(byOrder),
      ...col.filter((c) => !c.pinned).sort(byOrder),
    ];
  };

  return (
    <div className="board">
      <div className="board-header">
        <button className="back-btn" onClick={onBack}>← Back</button>
        <h2>{boardName}</h2>
      </div>
      <DndContext
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <div className="columns">
          {COLUMNS.map((col) => (
            <div className="column" key={col.id} id={col.id} style={{ borderTop: `4px solid ${col.color}` }}>
              <h3 style={{ color: col.color }}>{col.label}</h3>
              <SortableContext items={sortedCards(col.id).map((c) => c.id)} strategy={verticalListSortingStrategy}>
                <DroppableColumn id={col.id}>
                  {sortedCards(col.id).map((card) => (
                    <Card
                      key={card.id}
                      card={card}
                      onUpvote={() => upvote(card.id, card.votes)}
                      onDelete={() => deleteCard(card.id)}
                      onEdit={(text) => editCard(card.id, text)}
                      onPin={() => pinCard(card.id, card.pinned)}
                    />
                  ))}
                  {addingTo === col.id && (
                    <div className="card draft-card">
                      <textarea
                        autoFocus
                        placeholder="Type your note..."
                        value={draftText}
                        onChange={(e) => setDraftText(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); saveCard(col.id); }
                          if (e.key === "Escape") { setAddingTo(null); }
                        }}
                      />
                      <div className="draft-actions">
                        <button className="save-btn" onClick={() => saveCard(col.id)}>Add</button>
                        <button className="cancel-btn" onClick={() => setAddingTo(null)}>Cancel</button>
                      </div>
                    </div>
                  )}
                </DroppableColumn>
              </SortableContext>
              {addingTo !== col.id && (
                <button className="add-btn" onClick={() => openAdd(col.id)}>+</button>
              )}
            </div>
          ))}
        </div>
        <DragOverlay>
          {activeCard ? (
            <div className="card drag-overlay">
              <p>{activeCard.text}</p>
            </div>
          ) : null}
        </DragOverlay>
      </DndContext>
    </div>
  );
}

export default Board;