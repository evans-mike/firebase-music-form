import { useState, useEffect } from 'react';
import { createSongOccurrences, getSongTitles, formatDate, validateOccurrence } from '../api';
import { auth } from '../firebase';

export function OccurrenceForm() {
  const [date, setDate] = useState('');
  const [service, setService] = useState('AM');
  const [closerFlag, setCloserFlag] = useState(false);
  const [songId, setSongId] = useState('');
  const [songs, setSongs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    const fetchSongs = async () => {
      try {
        const songsList = await getSongTitles();
        setSongs(songsList);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching song titles:', error);
        setError('Failed to load song titles');
        setLoading(false);
      }
    };

    fetchSongs();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      validateOccurrence({ songId, date });
      const occurrence = {
        songId,
        date: formatDate(new Date(date)),
        service,
        closer_flag: closerFlag
      };
      await createSongOccurrences([occurrence]);
      setSuccess('Song occurrence created successfully!');
      setDate('');
      setService('AM');
      setCloserFlag(false);
      setSongId('');
    } catch (err) {
      console.error('Error creating song occurrence:', err);
      setError(err.message);
    }
  };

  return (
    <div className="occurrence-form-container">
      <h1>Create Song Occurrence</h1>
      <form onSubmit={handleSubmit} className="occurrence-form">
        <div className="form-group">
          <label htmlFor="songId">Song Title</label>
          {loading ? (
            <p>Loading song titles...</p>
          ) : (
            <select
              id="songId"
              value={songId}
              onChange={(e) => setSongId(e.target.value)}
              required
            >
              <option value="" disabled>Select a song</option>
              {songs.map((song) => (
                <option key={song.id} value={song.id}>{song.title}</option>
              ))}
            </select>
          )}
        </div>

        <div className="form-group">
          <label htmlFor="date">Date</label>
          <input
            type="date"
            id="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="service">Service</label>
          <select
            id="service"
            value={service}
            onChange={(e) => setService(e.target.value)}
            required
          >
            <option value="AM">AM</option>
            <option value="PM">PM</option>
          </select>
        </div>

        <div className="form-group">
          <label>
            <input
              type="checkbox"
              checked={closerFlag}
              onChange={(e) => setCloserFlag(e.target.checked)}
            />
            Closer Flag
          </label>
        </div>

        {error && <div className="error-message">{error}</div>}
        {success && <div className="success-message">{success}</div>}

        <button type="submit">Create Occurrence</button>
      </form>
    </div>
  );
}