import { useState } from 'react';
import { createSong } from '../api';

export function SongForm({ user, onSongCreated }) {
  const [title, setTitle] = useState('');
  const [attributes, setAttributes] = useState('');
  const [authorGroup, setAuthorGroup] = useState('');
  const [authors, setAuthors] = useState('');
  const [year, setYear] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      await createSong({
        title,
        attributes: (attributes || '').split(',').map(attr => attr.trim()),
        author_group: authorGroup || null,
        authors: (authors || '').split(',').map(author => author.trim()),
        year: year ? parseInt(year, 10) : null,
        createdAt: new Date(),
        createdBy: user.email,
        updatedAt: new Date(),
        updatedBy: user.email
      });
      setSuccess('Song created successfully!');
      setTitle('');
      setAttributes('');
      setAuthorGroup('');
      setAuthors('');
      setYear('');
      onSongCreated?.(); // Call onSongCreated after a new song is created
    } catch (err) {
      console.error('Error creating song:', err);
      setError('Failed to create song');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="song-form-container">
      <h1>Create New Song</h1>
      <form onSubmit={handleSubmit} className="song-form">
        <div className="form-group">
          <label htmlFor="title">Title</label>
          <input
            type="text"
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="attributes">Attributes (comma-separated)</label>
          <input
            type="text"
            id="attributes"
            value={attributes}
            onChange={(e) => setAttributes(e.target.value)}
          />
        </div>

        <div className="form-group">
          <label htmlFor="authorGroup">Author Group</label>
          <input
            type="text"
            id="authorGroup"
            value={authorGroup}
            onChange={(e) => setAuthorGroup(e.target.value)}
          />
        </div>

        <div className="form-group">
          <label htmlFor="authors">Authors (comma-separated)</label>
          <input
            type="text"
            id="authors"
            value={authors}
            onChange={(e) => setAuthors(e.target.value)}
          />
        </div>

        <div className="form-group">
          <label htmlFor="year">Year</label>
          <input
            type="number"
            id="year"
            value={year}
            onChange={(e) => setYear(e.target.value)}
          />
        </div>

        {error && <div className="error-message">{error}</div>}
        {success && <div className="success-message">{success}</div>}

        <button type="submit" disabled={loading}>
          {loading ? 'Creating...' : 'Create Song'}
        </button>
      </form>
    </div>
  );
}