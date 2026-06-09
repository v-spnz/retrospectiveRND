function Card({ card, onUpvote, onDelete }) {
  return (
    <div className="card">
      <p>{card.text}</p>
      <div className="card-actions">
        <button className="vote-btn" onClick={onUpvote}>👍 {card.votes}</button>
        <button className="delete-btn" onClick={onDelete}>✕</button>
      </div>
    </div>
  );
}

export default Card;