import React, { useState, useEffect } from 'react';
import { MoodLineChart, MoodDistributionChart, processMoodData } from '../components/MoodChart';
import MoodSelector from '../components/MoodSelector';
import LoadingSpinner from '../components/LoadingSpinner';
import { getDailyQuote } from '../api/quoteService';
import { saveMoodEntry, getMoodEntries } from '../lib/SupabaseClient';
import { useAuth } from '../context/AuthContext';
import style from './HomeLayout.module.css';

function HomeLayout() {
  const [selectedMood, setSelectedMood] = useState(null);
  const [journalEntry, setJournalEntry] = useState('');
  const [quote, setQuote] = useState(null);
  const [recentMoods, setRecentMoods] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Get last 7 days data in ISO format with timezone
        const endDate = new Date();
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - 7);

        // Check if user exists before making API calls
        if (!user) {
          setIsLoading(false);
          return;
        }

        const [quoteData, moodData] = await Promise.all([
          getDailyQuote(),
          getMoodEntries(
            startDate.toISOString(),
            endDate.toISOString(),
            user.id
          )
        ]);
        
        setQuote(quoteData);
        setRecentMoods(moodData);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [user]);

  const handleMoodSelect = (mood) => {
    setSelectedMood(mood.name);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedMood) return;

    setIsSaving(true);
    try {
      const entry = await saveMoodEntry({
        mood: selectedMood,
        note: journalEntry,
        date: new Date().toISOString(),
        user_id: user.id,
        activities: [],
        intensity: 5 // Default intensity
      });

      setRecentMoods(prev => [entry[0], ...prev]);
      setSelectedMood(null);
      setJournalEntry('');
    } catch (error) {
      console.error('Error saving mood:', error);
      alert('Failed to save your mood. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return <LoadingSpinner />;
  }

  // Handle case where recentMoods is undefined
  const { lineChartData, doughnutChartData } = recentMoods && recentMoods.length 
    ? processMoodData(recentMoods) 
    : { 
        lineChartData: { 
          labels: [], 
          datasets: [{ label: 'Mood Level', data: [], intensity: [], borderColor: 'rgb(174, 213, 129)', backgroundColor: 'rgba(174, 213, 129, 0.2)', tension: 0.3 }] 
        }, 
        doughnutChartData: { 
          labels: ['Happy', 'Neutral', 'Sad', 'Angry'], 
          datasets: [{ data: [0, 0, 0, 0], backgroundColor: ['#FFF9C4', '#C8E6C9', '#B3E5FC', '#FFCDD2'] }] 
        } 
      };

  return (
    <div className={style.container}>
      <section className={style.quoteSection}>
        <blockquote className={style.quote}>
          {quote?.content || "Every day is a new beginning."}
          <footer className={style.quoteAuthor}>— {quote?.author || "Unknown"}</footer>
        </blockquote>
      </section>

      <section className={style.moodSection}>
        <h2>How are you feeling?</h2>
        <MoodSelector 
          selectedMood={selectedMood} 
          onMoodSelect={handleMoodSelect} 
        />
        
        <form onSubmit={handleSubmit} className={style.moodForm}>
          <textarea
            value={journalEntry}
            onChange={(e) => setJournalEntry(e.target.value)}
            placeholder="What's on your mind?"
            className={style.textArea}
          />
          <button 
            type="submit" 
            className={style.submitButton}
            disabled={!selectedMood || isSaving}
          >
            {isSaving ? 'Saving...' : 'Save Entry'}
          </button>
        </form>
      </section>

      <section className={style.chartsSection}>
        <div className={style.chartCard}>
          <h3>Weekly Overview</h3>
          <div className={style.chart}>
            <MoodLineChart data={lineChartData} />
          </div>
        </div>

        <div className={style.chartCard}>
          <h3>Mood Distribution</h3>
          <div className={style.chart}>
            <MoodDistributionChart data={doughnutChartData} />
          </div>
        </div>
      </section>

      <section className={style.recentSection}>
        <h3>Recent Entries</h3>
        <div className={style.recentEntries}>
          {recentMoods.slice(0, 5).map((entry) => (
            <div key={entry.id || `${entry.date}-${entry.mood}`} className={style.entryCard}>
              <div className={style.entryHeader}>
                <span className={style.entryDate}>
                  {new Date(entry.date).toLocaleDateString()}
                </span>
                <span className={style.entryMood}>
                  {entry.mood === 'Happy' ? '😄' :
                   entry.mood === 'Neutral' ? '😐' :
                   entry.mood === 'Sad' ? '😢' : '😡'}
                </span>
              </div>
              {entry.note && <p className={style.entryNote}>{entry.note}</p>}
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

export default HomeLayout;