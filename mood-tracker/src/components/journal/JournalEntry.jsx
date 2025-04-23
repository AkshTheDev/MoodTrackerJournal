import React, { useState } from 'react';
import './JournalEntry.css';

function JournalEntry({ entry, onSave, onCancel }) {
  const [title, setTitle] = useState(entry?.title || '');
  const [content, setContent] = useState(entry?.content || '');
  const [mood, setMood] = useState(entry?.mood || null);
  const [tags, setTags] = useState(entry?.tags || []);
  const [tagInput, setTagInput] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave({
      title,
      content,
      mood,
      tags,
      date: entry?.date || new Date().toISOString()
    });
  };

  const handleAddTag = (e) => {
    e.preventDefault();
    if (tagInput.trim() && !tags.includes(tagInput.trim())) {
      setTags([...tags, tagInput.trim()]);
      setTagInput('');
    }
  };

  const removeTag = (tagToRemove) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };

  return (
    <form className="journal-entry" onSubmit={handleSubmit}>
      <input
        type="text"
        className="title-input"
        placeholder="Entry Title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        required
      />

      <div className="mood-selector">
        <span>Current Mood:</span>
        <div className="mood-options">
          <button
            type="button"
            className={`mood-button ${mood === 'Happy' ? 'selected' : ''}`}
            onClick={() => setMood('Happy')}
          >
            😄 Happy
          </button>
          <button
            type="button"
            className={`mood-button ${mood === 'Neutral' ? 'selected' : ''}`}
            onClick={() => setMood('Neutral')}
          >
            😐 Neutral
          </button>
          <button
            type="button"
            className={`mood-button ${mood === 'Sad' ? 'selected' : ''}`}
            onClick={() => setMood('Sad')}
          >
            😢 Sad
          </button>
          <button
            type="button"
            className={`mood-button ${mood === 'Angry' ? 'selected' : ''}`}
            onClick={() => setMood('Angry')}
          >
            😡 Angry
          </button>
        </div>
      </div>

      <textarea
        className="content-input"
        placeholder="Write your thoughts..."
        value={content}
        onChange={(e) => setContent(e.target.value)}
        required
      />

      <div className="tags-section">
        <div className="tags-input">
          <input
            type="text"
            placeholder="Add tags..."
            value={tagInput}
            onChange={(e) => setTagInput(e.target.value)}
            onKeyPress={(e) => {
              if (e.key === 'Enter') {
                handleAddTag(e);
              }
            }}
          />
          <button type="button" onClick={handleAddTag}>Add</button>
        </div>
        <div className="tags-list">
          {tags.map(tag => (
            <span key={tag} className="tag">
              {tag}
              <button type="button" onClick={() => removeTag(tag)}>&times;</button>
            </span>
          ))}
        </div>
      </div>

      <div className="actions">
        <button type="button" className="cancel-button" onClick={onCancel}>
          Cancel
        </button>
        <button type="submit" className="save-button">
          Save Entry
        </button>
      </div>
    </form>
  );
}

export default JournalEntry;