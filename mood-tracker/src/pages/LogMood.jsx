import React from 'react';
import MoodEntry from '../components/logmood/MoodEntry';
import { supabase } from '../lib/SupabaseClient';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

function LogMood() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const handleSubmitMood = async (moodData) => {
    try {
      const { error } = await supabase
        .from('mood_entries')
        .insert([
          {
            user_id: user.id,
            mood: moodData.mood,
            intensity: moodData.intensity,
            activities: moodData.activities,
            note: moodData.note,
            date: moodData.date // Changed from created_at to date for consistency
          }
        ]);

      if (error) throw error;
      
      navigate('/history');
    } catch (error) {
      console.error('Error submitting mood:', error);
      alert('Failed to save mood entry. Please try again.');
    }
  };

  return (
    <div className="log-mood-page">
      <MoodEntry onSubmit={handleSubmitMood} />
    </div>
  );
}

export default LogMood;