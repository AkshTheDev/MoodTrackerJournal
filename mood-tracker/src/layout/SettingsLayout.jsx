import React, { useState, useRef, useEffect } from 'react';
import style from './SettingsLayout.module.css';
import { useTheme } from '../hooks/useTheme';
import { useAuth } from '../context/AuthContext';
import { supabase, getUserProfile, updateUserProfile } from '../lib/SupabaseClient';

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
      console.log('Starting image upload process...');
      
      // Check if storage bucket exists
      console.log('Checking storage buckets...');
      const { data: buckets, error: bucketError } = await supabase.storage.listBuckets();
      
      if (bucketError) {
        console.error('Error listing buckets:', bucketError);
        throw new Error('Failed to access storage: ' + bucketError.message);
      }
      
      console.log('Available buckets:', buckets);
      
      // Check if we have permission to list buckets
      if (!buckets) {
        throw new Error('No buckets found. Please check your Supabase storage permissions.');
      }

      const profileImagesBucket = buckets.find(b => b.name === 'profile-images');
      console.log('Profile images bucket:', profileImagesBucket);

      if (!profileImagesBucket) {
        throw new Error(
          'Profile images bucket not found. Please ensure:\n' +
          '1. The bucket is named exactly "profile-images"\n' +
          '2. The bucket is set to "Public"\n' +
          '3. You have the correct storage permissions'
        );
      }

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

      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}-${Math.random()}.${fileExt}`;
      const filePath = `${fileName}`;

      console.log('Uploading file:', { 
        fileName, 
        filePath, 
        fileType: file.type, 
        fileSize: file.size,
        userId: user.id 
      });

      // First, try to delete any existing image for this user
      try {
        const { data: existingFiles, error: listError } = await supabase.storage
          .from('profile-images')
          .list();
        
        if (listError) {
          console.error('Error listing existing files:', listError);
        } else {
          console.log('Existing files:', existingFiles);
          const userFiles = existingFiles?.filter(f => f.name.startsWith(user.id));
          if (userFiles?.length > 0) {
            console.log('Found existing files:', userFiles);
            const { error: deleteError } = await supabase.storage
              .from('profile-images')
              .remove(userFiles.map(f => f.name));
            
            if (deleteError) {
              console.warn('Error deleting existing files:', deleteError);
            } else {
              console.log('Successfully deleted existing files');
            }
          }
        }
      } catch (deleteError) {
        console.warn('Error during cleanup of existing files:', deleteError);
      }

      // Upload the new file
      console.log('Uploading new file...');
      const { error: uploadError } = await supabase.storage
        .from('profile-images')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: true
        });

      if (uploadError) {
        console.error('Upload error:', uploadError);
        throw new Error('Failed to upload image: ' + uploadError.message);
      }

      console.log('File uploaded successfully, getting public URL');

      const { data: { publicUrl } } = supabase.storage
        .from('profile-images')
        .getPublicUrl(filePath);

      console.log('Public URL generated:', publicUrl);

      // Update the profile
      console.log('Updating user profile with new avatar URL...');
      const updateResult = await updateUserProfile(user.id, { avatar_url: publicUrl });
      console.log('Profile update result:', updateResult);

      if (updateResult) {
        setProfileImage(publicUrl);
        console.log('Profile image state updated successfully');
      } else {
        throw new Error('Failed to update profile with new image URL');
      }
    } catch (error) {
      console.error('Error in handleImageUpload:', error);
      alert(error.message || 'Failed to upload image. Please try again.');
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

      const exportData = {
        mood_entries: moodData,
        journal_entries: journalData,
        exported_at: new Date().toISOString()
      };

      const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'mindscribe-data.json';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
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