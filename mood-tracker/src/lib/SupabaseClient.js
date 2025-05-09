import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

console.log('SupabaseClient: Checking environment variables');
if (!supabaseUrl || !supabaseKey) {
  console.error('SupabaseClient: Missing environment variables', {
    hasUrl: !!supabaseUrl,
    hasKey: !!supabaseKey
  });
  throw new Error('Missing Supabase environment variables');
}

// Create a single instance of the Supabase client
let supabaseInstance = null;

const getSupabaseClient = () => {
  if (!supabaseInstance) {
    console.log('SupabaseClient: Creating new client instance');
    try {
      supabaseInstance = createClient(supabaseUrl, supabaseKey, {
        auth: {
          autoRefreshToken: true,
          persistSession: true,
          detectSessionInUrl: true
        }
      });
      console.log('SupabaseClient: Client instance created successfully');
    } catch (error) {
      console.error('SupabaseClient: Error creating client:', error);
      throw error;
    }
  }
  return supabaseInstance;
};

// Export the single instance
const supabase = getSupabaseClient();

// Initialize user profile schema
export const initializeProfile = async (userId) => {
  console.log('SupabaseClient: Initializing profile for user:', userId);
  const { error } = await supabase.rpc('create_user_profile_if_not_exists', { user_id: userId });
  
  if (error && error.message !== 'relation "public.user_profiles" does not exist') {
    console.error('SupabaseClient: Error initializing profile:', error);
    throw error;
  }
};

export const updateUserProfile = async (userId, updates) => {
  console.log('SupabaseClient: Updating profile for user:', userId, 'with updates:', updates);
  
  try {
    // First check if the user_profiles table exists
    const { error: tableCheckError } = await supabase
      .from('user_profiles')
      .select('user_id')
      .limit(1);

    if (tableCheckError && tableCheckError.message.includes('relation "user_profiles" does not exist')) {
      console.log('SupabaseClient: User profiles table does not exist, creating it');
      const { error: createError } = await supabase.rpc('create_user_profiles_table');
      if (createError) {
        console.error('SupabaseClient: Error creating user profiles table:', createError);
        throw createError;
      }
    }

    // First try to get the existing profile
    const { data: existingProfile, error: fetchError } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (fetchError && !fetchError.message.includes('No rows found')) {
      console.error('SupabaseClient: Error fetching profile:', fetchError);
      throw fetchError;
    }

    // If profile exists, update it
    if (existingProfile) {
      const { data, error } = await supabase
        .from('user_profiles')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', userId)
        .select()
        .single();

      if (error) {
        console.error('SupabaseClient: Error updating profile:', error);
        throw error;
      }

      console.log('SupabaseClient: Profile updated successfully:', data);
      return data;
    } else {
      // If profile doesn't exist, create it
      const { data, error } = await supabase
        .from('user_profiles')
        .insert([{
          user_id: userId,
          ...updates,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }])
        .select()
        .single();

      if (error) {
        console.error('SupabaseClient: Error creating profile:', error);
        throw error;
      }

      console.log('SupabaseClient: Profile created successfully:', data);
      return data;
    }
  } catch (error) {
    console.error('SupabaseClient: Error in updateUserProfile:', error);
    // If we get here, something went wrong but we don't want to block the app
    // Return a default profile instead
    return {
      user_id: userId,
      display_name: '',
      avatar_url: null,
      email_notifications: false,
      remind_time: '20:00',
      theme: 'light'
    };
  }
};

export const getUserProfile = async (userId) => {
  if (!userId) {
    console.error('No user ID provided to getUserProfile');
    return null;
  }

  try {
    const { data, error } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle();

    if (error) {
      console.error('Error fetching profile:', error);
      throw error;
    }

    if (!data) {
      console.log('No profile found, creating default profile for user:', userId);
      const defaultProfile = {
        user_id: userId,
        display_name: '',
        avatar_url: null,
        email_notifications: false,
        remind_time: '20:00',
        theme: 'light'
      };

      const { data: newProfile, error: createError } = await supabase
        .from('user_profiles')
        .insert([defaultProfile])
        .select()
        .single();

      if (createError) {
        console.error('Error creating default profile:', createError);
        throw createError;
      }
      return newProfile;
    }

    return data;
  } catch (error) {
    console.error('Error in getUserProfile:', error);
    return null;
  }
};

export const saveMoodEntry = async ({ mood, note, date, activities, user_id, intensity }) => {
  const { data, error } = await supabase
    .from('mood_entries')
    .insert([
      {
        mood,
        note,
        date,
        activities,
        user_id,
        intensity: intensity || 5
      }
    ])
    .select();

  if (error) throw error;
  return data;
};

