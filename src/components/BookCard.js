// src/components/BookCard.js
import React from 'react';

export default function BookCard({ book, actions = [] /* array of {label, onClick} */ }) {
  return (
    <div className="book">
      <img src={book.img || 'https://via.placeholder.com/150x200?text=No+Image'} alt={book.title} />
      <h4>{book.title}</h4>
      <div className="small">{book.author || ''}</div>
      <div className="action-row">
        {actions.map((a, i) => (
          <button key={i} className="btn" onClick={() => a.onClick(book)} style={{padding:'6px 8px', fontSize:12}}>
            {a.label}
          </button>
        ))}
      </div>
    </div>
  );
}
