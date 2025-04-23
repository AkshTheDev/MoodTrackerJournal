import React, { useState } from 'react';
import './MoodEntry.css';

const MOODS = [
  { label: '😊 Happy', value: 'happy' },
  { label: '😌 Calm', value: 'calm' },
  { label: '😔 Sad', value: 'sad' },
  { label: '😡 Angry', value: 'angry' },
  { label: '😰 Anxious', value: 'anxious' },
  { label: '😴 Tired', value: 'tired' }
];

const ACTIVITIES = [
  'Exercise', 'Work', 'Social', 'Family',
  'Hobby', 'Sleep', 'Food', 'Nature',
  'Reading', 'Music', 'Movies', 'Shopping'
];

function MoodEntry({ onSubmit }) {
  const [selectedMood, setSelectedMood] = useState('');
  const [intensity, setIntensity] = useState(5);
  const [selectedActivities, setSelectedActivities] = useState([]);
  const [note, setNote] = useState('');

  const handleMoodSelect = (mood) => {
    setSelectedMood(mood);
  };

  const handleActivityToggle = (activity) => {
    setSelectedActivities(prev =>
      prev.includes(activity)
        ? prev.filter(a => a !== activity)
        : [...prev, activity]
    );
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const moodData = {
      mood: selectedMood,
      intensity,
      activities: selectedActivities,
      note,
      date: new Date().toISOString()
    };
    onSubmit(moodData);
  };

  return (
    <form className="mood-entry" onSubmit={handleSubmit}>
      <div className="section">
        <h2>How are you feeling?</h2>
        <div className="mood-buttons">
          {MOODS.map(mood => (
            <button
              key={mood.value}
              type="button"
              className={`mood-button ${selectedMood === mood.value ? 'selected' : ''}`}
              onClick={() => handleMoodSelect(mood.value)}
            >
              {mood.label}
            </button>
          ))}
        </div>
      </div>

      <div className="section">
        <h2>How intense is this feeling?</h2>
        <div className="intensity-slider">
          <input
            type="range"
            min="1"
            max="10"
            value={intensity}
            onChange={(e) => setIntensity(Number(e.target.value))}
            className="slider"
          />
          <div className="slider-labels">
            <span>Mild</span>
            <span>Moderate</span>
            <span>Strong</span>
          </div>
          <div className="intensity-value">
            Intensity: {intensity}
          </div>
        </div>
      </div>

      <div className="section">
        <h2>What have you been doing?</h2>
        <div className="activities-grid">
          {ACTIVITIES.map(activity => (
            <button
              key={activity}
              type="button"
              className={`activity-button ${selectedActivities.includes(activity) ? 'active' : ''}`}
              onClick={() => handleActivityToggle(activity)}
            >
              {activity}
            </button>
          ))}
        </div>
      </div>

      <div className="section">
        <h2>Add a note (optional)</h2>
        <textarea
          className="note-input"
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="How was your day? What made you feel this way?"
        />
      </div>

      <button
        type="submit"
        className="submit-button"
        disabled={!selectedMood}
      >
        Save Entry
      </button>
    </form>
  );
}

export default MoodEntry;