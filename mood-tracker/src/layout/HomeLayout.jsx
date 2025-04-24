import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import MoodSelector from '../components/MoodSelector';
import { saveMoodEntry } from '../lib/SupabaseClient';
import { useAuth } from '../context/AuthContext';
import { getRandomQuote } from '../api/quoteService';
import style from './HomeLayout.module.css';

const ACTIVITIES = [
  'Exercise', 'Work', 'Social', 'Family',
  'Hobby', 'Reading', 'Gaming', 'Music',
  'Nature', 'Shopping', 'Cooking', 'Movies',
  'Learning', 'Travel', 'Meditation', 'Other'
];

function HomeLayout() {
  const [selectedMood, setSelectedMood] = useState(null);
  const [intensity, setIntensity] = useState(5);
  const [activities, setActivities] = useState([]);
  const [note, setNote] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [quote, setQuote] = useState({ content: '', author: '' });
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    const fetchQuote = async () => {
      const newQuote = await getRandomQuote();
      setQuote(newQuote);
    };
    fetchQuote();
  }, []);

  const handleMoodSelect = (mood) => {
    setSelectedMood(mood.name);
  };

  const toggleActivity = (activity) => {
    setActivities(prev => 
      prev.includes(activity)
        ? prev.filter(a => a !== activity)
        : [...prev, activity]
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedMood) return;

    setIsSubmitting(true);
    try {
      await saveMoodEntry({
        mood: selectedMood,
        intensity,
        activities,
        note,
        date: new Date().toISOString(),
        user_id: user.id
      });

      navigate('/history');
    } catch (error) {
      console.error('Error saving mood:', error);
      alert('Failed to save your mood. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className={style.container}>
      {quote.content && (
        <section className={style.quoteSection}>
          <blockquote className={style.quote}>
            {quote.content}
            <footer className={style.quoteAuthor}>— {quote.author}</footer>
          </blockquote>
        </section>
      )}

      <form onSubmit={handleSubmit} className={style.form}>
        <section className={style.section}>
          <h2>How are you feeling?</h2>
          <MoodSelector 
            selectedMood={selectedMood} 
            onMoodSelect={handleMoodSelect}
          />
        </section>

        {selectedMood && (
          <>
            <section className={style.section}>
              <h3>How intense is this feeling?</h3>
              <div className={style.intensitySlider}>
                <input
                  type="range"
                  min="1"
                  max="10"
                  value={intensity}
                  onChange={(e) => setIntensity(Number(e.target.value))}
                  className={style.slider}
                />
                <div className={style.sliderLabels}>
                  <span>Mild</span>
                  <span>Moderate</span>
                  <span>Strong</span>
                </div>
                <div className={style.intensityValue}>
                  {intensity}/10
                </div>
              </div>
            </section>

            <section className={style.section}>
              <h3>What have you been doing?</h3>
              <div className={style.activitiesGrid}>
                {ACTIVITIES.map(activity => (
                  <button
                    key={activity}
                    type="button"
                    className={`${style.activityButton} ${
                      activities.includes(activity) ? style.active : ''
                    }`}
                    onClick={() => toggleActivity(activity)}
                  >
                    {activity}
                  </button>
                ))}
              </div>
            </section>

            <section className={style.section}>
              <h3>Any additional thoughts?</h3>
              <textarea
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Write about your thoughts and feelings..."
                className={style.noteInput}
              />
            </section>

            <button 
              type="submit" 
              className={style.submitButton}
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Saving...' : 'Save Entry'}
            </button>
          </>
        )}
      </form>
    </div>
  );
}

export default HomeLayout;