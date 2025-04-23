import React from 'react';
import './JournalEntryList.css';

function JournalEntryList({ entries, onEntryClick, onDeleteEntry }) {
  const groupEntriesByMonth = (entries) => {
    return entries.reduce((groups, entry) => {
      const date = new Date(entry.date);
      const monthKey = `${date.getFullYear()}-${date.getMonth() + 1}`;
      if (!groups[monthKey]) {
        groups[monthKey] = [];
      }
      groups[monthKey].push(entry);
      return groups;
    }, {});
  };

  const formatMonthYear = (monthKey) => {
    const [year, month] = monthKey.split('-');
    return new Date(year, month - 1).toLocaleString('default', {
      month: 'long',
      year: 'numeric'
    });
  };

  const getMoodEmoji = (mood) => {
    switch (mood) {
      case 'Happy': return '😄';
      case 'Neutral': return '😐';
      case 'Sad': return '😢';
      case 'Angry': return '😡';
      default: return '🤔';
    }
  };

  const groupedEntries = groupEntriesByMonth(entries);

  return (
    <div className="journal-entry-list">
      {Object.entries(groupedEntries)
        .sort(([a], [b]) => b.localeCompare(a))
        .map(([monthKey, monthEntries]) => (
          <div key={monthKey} className="month-group">
            <h3 className="month-header">{formatMonthYear(monthKey)}</h3>
            <div className="entries-grid">
              {monthEntries
                .sort((a, b) => new Date(b.date) - new Date(a.date))
                .map(entry => (
                  <article
                    key={entry.id}
                    className="entry-card"
                    onClick={() => onEntryClick(entry)}
                  >
                    <div className="entry-header">
                      <span className="entry-date">
                        {new Date(entry.date).toLocaleDateString()}
                      </span>
                      <span className="entry-mood">
                        {getMoodEmoji(entry.mood)}
                      </span>
                    </div>
                    
                    <h4 className="entry-title">{entry.title}</h4>
                    
                    <p className="entry-preview">
                      {entry.content.length > 150
                        ? `${entry.content.substring(0, 150)}...`
                        : entry.content}
                    </p>

                    {entry.tags && entry.tags.length > 0 && (
                      <div className="entry-tags">
                        {entry.tags.map(tag => (
                          <span key={tag} className="tag">{tag}</span>
                        ))}
                      </div>
                    )}

                    <button
                      className="delete-button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onDeleteEntry(entry.id);
                      }}
                    >
                      Delete
                    </button>
                  </article>
                ))}
            </div>
          </div>
        ))}
    </div>
  );
}

export default JournalEntryList;