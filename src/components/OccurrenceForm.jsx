import { useState, useEffect } from 'react';
import { createSongOccurrences, formatDate, validateOccurrence } from '../api';
import { auth } from '../firebase';

export function OccurrenceForm({ songs }) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [occurrences, setOccurrences] = useState([
    { id: Date.now(), songId: '', date: '', service: 'AM', closerFlag: false }
  ]);

  useEffect(() => {
    setLoading(false);
  }, [songs]);

  const handleAddRow = () => {
    const firstRow = occurrences[0];
    setOccurrences([
      ...occurrences,
      { id: Date.now(), songId: '', date: firstRow.date, service: firstRow.service, closerFlag: false }
    ]);
  };

  const handleRemoveRow = (id) => {
    setOccurrences(occurrences.filter(occurrence => occurrence.id !== id));
  };

  const handleChange = (id, field, value) => {
    setOccurrences(occurrences.map(occurrence => occurrence.id === id ? { ...occurrence, [field]: value } : occurrence));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      occurrences.forEach(validateOccurrence);
      const formattedOccurrences = occurrences.map(occurrence => ({
        ...occurrence,
        date: formatDate(new Date(occurrence.date)),
        closer_flag: occurrence.closerFlag
      }));
      const songId = occurrences[0].songId;
      await createSongOccurrences(songId, formattedOccurrences);
      setSuccess('Song occurrences created successfully!');
      setOccurrences([{ id: Date.now(), songId: '', date: '', service: 'AM', closerFlag: false }]);
    } catch (err) {
      console.error('Error creating song occurrences:', err);
      setError(err.message);
    }
  };

  return (
    <div className="occurrence-form-container">
      <h1>Create Song Occurrence</h1>
      <form onSubmit={handleSubmit} className="occurrence-form">
        {occurrences.map((occurrence, index) => (
          <div key={occurrence.id} className="occurrence-row">
            <div className="form-group">
              <label htmlFor={`songId-${occurrence.id}`}>Song Title</label>
              {loading ? (
                <p>Loading song titles...</p>
              ) : (
                <select
                  id={`songId-${occurrence.id}`}
                  value={occurrence.songId}
                  onChange={(e) => handleChange(occurrence.id, 'songId', e.target.value)}
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
              <label htmlFor={`date-${occurrence.id}`}>Date</label>
              <input
                type="date"
                id={`date-${occurrence.id}`}
                value={occurrence.date}
                onChange={(e) => handleChange(occurrence.id, 'date', e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor={`service-${occurrence.id}`}>Service</label>
              <select
                id={`service-${occurrence.id}`}
                value={occurrence.service}
                onChange={(e) => handleChange(occurrence.id, 'service', e.target.value)}
                required
              >
                <option value="AM">AM</option>
                <option value="PM">PM</option>
              </select>
            </div>

            <div className="form-group closer-flag">
              <label>
                <input
                  type="checkbox"
                  checked={occurrence.closerFlag}
                  onChange={(e) => handleChange(occurrence.id, 'closerFlag', e.target.checked)}
                />
                Closer Flag
              </label>
            </div>

            {index > 0 && (
              <button type="button" className="remove-row" onClick={() => handleRemoveRow(occurrence.id)}>Remove</button>
            )}
          </div>
        ))}

        <button type="button" onClick={handleAddRow}>Add Row</button>

        {error && <div className="error-message">{error}</div>}
        {success && <div className="success-message">{success}</div>}

        <button type="submit">Create Occurrences</button>
      </form>
    </div>
  );
}