import React, { useState, useRef, useEffect } from 'react';
import style from './SettingsLayout.module.css';
import { useTheme } from '../hooks/useTheme';
import { useAuth } from '../context/AuthContext';
import { supabase, getUserProfile, updateUserProfile, uploadProfileImage } from '../lib/SupabaseClient';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

function SettingsLayout() {
  const { isDarkMode, toggleTheme } = useTheme();
  const { user, signOut } = useAuth();
  const [emailNotifications, setEmailNotifications] = useState(false);
  const [userName, setUserName] = useState('');
  const [profileImage, setProfileImage] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [remindTime, setRemindTime] = useState('20:00');
  const fileInputRef = useRef();

  useEffect(() => {
    fetchUserProfile();
  }, []);

  const fetchUserProfile = async () => {
    try {
      const profile = await getUserProfile(user.id);
      if (profile) {
        setUserName(profile.display_name || '');
        setProfileImage(profile.avatar_url);
        setEmailNotifications(profile.email_notifications || false);
        setRemindTime(profile.remind_time || '20:00');
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
    }
  };

  const handleImageUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    try {
      setIsSaving(true);
      
      // Validate file type
      const validTypes = ['image/jpeg', 'image/png', 'image/gif'];
      if (!validTypes.includes(file.type)) {
        throw new Error('Please upload a valid image file (JPEG, PNG, or GIF)');
      }

      // Validate file size (max 5MB)
      const maxSize = 5 * 1024 * 1024; // 5MB
      if (file.size > maxSize) {
        throw new Error('Image size should be less than 5MB');
      }
      
      // Use the new helper function to upload the image
      const result = await uploadProfileImage(file, user.id);
      
      if (!result.success) {
        throw new Error(result.message);
      }
      
      // Update the profile with the new image URL
      const updateResult = await updateUserProfile(user.id, { avatar_url: result.publicUrl });
      if (!updateResult) {
        throw new Error('Failed to update profile. Please try again.');
      }

      setProfileImage(result.publicUrl);
      alert('Profile image updated successfully!');
    } catch (error) {
      console.error('Error in handleImageUpload:', error);
      alert(error.message || 'An unexpected error occurred. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleNameSave = async () => {
    try {
      setIsSaving(true);
      await updateUserProfile(user.id, { display_name: userName });
      alert('Name updated successfully!');
    } catch (error) {
      alert('Failed to update name. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleNotificationToggle = async () => {
    try {
      setIsSaving(true);
      const newState = !emailNotifications;
      await updateUserProfile(user.id, { 
        email_notifications: newState,
        remind_time: remindTime 
      });
      setEmailNotifications(newState);
    } catch (error) {
      alert('Failed to update notification settings.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleExportData = async () => {
    try {
      setIsSaving(true);
      const { data: moodData, error: moodError } = await supabase
        .from('mood_entries')
        .select('*')
        .eq('user_id', user.id);
      
      const { data: journalData, error: journalError } = await supabase
        .from('journal_entries')
        .select('*')
        .eq('user_id', user.id);

      if (moodError || journalError) throw moodError || journalError;

      // Create PDF document
      const doc = new jsPDF();
      // Add autotable to document
      autoTable(doc, {});
      
      const userProfile = await getUserProfile(user.id);
      const userName = userProfile?.display_name || 'User';
      
      // Add title
      doc.setFontSize(22);
      doc.setTextColor(44, 62, 80);
      doc.text('MindScribe: Your Mood Journal', 105, 15, { align: 'center' });
      
      // Add user info
      doc.setFontSize(14);
      doc.setTextColor(52, 73, 94);
      doc.text(`Exported for: ${userName}`, 105, 25, { align: 'center' });
      doc.text(`Date: ${new Date().toLocaleDateString()}`, 105, 32, { align: 'center' });
      
      // Add mood entries section
      doc.setFontSize(18);
      doc.setTextColor(41, 128, 185);
      doc.text('Your Mood Entries', 14, 45);
      
      if (moodData && moodData.length > 0) {
        // Format mood data for table
        const moodTableData = moodData.map(entry => [
          new Date(entry.date).toLocaleDateString(),
          entry.mood,
          entry.intensity ? `${entry.intensity}/10` : 'N/A',
          entry.note || 'No notes'
        ]);
        
        // Add mood entries table
        autoTable(doc, {
          startY: 50,
          head: [['Date', 'Mood', 'Intensity', 'Notes']],
          body: moodTableData,
          theme: 'grid',
          headStyles: { 
            fillColor: [41, 128, 185],
            textColor: 255,
            fontStyle: 'bold'
          },
          alternateRowStyles: { fillColor: [240, 240, 240] },
          margin: { top: 50 }
        });
      } else {
        doc.setFontSize(12);
        doc.setTextColor(100, 100, 100);
        doc.text('No mood entries found.', 14, 55);
      }
      
      // Add journal entries section
      const currentY = doc.lastAutoTable ? doc.lastAutoTable.finalY + 20 : 60;
      
      // Check if we need a new page
      if (currentY > 240) {
        doc.addPage();
        doc.setFontSize(18);
        doc.setTextColor(41, 128, 185);
        doc.text('Your Journal Entries', 14, 20);
      } else {
        doc.setFontSize(18);
        doc.setTextColor(41, 128, 185);
        doc.text('Your Journal Entries', 14, currentY);
      }
      
      if (journalData && journalData.length > 0) {
        // Process each journal entry
        let y = doc.lastAutoTable ? doc.lastAutoTable.finalY + 30 : currentY + 10;
        
        for (const entry of journalData) {
          // Check if we need a new page
          if (y > 250) {
            doc.addPage();
            y = 20;
          }
          
          const date = new Date(entry.created_at).toLocaleDateString();
          doc.setFontSize(14);
          doc.setTextColor(52, 73, 94);
          doc.text(`${entry.title || 'Untitled'} (${date})`, 14, y);
          
          doc.setFontSize(12);
          doc.setTextColor(80, 80, 80);
          
          // Split long content into multiple lines
          const textLines = doc.splitTextToSize(entry.content || 'No content', 180);
          
          // Check if remaining space is enough for content
          if (y + 8 + (textLines.length * 7) > 280) {
            doc.addPage();
            y = 20;
            doc.setFontSize(14);
            doc.setTextColor(52, 73, 94);
            doc.text(`${entry.title || 'Untitled'} (${date}) - continued`, 14, y);
            doc.setFontSize(12);
            doc.setTextColor(80, 80, 80);
            y += 8;
          } else {
            y += 8;
          }
          
          doc.text(textLines, 14, y);
          y += (textLines.length * 7) + 15;
        }
      } else {
        const y = doc.lastAutoTable ? doc.lastAutoTable.finalY + 30 : currentY + 10;
        doc.setFontSize(12);
        doc.setTextColor(100, 100, 100);
        doc.text('No journal entries found.', 14, y);
      }
      
      // Save the PDF
      doc.save('mindscribe-data.pdf');
      
    } catch (error) {
      console.error('Error exporting data:', error);
      alert('Failed to export data. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error('Error signing out:', error);
      alert('Failed to sign out. Please try again.');
    }
  };

  return (
    <div className={style.container}>
      <h1 className={style.pageTitle}>Settings</h1>
      
      <div className={style.settingsCard}>
        <h2>Profile Settings</h2>
        <div className={style.profileSection}>
          <div className={style.avatarSection}>
            <img 
              src={profileImage || '/default-avatar.png'} 
              alt="Profile" 
              className={style.profileImage}
            />
            <div className={style.avatarButtons}>
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleImageUpload}
                accept="image/*"
                style={{ display: 'none' }}
              />
              <button 
                className={style.uploadButton}
                onClick={() => fileInputRef.current.click()}
                disabled={isSaving}
              >
                {isSaving ? 'Uploading...' : 'Change Photo'}
              </button>
            </div>
          </div>
          <div className={style.settingItem}>
            <div>
              <div className={style.settingLabel}>Display Name</div>
              <div className={style.settingDescription}>
                This name will be used to personalize your experience
              </div>
            </div>
            <div className={style.nameInputGroup}>
              <input
                type="text"
                value={userName}
                onChange={(e) => setUserName(e.target.value)}
                placeholder="Enter your name"
                className={style.nameInput}
              />
              <button 
                onClick={handleNameSave}
                className={style.saveButton}
                disabled={isSaving}
              >
                Save
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className={style.settingsCard}>
        <h2>App Preferences</h2>
        <div className={style.settingItem}>
          <div>
            <div className={style.settingLabel}>Dark Mode</div>
            <div className={style.settingDescription}>
              Use dark theme for better viewing in low light
            </div>
          </div>
          <div 
            className={`${style.toggle} ${isDarkMode ? style.active : ''}`}
            onClick={toggleTheme}
            role="switch"
            aria-checked={isDarkMode}
            tabIndex={0}
          >
            <div className={style.toggleHandle} />
          </div>
        </div>

        <div className={style.settingItem}>
          <div>
            <div className={style.settingLabel}>Email Notifications</div>
            <div className={style.settingDescription}>
              Receive daily reminders to log your mood
            </div>
          </div>
          <div className={style.notificationSettings}>
            <div 
              className={`${style.toggle} ${emailNotifications ? style.active : ''}`}
              onClick={handleNotificationToggle}
              role="switch"
              aria-checked={emailNotifications}
              tabIndex={0}
            >
              <div className={style.toggleHandle} />
            </div>
            {emailNotifications && (
              <input
                type="time"
                value={remindTime}
                onChange={(e) => setRemindTime(e.target.value)}
                className={style.timeInput}
              />
            )}
          </div>
        </div>
      </div>

      <div className={style.settingsCard}>
        <h2>Data Management</h2>
        <div className={style.settingItem}>
          <div>
            <div className={style.settingLabel}>Export Data</div>
            <div className={style.settingDescription}>
              Download all your mood and journal entries
            </div>
          </div>
          <button 
            onClick={handleExportData} 
            className={style.exportButton}
            disabled={isSaving}
          >
            <span>📥</span> Export
          </button>
        </div>
      </div>

      <div className={style.settingsCard}>
        <h2>Account</h2>
        <div className={style.settingItem}>
          <div>
            <div className={style.settingLabel}>Sign Out</div>
            <div className={style.settingDescription}>
              Sign out of your account
            </div>
          </div>
          <button 
            onClick={handleLogout} 
            className={style.logoutButton}
          >
            Sign Out
          </button>
        </div>
      </div>
    </div>
  );
}

export default SettingsLayout;