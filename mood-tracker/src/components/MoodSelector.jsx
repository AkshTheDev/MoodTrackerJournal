import React, { useCallback, useState } from 'react';
import './MoodSelector.css';

const MOODS = [
  { emoji: '😄', name: 'Happy', color: 'var(--happy-color)' },
  { emoji: '😐', name: 'Neutral', color: 'var(--neutral-color)' },
  { emoji: '😢', name: 'Sad', color: 'var(--sad-color)' },
  { emoji: '😡', name: 'Angry', color: 'var(--angry-color)' }
];

function MoodSelector({ selectedMood, onMoodSelect }) {
  const [intensity, setIntensity] = useState(5);

  const handleKeyPress = useCallback((event, mood) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      onMoodSelect({ ...mood, intensity });
    }
  }, [onMoodSelect, intensity]);

  const handleMoodClick = (mood) => {
    onMoodSelect({ ...mood, intensity });
  };

  return (
    <div className="mood-selector-container">
      <div className="mood-selector" role="radiogroup" aria-label="Select your mood">
        {MOODS.map((mood) => (
          <div
            key={mood.name}
            className={`mood-option ${selectedMood === mood.name ? 'selected' : ''}`}
            onClick={() => handleMoodClick(mood)}
            onKeyPress={(e) => handleKeyPress(e, mood)}
            role="radio"
            aria-checked={selectedMood === mood.name}
            tabIndex={0}
            style={{ 
              '--mood-color': mood.color,
              backgroundColor: selectedMood === mood.name ? mood.color : 'transparent'
            }}
          >
            <span className="mood-emoji" role="img" aria-label={mood.name}>
              {mood.emoji}
            </span>
            <span className="mood-label">{mood.name}</span>
          </div>
        ))}
      </div>
      
      {selectedMood && (
        <div className="intensity-selector">
          <label htmlFor="intensity">Intensity: {intensity}/10</label>
          <input
            type="range"
            id="intensity"
            min="1"
            max="10"
            value={intensity}
            onChange={(e) => setIntensity(parseInt(e.target.value))}
            className="intensity-slider"
          />
        </div>
      )}
    </div>
  );
}

export default MoodSelector;