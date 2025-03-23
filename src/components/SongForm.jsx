import { useState } from 'react';
import { createSong } from '../api';

export function SongForm() {
  const [title, setTitle] = useState('');
  const [attributes, setAttributes] = useState('');
  const [authorGroup, setAuthorGroup] = useState('');
  const [authors, setAuthors] = useState('');
  const [year, setYear] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      const result = await createSong(title, attributes, authorGroup, authors, year);
      setSuccess(result.message);
      setTitle('');
      setAttributes('');
      setAuthorGroup('');
      setAuthors('');
      setYear('');
    } catch (err) {
      console.error('Error creating song:', err);
      setError(err.message);
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
          <label htmlFor="authors">Authors</label>
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

        <button type="submit">Create Song</button>
      </form>
    </div>
  );
}