export const saveJournalEntry = async ({ title, content, moodEntryId, user_id }) => {
  const { data, error } = await supabase
    .from('journal_entries')
    .insert([
      {
        title,
        content,
        mood_entry_id: moodEntryId,
        user_id,
        created_at: new Date().toISOString()
      }
    ])
    .select();

  if (error) throw error;
  return data;
};

export const getMoodEntries = async (startDate, endDate, user_id) => {
  const query = supabase
    .from('mood_entries')
    .select('*')
    .eq('user_id', user_id)
    .order('date', { ascending: false });

  if (startDate && endDate) {
    query.gte('date', startDate).lte('date', endDate);
  }

  const { data, error } = await query;
  if (error) throw error;
  return data;
};

export const toggleJournalPin = async (id, isPinned) => {
  const { data, error } = await supabase
    .from('journal_entries')
    .update({ is_pinned: isPinned })
    .eq('id', id)
    .select();

  if (error) throw error;
  return data;
};

export const deleteJournalEntry = async (id) => {
  const { error } = await supabase
    .from('journal_entries')
    .delete()
    .eq('id', id);

  if (error) throw error;
  return true;
};

// Add this function after the initializeProfile function
export const ensureStorageBucket = async () => {
  console.log('SupabaseClient: Checking storage bucket');
  try {
    // Check if the bucket exists
    const { data: buckets, error: listError } = await supabase.storage.listBuckets();
    
    if (listError) {
      console.error('SupabaseClient: Error listing buckets:', listError);
      return { success: false, message: `Error listing buckets: ${listError.message}` };
    }
    
    console.log('SupabaseClient: Available buckets:', buckets);
    
    // If bucket doesn't exist, attempt to create it
    if (!buckets || !buckets.find(b => b.name === 'profile-images')) {
      console.log('SupabaseClient: Bucket "profile-images" not found, checking permissions');
      
      try {
        // First try to list files to check permissions
        const { data: testData, error: testError } = await supabase.storage
          .from('profile-images')
          .list();
          
        if (testError && testError.message.includes('bucket not found')) {
          console.log('SupabaseClient: Bucket not found. Please create it in the Supabase dashboard.');
          return { 
            success: false, 
            message: 'Storage bucket "profile-images" not found. Please create it in the Supabase dashboard and set it to public.' 
          };
        }
        
        return { success: true, buckets };
      } catch (err) {
        console.error('SupabaseClient: Error checking bucket:', err);
        return { 
          success: false, 
          message: `Error checking bucket: ${err.message}. Please ensure the bucket exists in the Supabase dashboard.` 
        };
      }
    }
    
    return { success: true, buckets };
  } catch (error) {
    console.error('SupabaseClient: Error ensuring storage bucket:', error);
    return { success: false, message: `Error ensuring storage bucket: ${error.message}` };
  }
};

// Modified function to upload a profile image
export const uploadProfileImage = async (file, userId) => {
  console.log('SupabaseClient: Uploading profile image for user:', userId);
  
  // First check that the bucket exists
  const bucketCheck = await ensureStorageBucket();
  if (!bucketCheck.success) {
    console.error('SupabaseClient: Bucket check failed:', bucketCheck.message);
    return { success: false, message: bucketCheck.message };
  }
  
  try {
    // Validate file
    if (!file) {
      return { success: false, message: 'No file provided' };
    }
    
    const fileExt = file.name.split('.').pop();
    const fileName = `${userId}-${Date.now()}.${fileExt}`;
    const filePath = `${fileName}`;
    
    console.log(`SupabaseClient: Uploading file ${fileName} to profile-images bucket`);
    
    // Upload file
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('profile-images')
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: true
      });
      
    if (uploadError) {
      console.error('SupabaseClient: Upload error:', uploadError);
      return { 
        success: false, 
        message: `Upload failed: ${uploadError.message}. Please check storage permissions.` 
      };
    }
    
    console.log('SupabaseClient: File uploaded successfully:', uploadData);
    
    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from('profile-images')
      .getPublicUrl(filePath);
      
    console.log('SupabaseClient: Public URL generated:', publicUrl);
    
    return { success: true, publicUrl };
  } catch (error) {
    console.error('SupabaseClient: Error in profile image upload:', error);
    return { success: false, message: `Error uploading image: ${error.message}` };
  }
};

export async function deleteMoodEntry(entryId) {
  try {
    console.log('Deleting mood entry:', entryId);
    const { error } = await supabase
      .from('mood_entries')
      .delete()
      .eq('id', entryId);

    if (error) {
      console.error('Error deleting mood entry:', error);
      throw error;
    }

    console.log('Successfully deleted mood entry:', entryId);
    return { success: true };
  } catch (error) {
    console.error('Failed to delete mood entry:', error);
    throw error;
  }
}

// Export the supabase instance
export { supabase };
