import { useState } from 'react';
import { createSong } from '../api';

export function SongForm({ user, onSongCreated }) {
  const initialFormState = {
    title: '',
    attributes: '',
    authorGroup: '',
    authors: '',
    year: ''
  };

  const [formState, setFormState] = useState(initialFormState);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormState({
      ...formState,
      [name]: value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    
    const { title, attributes, authorGroup, authors, year } = formState;

    if (!title) {
      setError('Title is required');
      return;
    }

    const songData = {
      title,
      attributes: attributes.split(',').map(attr => attr.trim()),
      author_group: authorGroup,
      authors: authors.split(',').map(author => author.trim()),
      year: parseInt(year, 10),
      createdAt: new Date(),
      createdBy: user.uid,
      updatedAt: new Date(),
      updatedBy: user.uid
    };

    try {
      await createSong(songData);
      setSuccess('Song created successfully!');
      setFormState(initialFormState);
      onSongCreated();
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
            name="title"
            value={formState.title}
            onChange={handleChange}
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="attributes">Attributes (comma separated)</label>
          <input
            type="text"
            id="attributes"
            name="attributes"
            value={formState.attributes}
            onChange={handleChange}
          />
        </div>
        <div className="form-group">
          <label htmlFor="authorGroup">Author Group</label>
          <input
            type="text"
            id="authorGroup"
            name="authorGroup"
            value={formState.authorGroup}
            onChange={handleChange}
          />
        </div>
        <div className="form-group">
          <label htmlFor="authors">Authors (comma separated)</label>
          <input
            type="text"
            id="authors"
            name="authors"
            value={formState.authors}
            onChange={handleChange}
          />
        </div>
        <div className="form-group">
          <label htmlFor="year">Year</label>
          <input
            type="number"
            id="year"
            name="year"
            value={formState.year}
            onChange={handleChange}
          />
        </div>

        {error && <div className="error-message">{error}</div>}
        {success && <div className="success-message">{success}</div>}

        <button type="submit">Create Song</button>
      </form>
    </div>
  );
}