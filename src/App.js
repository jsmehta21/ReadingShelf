// src/App.js
import React, { useEffect, useState, useCallback } from 'react';
import './App.css';
import Header from './components/Header';
import BookCard from './components/BookCard';
import { auth, provider, db } from './firebase';
import { signInWithPopup, signOut, onAuthStateChanged } from 'firebase/auth';
import {
  collection, doc, setDoc, getDoc, deleteDoc, updateDoc,
  onSnapshot, query, where
} from 'firebase/firestore';

function shelfCollectionRef(uid) {
  // parent collection path 'users/{uid}/books'
  return collection(db, 'users', uid, 'books');
}

export default function App() {
  const [user, setUser] = useState(null);
  const [tab, setTab] = useState('search'); // 'search','toRead','reading','finished'
  const [queryStr, setQueryStr] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [shelves, setShelves] = useState({ toRead: [], reading: [], finished: [] });

  // auth listeners
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => {
      setUser(u ? { uid: u.uid, displayName: u.displayName, photoURL: u.photoURL } : null);
    });
    return () => unsub();
  }, []);

  // realtime listeners for logged-in user
  useEffect(() => {
    if (!user) {
      // clear shelves if not signed in
      setShelves({ toRead: [], reading: [], finished: [] });
      return;
    }
    const colRef = shelfCollectionRef(user.uid);

    // listen to each shelf by query
    const unsubscribers = ['toRead','reading','finished'].map(shelfName => {
      const q = query(colRef, where('shelf','==', shelfName));
      return onSnapshot(q, snapshot => {
        const arr = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
        setShelves(prev => ({ ...prev, [shelfName]: arr }));
      });
    });

    return () => unsubscribers.forEach(u => u());
  }, [user]);

  // Auth UI handlers
  const handleSignIn = async () => {
    try {
      await signInWithPopup(auth, provider);
    } catch (e) {
      console.error(e);
      alert('Sign-in failed');
    }
  };
  const handleSignOut = async () => {
    await signOut(auth);
  };

  // Search Google Books
  const handleSearch = useCallback(async (q) => {
    if (!q) return;
    setSearchResults([]);
    try {
      const res = await fetch(`https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(q)}+subject:fiction&maxResults=20`);
      const data = await res.json();
      if (!data.items) { setSearchResults([]); return; }
      const items = data.items.map(it => {
        const info = it.volumeInfo || {};
        const thumbnail = (info.imageLinks && (info.imageLinks.thumbnail || info.imageLinks.smallThumbnail)) || '';
        return {
          id: it.id,
          title: info.title || 'Untitled',
          author: (info.authors && info.authors[0]) || '',
          img: thumbnail
        };
      });
      setSearchResults(items);
    } catch (e) {
      console.error(e);
      alert('Error fetching books');
    }
  }, []);

  // Add book (cloud)
  const addBookCloud = async (book, shelfName) => {
    if (!user) { alert('Sign in to save to cloud'); return; }
    const col = shelfCollectionRef(user.uid);
    const bookDoc = doc(col, book.id);
    // set or overwrite doc with shelf field
    await setDoc(bookDoc, { id: book.id, title: book.title, img: book.img, author: book.author, shelf: shelfName });
    setTab(shelfName);
  };

  // Move book between shelves
  const moveBookCloud = async (bookDoc, toShelf) => {
    if (!user) return;
    const dRef = doc(db, 'users', user.uid, 'books', bookDoc.id);
    await updateDoc(dRef, { shelf: toShelf });
  };

  // Remove book
  const removeBookCloud = async (bookDoc) => {
    if (!user) return;
    const dRef = doc(db, 'users', user.uid, 'books', bookDoc.id);
    await deleteDoc(dRef);
  };

  // localStorage fallback (if you want offline local use)
  useEffect(() => {
    // simple: if not signed in, read localStorage and populate shelves
    if (!user) {
      const toRead = JSON.parse(localStorage.getItem('local_toRead') || '[]');
      const reading = JSON.parse(localStorage.getItem('local_reading') || '[]');
      const finished = JSON.parse(localStorage.getItem('local_finished') || '[]');
      setShelves({ toRead, reading, finished });
    } else {
      // remove local data when signed in to avoid confusion (optional)
    }
  }, [user]);

  // Save to localStorage when not signed in and shelves change (optional)
  useEffect(() => {
    if (!user) {
      localStorage.setItem('local_toRead', JSON.stringify(shelves.toRead));
      localStorage.setItem('local_reading', JSON.stringify(shelves.reading));
      localStorage.setItem('local_finished', JSON.stringify(shelves.finished));
    }
  }, [shelves, user]);

  return (
    <>
      <Header user={user} onSignIn={handleSignIn} onSignOut={handleSignOut} />
      <div className="container">
        <div className="tabs">
          <div className={`tab ${tab==='search'?'active':''}`} onClick={()=>setTab('search')}> Search</div>
          <div className={`tab ${tab==='toRead'?'active':''}`} onClick={()=>setTab('toRead')}>To Read</div>
          <div className={`tab ${tab==='reading'?'active':''}`} onClick={()=>setTab('reading')}> Reading</div>
          <div className={`tab ${tab==='finished'?'active':''}`} onClick={()=>setTab('finished')}> Finished</div>
        </div>

        {/* Search content */}
        {tab === 'search' && (
          <section>
            <div className="searchbar">
              <input
                value={queryStr}
                onChange={e => setQueryStr(e.target.value)}
                onKeyPress={e => { if (e.key === 'Enter') handleSearch(queryStr); }}
                placeholder="Search for novels (press Enter)"
              />
              <button className="btn" onClick={() => handleSearch(queryStr)}>Search</button>
            </div>

            <div className="grid">
              {searchResults.map(b => (
                <BookCard
                  key={b.id}
                  book={b}
                  actions={[
                    { label: 'To Read', onClick: (book)=> addBookCloud(book,'toRead') },
                    { label: 'Reading', onClick: (book)=> addBookCloud(book,'reading') },
                    { label: 'Finished', onClick: (book)=> addBookCloud(book,'finished') }
                  ]}
                />
              ))}
            </div>
          </section>
        )}

        {/* To Read */}
        {/* To Read */}
{tab === 'toRead' && (
  <section>
    <h2 style={{ textAlign: 'center' }}>To Read</h2>
    <p style={{ textAlign: 'center', color: '#666', marginBottom: '10px' }}>
      {shelves.toRead.length} book{shelves.toRead.length !== 1 ? 's' : ''}
    </p>
    <div className="grid">
      {shelves.toRead.map(b => (
        <BookCard key={b.id} book={b} actions={[
          { label: 'Reading', onClick: ()=> moveBookCloud(b,'reading') },
          { label: 'Finished', onClick: ()=> moveBookCloud(b,'finished') },
          { label: 'Remove', onClick: ()=> removeBookCloud(b) }
        ]}/>
      ))}
    </div>
  </section>
)}


        {/* Reading */}
        {/* Reading */}
{tab === 'reading' && (
  <section>
    <h2 style={{ textAlign: 'center' }}>Reading</h2>
    <p style={{ textAlign: 'center', color: '#666', marginBottom: '10px' }}>
      {shelves.reading.length} book{shelves.reading.length !== 1 ? 's' : ''}
    </p>
    <div className="grid">
      {shelves.reading.map(b => (
        <BookCard key={b.id} book={b} actions={[
          { label: 'To Read', onClick: ()=> moveBookCloud(b,'toRead') },
          { label: 'Finished', onClick: ()=> moveBookCloud(b,'finished') },
          { label: 'Remove', onClick: ()=> removeBookCloud(b) }
        ]}/>
      ))}
    </div>
  </section>
)}


        {/* Finished */}
        {/* Finished */}
{tab === 'finished' && (
  <section>
    <h2 style={{ textAlign: 'center' }}>Finished</h2>
    <p style={{ textAlign: 'center', color: '#666', marginBottom: '10px' }}>
      {shelves.finished.length} book{shelves.finished.length !== 1 ? 's' : ''}
    </p>
    <div className="grid">
      {shelves.finished.map(b => (
        <BookCard key={b.id} book={b} actions={[
          { label: 'To Read', onClick: ()=> moveBookCloud(b,'toRead') },
          { label: 'Reading', onClick: ()=> moveBookCloud(b,'reading') },
          { label: 'Remove', onClick: ()=> removeBookCloud(b) }
        ]}/>
      ))}
    </div>
  </section>
)}

      </div>

      <footer className="footer">So many books, so little time!</footer>
    </>
  );
}
