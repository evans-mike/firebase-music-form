import { useState, useEffect } from 'react';
import { getOccurrences, deleteOccurrence } from '../api';

export function LoadOccurrences() {
  const [occurrences, setOccurrences] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchOccurrences = async () => {
      try {
        const occurrencesList = await getOccurrences();
        setOccurrences(occurrencesList);
      } catch (err) {
        console.error('Error fetching occurrences:', err);
        setError('Failed to load occurrences.');
      } finally {
        setLoading(false);
      }
    };

    fetchOccurrences();
  }, []);

  const handleDelete = async (songId, occurrenceId) => {
    const confirmed = window.confirm('Are you sure you want to delete this occurrence?');
    if (!confirmed) return;

    try {
      await deleteOccurrence(songId, occurrenceId);
      setOccurrences(occurrences.filter(occurrence => occurrence.id !== occurrenceId));
    } catch (err) {
      console.error('Error deleting occurrence:', err);
      setError('Failed to delete occurrence.');
    }
  };

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  if (error) {
    return <div className="error-message">{error}</div>;
  }

  return (
    <div className="occurrences-container">
      <h1>Song Occurrences</h1>
      <table className="occurrences-table">
        <thead>
          <tr>
            <th>Date</th>
            <th>Title</th>
            <th>Service</th>
            <th>Closer Flag</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {occurrences.map(occurrence => (
            <tr key={occurrence.id}>
              <td>{occurrence.date}</td>
              <td>{occurrence.title}</td>
              <td>{occurrence.service}</td>
              <td>{occurrence.closer_flag ? 'Yes' : 'No'}</td>
              <td>
                <button onClick={() => handleDelete(occurrence.songId, occurrence.id)} className="delete-button">
                  X
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}