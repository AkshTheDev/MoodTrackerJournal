import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/SupabaseClient';
import { useAuth } from '../context/AuthContext';
import MoodChart from '../components/MoodChart';
import './History.css';

function History() {
  const [moodEntries, setMoodEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    fetchMoodEntries();
  }, []);

  const fetchMoodEntries = async () => {
    try {
      const { data, error } = await supabase
        .from('mood_entries')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setMoodEntries(data);
    } catch (error) {
      console.error('Error fetching mood entries:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  if (loading) {
    return <div className="loading">Loading your mood history...</div>;
  }

  return (
    <div className="history-page">
      <section className="chart-section">
        <h2>Your Mood Patterns</h2>
        <MoodChart entries={moodEntries} />
      </section>

      <section className="entries-section">
        <h2>Recent Entries</h2>
        <div className="entries-list">
          {moodEntries.map((entry) => (
            <div key={entry.id} className="entry-card">
              <div className="entry-header">
                <span className="entry-mood">{entry.mood}</span>
                <span className="entry-date">{formatDate(entry.created_at)}</span>
              </div>
              <div className="entry-intensity">
                Intensity: {entry.intensity}/10
              </div>
              {entry.activities && entry.activities.length > 0 && (
                <div className="entry-activities">
                  <h4>Activities:</h4>
                  <div className="activities-tags">
                    {entry.activities.map((activity, index) => (
                      <span key={index} className="activity-tag">
                        {activity}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              {entry.note && (
                <div className="entry-note">
                  <h4>Note:</h4>
                  <p>{entry.note}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

export default History;