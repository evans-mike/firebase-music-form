import './styles.css';
import { useState, useEffect } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from './firebase';
import { LoginForm } from './components/LoginForm';
import { SongForm } from './components/SongForm';
import { OccurrenceForm } from './components/OccurrenceForm';
import { GetOccurrences } from './components/GetOccurrences';
import { getSongs } from './api';

export function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [songs, setSongs] = useState([]); 
  const [songsLoading, setSongsLoading] = useState(false); 
  const [isSongFormCollapsed, setIsSongFormCollapsed] = useState(true); 
  const [isOccurrencesCollapsed, setIsOccurrencesCollapsed] = useState(true); 

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      console.log('Auth state changed:', user ? { 
        uid: user.uid, 
        email: user.email,
        emailVerified: user.emailVerified 
      } : 'No user');
      
      setUser(user);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    handleGetSongs();
  }, []);

  const handleLoginSuccess = () => {
    console.log('Login successful');
  };

  const handleGetSongs = async () => {
    setSongsLoading(true);
    try {
      const songsList = await getSongs();
      const sortedSongs = songsList.sort((a, b) => {
        const titleA = a.title ? a.title.toString() : ''; 
        const titleB = b.title ? b.title.toString() : ''; 
        return titleA.localeCompare(titleB);
      });
      setSongs(sortedSongs);
    } catch (error) {
      console.error('Error fetching songs:', error);
    } finally {
      setSongsLoading(false);
    }
  };

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  return (
    <div className="app">
      {!user ? (
        <LoginForm onLoginSuccess={handleLoginSuccess} />
      ) : (
        <div className="forms-container">
          <header className="app-header">
            <h1>Music Form</h1>
            <button 
              onClick={() => auth.signOut()} 
              className="logout-button"
            >
              Logout
            </button>
          </header>

          <section className="form-section">
            <h2 onClick={() => setIsSongFormCollapsed(!isSongFormCollapsed)}>
              Create New Song {isSongFormCollapsed ? '▼' : '▲'}
            </h2>
            {!isSongFormCollapsed && <SongForm user={user} onSongCreated={handleGetSongs} />}
          </section>

          <section className="form-section">
            <h2 onClick={() => setIsOccurrencesCollapsed(!isOccurrencesCollapsed)}>
              View Song Occurrences {isOccurrencesCollapsed ? '▼' : '▲'}
            </h2>
            {!isOccurrencesCollapsed && <GetOccurrences />}
          </section>

          <section className="form-section">
            <h2>Song Occurrences</h2>
            <OccurrenceForm user={user} songs={songs} />
          </section>
        </div>
      )}
    </div>
  );
}
