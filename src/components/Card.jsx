import { useState, useRef, useEffect } from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

function Card({ card, onUpvote, onDelete, onEdit, onPin }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [editing, setEditing] = useState(false);
  const [editText, setEditText] = useState(card.text);
  const menuRef = useRef(null);

  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: card.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
  };

  useEffect(() => {
    const handleClick = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const handleEdit = () => {
    setMenuOpen(false);
    setEditing(true);
  };

  const handleSaveEdit = () => {
    if (editText.trim()) onEdit(editText.trim());
    setEditing(false);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(card.text);
    setMenuOpen(false);
  };

  const handlePin = () => {
    onPin();
    setMenuOpen(false);
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`card ${card.pinned ? "card-pinned" : ""}`}
      {...attributes}
    >
      <div className="card-drag-handle" {...listeners}>⠿</div>
      {editing ? (
        <div className="edit-area">
          <textarea
            autoFocus
            value={editText}
            onChange={(e) => setEditText(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSaveEdit(); }
              if (e.key === "Escape") setEditing(false);
            }}
          />
          <div className="draft-actions">
            <button className="save-btn" onClick={handleSaveEdit}>Save</button>
            <button className="cancel-btn" onClick={() => setEditing(false)}>Cancel</button>
          </div>
        </div>
      ) : (
        <>
          <p>{card.pinned && <span className="pin-icon">📌 </span>}{card.text}</p>
          <div className="card-actions">
            <button className="vote-btn" onClick={onUpvote}>👍 {card.votes}</button>
            <div className="menu-wrapper" ref={menuRef}>
              <button className="menu-btn" onClick={() => setMenuOpen((o) => !o)}>⋯</button>
              {menuOpen && (
                <div className="menu-dropdown">
                  <button onClick={handleEdit}>✏️ Edit card</button>
                  <button onClick={handleCopy}>📋 Copy card text</button>
                  <button onClick={handlePin}>{card.pinned ? "📌 Unpin card" : "📌 Pin card"}</button>
                  <button className="menu-delete" onClick={() => { setMenuOpen(false); onDelete(); }}>🗑️ Delete card</button>
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export default Card;