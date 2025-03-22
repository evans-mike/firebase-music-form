import { useState, useEffect } from 'react';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { auth } from './firebase';
import { LoginForm } from './components/LoginForm';
import { SongForm } from './components/SongForm';
import { OccurrenceForm } from './components/OccurrenceForm';


export function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (!user) {
        // Handle unauthenticated state
        console.error('User not authenticated');
      }
    });
  
    return () => unsubscribe();
  }, []);

  return (
    <div className="app">
      {!user ? (
        <LoginForm onLoginSuccess={() => {}} />
      ) : (
        <div className="forms-container">
          <section className="form-section">
            <h2>Create New Song</h2>
            <SongForm />
          </section>

          <section className="form-section">
            <h2>Song Occurrences</h2>
            <OccurrenceForm />
          </section>
        </div>
      )}
    </div>
  );
}