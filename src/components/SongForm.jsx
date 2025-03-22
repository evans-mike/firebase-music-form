import { useState } from 'react';
import { createSong } from '../api';
import { useAuth } from '../hooks/useAuth'; // Create this custom hook

export function SongForm() {
  const [title, setTitle] = useState('');
  const [status, setStatus] = useState({ loading: false, error: null, message: null });
  const { user } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!user) {
      setStatus({ error: 'Please log in to create songs' });
      return;
    }

    setStatus({ loading: true });

    try {
      const result = await createSong(title.trim());
      setStatus({ message: 'Song created successfully!' });
      setTitle('');
    } catch (err) {
      setStatus({ error: err.message });
    } finally {
      setStatus(prev => ({ ...prev, loading: false }));
    }
  };

  return (
    <form onSubmit={handleSubmit} className="song-form">
      <div className="form-group">
        <label htmlFor="song-title">Song Title</label>
        <input
          type="text"
          id="song-title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
          disabled={status.loading}
          placeholder="Enter song title"
        />
      </div>

      {status.error && (
        <div className="error-message">{status.error}</div>
      )}
      
      {status.message && (
        <div className="success-message">{status.message}</div>
      )}

      <button type="submit" disabled={status.loading || !title.trim()}>
        {status.loading ? 'Creating...' : 'Create Song'}
      </button>
    </form>
  );
}