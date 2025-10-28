// src/components/Header.js
import React from 'react';

export default function Header({ user, onSignIn, onSignOut }) {
  return (
    <header className="header">
      <h1>My Reading Shelf ❤️📚</h1>
      <div style={{ marginTop: 10 }}>
        <div className="searchbar" style={{ justifyContent: 'center' }}>
          {/* optional controls could go here */}
        </div>
      </div>
      <div className="user" style={{ right: 12, top: 12 }}>
        {user ? (
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            {/* Removed the profile image */}
            <div style={{ fontSize: 12 }}>{user.displayName}</div>
            <button className="btn" onClick={onSignOut} style={{ padding: '6px 8px' }}>
              Sign out
            </button>
          </div>
        ) : (
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <div style={{ fontSize: 12 }}>Not signed in</div>
            <button className="btn" onClick={onSignIn} style={{ padding: '6px 8px' }}>
              Sign in
            </button>
          </div>
        )}
      </div>
    </header>
  );
}