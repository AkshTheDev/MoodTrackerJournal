import React, { useState, useEffect } from 'react';
import { MoodLineChart, MoodDistributionChart, processMoodData } from '../components/MoodChart';
import LoadingSpinner from '../components/LoadingSpinner';
import { getMoodEntries } from '../lib/SupabaseClient';
import { useAuth } from '../context/AuthContext';
import style from './HistoryLayout.module.css';

const TIME_RANGES = {
  '1W': 7,
  '1M': 30,
  '3M': 90,
  '6M': 180,
  '1Y': 365
};

function HistoryLayout() {
  const [timeRange, setTimeRange] = useState('1M');
  const [moodEntries, setMoodEntries] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedActivity, setSelectedActivity] = useState('all');
  const { user } = useAuth();

  useEffect(() => {
    const fetchMoodData = async () => {
      setIsLoading(true);
      try {
        const endDate = new Date();
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - TIME_RANGES[timeRange]);

        const entries = await getMoodEntries(
          startDate.toISOString(),
          endDate.toISOString(),
          user.id
        );

        setMoodEntries(entries);
      } catch (error) {
        console.error('Error fetching mood data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchMoodData();
  }, [timeRange, user.id]);

  if (isLoading) {
    return <LoadingSpinner />;
  }

  const filteredEntries = selectedActivity === 'all'
    ? moodEntries
    : moodEntries.filter(entry => 
        entry.activities?.includes(selectedActivity)
      );

  const { lineChartData, doughnutChartData } = processMoodData(filteredEntries);

  // Calculate activity correlations
  const activityList = [...new Set(
    moodEntries.flatMap(entry => entry.activities || [])
  )];

  const activityStats = activityList.reduce((acc, activity) => {
    const entriesWithActivity = moodEntries.filter(
      entry => entry.activities?.includes(activity)
    );
    
    const totalIntensity = entriesWithActivity.reduce(
      (sum, entry) => sum + (entry.intensity || 5), 0
    );
    const averageIntensity = (totalIntensity / entriesWithActivity.length) || 5;

    const moodDistribution = entriesWithActivity.reduce((dist, entry) => {
      const mood = entry.mood || 'Neutral';
      dist[mood] = (dist[mood] || 0) + 1;
      return dist;
    }, {});

    acc[activity] = {
      count: entriesWithActivity.length,
      averageIntensity: Number(averageIntensity.toFixed(1)),
      moodDistribution
    };
    return acc;
  }, {});

  return (
    <div className={style.container}>
      <header className={style.header}>
        <h1>Mood History</h1>
        <div className={style.filters}>
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            className={style.select}
          >
            <option value="1W">Last Week</option>
            <option value="1M">Last Month</option>
            <option value="3M">Last 3 Months</option>
            <option value="6M">Last 6 Months</option>
            <option value="1Y">Last Year</option>
          </select>

          <select
            value={selectedActivity}
            onChange={(e) => setSelectedActivity(e.target.value)}
            className={style.select}
          >
            <option value="all">All Activities</option>
            {activityList.map(activity => (
              <option key={activity} value={activity}>
                {activity}
              </option>
            ))}
          </select>
        </div>
      </header>

      <div className={style.charts}>
        <div className={style.chartCard}>
          <h3>Mood Over Time</h3>
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
      </div>

      <section className={style.insights}>
        <h2>Activity Insights</h2>
        <div className={style.activityGrid}>
          {Object.entries(activityStats).map(([activity, stats]) => (
            <div key={activity} className={style.activityCard}>
              <h4>{activity}</h4>
              <div className={style.activityStats}>
                <p>Times recorded: {stats.count}</p>
                <p>Average intensity: {stats.averageIntensity.toFixed(1)}/10</p>
                <div className={style.moodBars}>
                  {Object.entries(stats.moodDistribution).map(([mood, count]) => (
                    <div
                      key={mood}
                      className={style.moodBar}
                      style={{
                        width: `${(count / stats.count) * 100}%`,
                        backgroundColor: 
                          mood === 'Happy' ? 'var(--happy-color)' :
                          mood === 'Neutral' ? 'var(--neutral-color)' :
                          mood === 'Sad' ? 'var(--sad-color)' :
                          'var(--angry-color)'
                      }}
                      title={`${mood}: ${count} times`}
                    />
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className={style.entries}>
        <h2>Recent Entries</h2>
        <div className={style.entriesGrid}>
          {filteredEntries.slice(0, 10).map(entry => (
            <div key={entry.id} className={style.entryCard}>
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
              {entry.activities && (
                <div className={style.entryActivities}>
                  {entry.activities.map(activity => (
                    <span key={activity} className={style.activityTag}>
                      {activity}
                    </span>
                  ))}
                </div>
              )}
              {entry.note && <p className={style.entryNote}>{entry.note}</p>}
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

export default HistoryLayout;