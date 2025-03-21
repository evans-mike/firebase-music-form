import { useState } from 'react';
import { submitOccurrences } from '../api';

export function OccurrenceForm() {
  const [occurrences, setOccurrences] = useState([createEmptyOccurrence()]);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  function createEmptyOccurrence() {
    return {
      date: '',
      title: '',
      closer_flag: false,
      service: 'AM'
    };
  }

  const addRow = () => {
    setOccurrences([...occurrences, createEmptyOccurrence()]);
  };

  const removeRow = (index) => {
    setOccurrences(occurrences.filter((_, i) => i !== index));
  };

  const updateOccurrence = (index, field, value) => {
    const updatedOccurrences = [...occurrences];
    updatedOccurrences[index] = {
      ...updatedOccurrences[index],
      [field]: value
    };
    setOccurrences(updatedOccurrences);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    setLoading(true);

    try {
      const result = await submitOccurrences(occurrences);
      setMessage(result.data.message);
      setOccurrences([createEmptyOccurrence()]); // Reset form on success
    } catch (err) {
      setMessage(`Error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="occurrence-form">
      <div className="occurrences-container">
        {occurrences.map((occurrence, index) => (
          <div key={index} className="occurrence-row">
            <input
              type="date"
              value={occurrence.date}
              onChange={(e) => updateOccurrence(index, 'date', e.target.value)}
              required
            />

            <input
              type="text"
              value={occurrence.title}
              onChange={(e) => updateOccurrence(index, 'title', e.target.value)}
              placeholder="Song Title"
              required
            />

            <label className="closer-flag">
              <input
                type="checkbox"
                checked={occurrence.closer_flag}
                onChange={(e) => updateOccurrence(index, 'closer_flag', e.target.checked)}
              />
              Closer
            </label>

            <select
              value={occurrence.service}
              onChange={(e) => updateOccurrence(index, 'service', e.target.value)}
              required
            >
              <option value="AM">AM</option>
              <option value="PM">PM</option>
            </select>

            {occurrences.length > 1 && (
              <button
                type="button"
                onClick={() => removeRow(index)}
                className="remove-row"
              >
                Remove
              </button>
            )}
          </div>
        ))}
      </div>

      <div className="form-actions">
        <button type="button" onClick={addRow}>
          Add Row
        </button>

        <button type="submit" disabled={loading}>
          {loading ? 'Submitting...' : 'Submit Occurrences'}
        </button>
      </div>

      {message && (
        <div className={message.includes('Error') ? 'error-message' : 'success-message'}>
          {message}
        </div>
      )}
    </form>
  );
}