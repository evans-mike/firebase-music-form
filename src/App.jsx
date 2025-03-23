import './styles.css';
import { useState, useEffect } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from './firebase';
import { LoginForm } from './components/LoginForm';
import { SongForm } from './components/SongForm';
import { OccurrenceForm } from './components/OccurrenceForm';
import { getSongs } from './api'; // Import the new function

export function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [songs, setSongs] = useState([]); // State for storing songs
  const [songsLoading, setSongsLoading] = useState(false); // State for loading songs

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

    // Cleanup subscription
    return () => unsubscribe();
  }, []);

  const handleLoginSuccess = () => {
    console.log('Login successful');
  };

  const handleGetSongs = async () => {
    setSongsLoading(true);
    try {
      const songsList = await getSongs();
      setSongs(songsList);
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
            <h2>Create New Song</h2>
            <SongForm user={user} />
          </section>

          <section className="form-section">
            <h2>Song Occurrences</h2>
            <OccurrenceForm user={user} />
          </section>

          <section className="form-section">
            <h2>Get Songs</h2>
            <button onClick={handleGetSongs} disabled={songsLoading}>
              {songsLoading ? 'Loading Songs...' : 'Get Songs'}
            </button>
            {songs.length > 0 && (
              <ul>
                {songs.map((song) => (
                  <li key={song.id}>{song.title}</li>
                ))}
              </ul>
            )}
          </section>
        </div>
      )}
    </div>
  );
}