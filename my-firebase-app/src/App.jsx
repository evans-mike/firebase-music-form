import { useState, useEffect } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from './firebase';
import { LoginForm } from './components/LoginForm.jsx';
import { SongForm } from './components/SongForm.jsx';
import { OccurrenceForm } from './components/OccurrenceForm.jsx';

export function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  if (loading) {
    return <div>Loading...</div>;
  }

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