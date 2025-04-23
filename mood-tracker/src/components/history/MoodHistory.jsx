import React from 'react';
import { MoodLineChart, MoodDistributionChart } from '../MoodChart';
import './MoodHistory.css';

function MoodHistory({ moodEntries }) {
  const groupedByDate = moodEntries.reduce((acc, entry) => {
    const date = new Date(entry.date).toLocaleDateString();
    if (!acc[date]) {
      acc[date] = [];
    }
    acc[date].push(entry);
    return acc;
  }, {});

  return (
    <div className="mood-history">
      <section className="charts-section">
        <div className="chart-card">
          <h3>Mood Trends</h3>
          <div className="chart">
            <MoodLineChart data={moodEntries} />
          </div>
        </div>
        <div className="chart-card">
          <h3>Mood Distribution</h3>
          <div className="chart">
            <MoodDistributionChart data={moodEntries} />
          </div>
        </div>
      </section>

      <section className="entries-section">
        <h3>Your Mood Journal</h3>
        {Object.entries(groupedByDate).map(([date, entries]) => (
          <div key={date} className="date-group">
            <h4 className="date-header">{date}</h4>
            <div className="entries-grid">
              {entries.map((entry) => (
                <div key={entry.id} className="entry-card">
                  <div className="entry-header">
                    <span className="entry-time">
                      {new Date(entry.date).toLocaleTimeString()}
                    </span>
                    <span className="entry-mood">
                      {entry.mood === 'Happy' ? '😄' :
                       entry.mood === 'Neutral' ? '😐' :
                       entry.mood === 'Sad' ? '😢' : '😡'}
                    </span>
                  </div>
                  
                  <div className="entry-intensity">
                    Intensity: {entry.intensity}/10
                  </div>

                  {entry.activities && entry.activities.length > 0 && (
                    <div className="entry-activities">
                      {entry.activities.map(activity => (
                        <span key={activity} className="activity-tag">
                          {activity}
                        </span>
                      ))}
                    </div>
                  )}

                  {entry.note && (
                    <p className="entry-note">{entry.note}</p>
                  )}
                </div>
              ))}
            </div>
          </div>
        ))}
      </section>
    </div>
  );
}

export default MoodHistory;