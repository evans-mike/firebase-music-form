import { useState } from 'react';
import { createSong } from '../api';

export function SongForm() {
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    setLoading(true);

    try {
      const result = await createSong(title);
      setMessage(result.data.message);
      setTitle(''); // Clear form on success
    } catch (err) {
      setMessage(`Error: ${err.message}`);
    } finally {
      setLoading(false);
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
          placeholder="Enter song title"
        />
      </div>

      {message && (
        <div className={message.includes('Error') ? 'error-message' : 'success-message'}>
          {message}
        </div>
      )}

      <button type="submit" disabled={loading}>
        {loading ? 'Creating...' : 'Create Song'}
      </button>
    </form>
  );
}