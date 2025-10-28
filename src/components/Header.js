// src/components/Header.js
import React from 'react';

export default function Header({ user, onSignIn, onSignOut }) {
  return (
    <header
      style={{
        width: '100%',
        padding: '12px 20px',
        boxSizing: 'border-box',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '10px',
        textAlign: 'center',
      }}
    >
      <h1
        style={{
          fontSize: '1.8rem',
          margin: 0,
          wordWrap: 'break-word',
        }}
      >
        My Reading Shelf ❤️📚
      </h1>

      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '10px',
          flexWrap: 'wrap',
        }}
      >
        {user ? (
          <>
            <span style={{ fontSize: '0.9rem' }}>{user.displayName}</span>
            <button
              onClick={onSignOut}
              style={{
                border: 'none',
                backgroundColor: '#8b5e34',
                color: '#ffffff',
                padding: '6px 10px',
                borderRadius: '6px',
                cursor: 'pointer',
                fontSize: '0.9rem',
              }}
            >
              Sign out
            </button>
          </>
        ) : (
          <>
            <span style={{ fontSize: '0.9rem' }}>Not signed in</span>
            <button
              onClick={onSignIn}
              style={{
                border: 'none',
                backgroundColor: '#f2f2f2',
                padding: '6px 10px',
                borderRadius: '6px',
                cursor: 'pointer',
                fontSize: '0.9rem',
              }}
            >
              Sign in
            </button>
          </>
        )}
      </div>

      <style>{`
        @media (max-width: 600px) {
          header {
            padding: 10px;
          }
          h1 {
            font-size: 1.5rem !important;
          }
          button {
            padding: 5px 8px !important;
            font-size: 0.85rem !important;
          }
        }
      `}</style>
    </header>
  );
}
