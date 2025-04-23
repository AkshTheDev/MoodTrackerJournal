import React, { useState, useEffect } from 'react';
import style from './JournalLayout.module.css';
import { supabase, saveJournalEntry, toggleJournalPin, deleteJournalEntry } from '../lib/SupabaseClient';
import { useAuth } from '../context/AuthContext';
import LoadingSpinner from '../components/LoadingSpinner';

function JournalLayout() {
  const [entries, setEntries] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newEntry, setNewEntry] = useState({ title: '', content: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const { user } = useAuth();

  useEffect(() => {
    fetchJournalEntries();
  }, []);

  const fetchJournalEntries = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('journal_entries')
        .select('*, mood_entries(*)')
        .eq('user_id', user.id)
        .order('is_pinned', { ascending: false })
        .order('created_at', { ascending: false });

      if (error) throw error;
      setEntries(data || []);
    } catch (error) {
      console.error('Error fetching journal entries:', error);
      alert('Failed to load journal entries. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!newEntry.title || !newEntry.content) {
      alert('Please fill in both title and content');
      return;
    }

    setIsSubmitting(true);
    try {
      const journalData = await saveJournalEntry({
        title: newEntry.title,
        content: newEntry.content,
        user_id: user.id
      });

      setEntries(prev => [journalData[0], ...prev]);
      setNewEntry({ title: '', content: '' });
      setIsModalOpen(false);
    } catch (error) {
      console.error('Error saving journal entry:', error);
      alert('Failed to save journal entry. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (entryId) => {
    try {
      await deleteJournalEntry(entryId);
      setEntries(prev => prev.filter(entry => entry.id !== entryId));
      setDeleteConfirm(null);
    } catch (error) {
      console.error('Error deleting entry:', error);
      alert('Failed to delete entry. Please try again.');
    }
  };

  const handleTogglePin = async (id, currentPinnedState) => {
    try {
      await toggleJournalPin(id, !currentPinnedState);
      setEntries(prev => 
        prev.map(entry => 
          entry.id === id 
            ? { ...entry, is_pinned: !currentPinnedState }
            : entry
        ).sort((a, b) => {
          if (a.is_pinned === b.is_pinned) {
            return new Date(b.created_at) - new Date(a.created_at);
          }
          return b.is_pinned - a.is_pinned;
        })
      );
    } catch (error) {
      console.error('Error toggling pin:', error);
      alert('Failed to update entry. Please try again.');
    }
  };

  if (isLoading) {
    return <LoadingSpinner />;
  }

  return (
    <div className={style.container}>
      <h2>Journal Entries</h2>

      <div className={style.journalList}>
        {entries.map(entry => (
          <div key={entry.id} className={style.journalCard}>
            <h3 className={style.journalTitle}>{entry.title}</h3>
            <div className={style.journalDate}>
              {new Date(entry.created_at).toLocaleDateString()}
            </div>
            <p className={style.journalContent}>{entry.content}</p>
            
            <button 
              className={`${style.pinButton} ${entry.is_pinned ? style.pinned : ''}`}
              onClick={() => handleTogglePin(entry.id, entry.is_pinned)}
            >
              📌
            </button>

            <button
              className={style.deleteButton}
              onClick={() => setDeleteConfirm(entry.id)}
              aria-label="Delete entry"
            >
              🗑️
            </button>

            {deleteConfirm === entry.id && (
              <div className={style.deleteConfirm}>
                <p>Are you sure you want to delete this entry?</p>
                <div className={style.deleteActions}>
                  <button 
                    onClick={() => handleDelete(entry.id)}
                    className={style.confirmDelete}
                  >
                    Delete
                  </button>
                  <button 
                    onClick={() => setDeleteConfirm(null)}
                    className={style.cancelDelete}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}

            {entry.mood_entries && (
              <div 
                className={style.moodTag}
                style={{ backgroundColor: 
                  entry.mood_entries.mood === 'Happy' ? 'var(--happy-color)' :
                  entry.mood_entries.mood === 'Neutral' ? 'var(--neutral-color)' :
                  entry.mood_entries.mood === 'Sad' ? 'var(--sad-color)' :
                  'var(--angry-color)'
                }}
              >
                {entry.mood_entries.mood === 'Happy' ? '😄' :
                 entry.mood_entries.mood === 'Neutral' ? '😐' :
                 entry.mood_entries.mood === 'Sad' ? '😢' : '😡'}
              </div>
            )}
          </div>
        ))}
      </div>

      <button 
        className={style.addButton}
        onClick={() => setIsModalOpen(true)}
        disabled={isSubmitting}
      >
        +
      </button>

      {isModalOpen && (
        <>
          <div className={style.modalOverlay} onClick={() => !isSubmitting && setIsModalOpen(false)} />
          <div className={style.modal}>
            <h3>New Journal Entry</h3>
            <form onSubmit={handleSubmit}>
              <input
                type="text"
                placeholder="Title"
                className={style.modalTitle}
                value={newEntry.title}
                onChange={e => setNewEntry(prev => ({ ...prev, title: e.target.value }))}
                disabled={isSubmitting}
              />
              <textarea
                placeholder="Write your thoughts..."
                className={style.modalContent}
                value={newEntry.content}
                onChange={e => setNewEntry(prev => ({ ...prev, content: e.target.value }))}
                disabled={isSubmitting}
              />
              <div className={style.modalActions}>
                <button 
                  type="button" 
                  onClick={() => setIsModalOpen(false)}
                  className={style.cancelButton}
                  disabled={isSubmitting}
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className={style.submitButton}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'Saving...' : 'Save Entry'}
                </button>
              </div>
            </form>
          </div>
        </>
      )}
    </div>
  );
}

export default JournalLayout;