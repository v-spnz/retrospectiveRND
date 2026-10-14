import { useState, useRef, useEffect, useLayoutEffect } from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

function Card({ card, onUpvote, onDelete, onEdit, onPin }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [editing, setEditing] = useState(false);
  const [editText, setEditText] = useState(card.text);
  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState("");
  const menuRef = useRef(null);
  const dropdownRef = useRef(null);

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

  useLayoutEffect(() => {
    if (!menuOpen) return;

    const positionMenu = () => {
      const wrapper = menuRef.current;
      const dropdown = dropdownRef.current;
      if (!wrapper || !dropdown) return;

      const anchor = wrapper.getBoundingClientRect();
      const menu = dropdown.getBoundingClientRect();
      const edge = 12;
      const left = Math.max(
        edge - anchor.left,
        Math.min(0, window.innerWidth - edge - anchor.left - menu.width),
      );
      const below = anchor.height + 4;
      const above = -menu.height - 4;
      const preferredTop = anchor.bottom + 4 + menu.height <= window.innerHeight - edge
        ? below : above;
      const top = Math.max(
        edge - anchor.top,
        Math.min(preferredTop, window.innerHeight - edge - anchor.top - menu.height),
      );

      dropdown.style.left = `${left}px`;
      dropdown.style.top = `${top}px`;
    };

    positionMenu();
    window.addEventListener("resize", positionMenu);
    window.addEventListener("scroll", positionMenu, true);
    return () => {
      window.removeEventListener("resize", positionMenu);
      window.removeEventListener("scroll", positionMenu, true);
    };
  }, [menuOpen]);

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

  const requestDelete = () => {
    setMenuOpen(false);
    setDeleteError("");
    setConfirmingDelete(true);
  };

  const handleDelete = async () => {
    setDeleting(true);
    setDeleteError("");
    try {
      await onDelete();
      setConfirmingDelete(false);
    } catch {
      setDeleteError("Could not delete this card. Please try again.");
    } finally {
      setDeleting(false);
    }
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
            <button className="delete-btn" onClick={requestDelete} aria-label="Delete card">Delete</button>
            <div className="menu-wrapper" ref={menuRef}>
              <button className="menu-btn" onClick={() => setMenuOpen((o) => !o)} aria-label="Card options" aria-expanded={menuOpen}>⋯</button>
              {menuOpen && (
                <div className="menu-dropdown" ref={dropdownRef}>
                  <button onClick={handleEdit}>✏️ Edit card</button>
                  <button onClick={handleCopy}>📋 Copy card text</button>
                  <button onClick={handlePin}>{card.pinned ? "📌 Unpin card" : "📌 Pin card"}</button>
                  <button className="menu-delete" onClick={requestDelete}>🗑️ Delete card</button>
                </div>
              )}
            </div>
          </div>
          {confirmingDelete && (
            <div className="delete-confirmation">
              <p>Delete this card?</p>
              <div className="draft-actions">
                <button className="confirm-delete-btn" onClick={handleDelete} disabled={deleting}>
                  {deleting ? "Deleting..." : "Delete card"}
                </button>
                <button className="cancel-btn" onClick={() => { setConfirmingDelete(false); setDeleteError(""); }} disabled={deleting}>
                  Cancel
                </button>
              </div>
              {deleteError && <p className="delete-error" role="alert">{deleteError}</p>}
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default Card;
