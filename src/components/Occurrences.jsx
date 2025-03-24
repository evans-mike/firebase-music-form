import { useState, useEffect } from 'react';
import { getOccurrences, deleteOccurrence } from '../api';

export function LoadOccurrences() {
  const [occurrences, setOccurrences] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [lastVisible, setLastVisible] = useState(null);
  const [loadingMore, setLoadingMore] = useState(false);

  useEffect(() => {
    fetchOccurrences();
  }, []);

  const fetchOccurrences = async (loadMore = false) => {
    try {
      if (loadMore) {
        setLoadingMore(true);
      } else {
        setLoading(true);
      }

      const { occurrences: newOccurrences, lastVisible: newLastVisible } = await getOccurrences(lastVisible);
      setOccurrences(loadMore ? [...occurrences, ...newOccurrences] : newOccurrences);
      setLastVisible(newLastVisible);
    } catch (err) {
      console.error('Error fetching occurrences:', err);
      setError('Failed to load occurrences.');
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  const handleDelete = async (songId, occurrenceId) => {
    const confirmed = window.confirm('Are you sure you want to delete this occurrence?');
    if (!confirmed) return;

    try {
      await deleteOccurrence(songId, occurrenceId);
      const updatedOccurrences = occurrences.filter(occurrence => occurrence.id !== occurrenceId);
      setOccurrences(updatedOccurrences);
    } catch (err) {
      console.error('Error deleting occurrence:', err);
      setError('Failed to delete occurrence.');
    }
  };

  const formatDate = (timestamp) => {
    if (!timestamp) return '';
    // Handle Firestore Timestamp objects
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toISOString().split('T')[0];
  };

  if (loading && !loadingMore) {
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
              <td>{formatDate(occurrence.date)}</td>
              <td>{occurrence.songTitle}</td>
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
      {lastVisible && (
        <button onClick={() => fetchOccurrences(true)} className="load-more-button" disabled={loadingMore}>
          {loadingMore ? 'Loading...' : 'Load More'}
        </button>
      )}
    </div>
  );
}