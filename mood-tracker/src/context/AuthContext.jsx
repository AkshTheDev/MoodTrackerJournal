import React, { createContext, useState, useContext, useEffect } from 'react';
import { supabase, updateUserProfile } from '../lib/SupabaseClient';
import LoadingSpinner from '../components/LoadingSpinner';

const AuthContext = createContext({});

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let mounted = true;
    console.log('AuthProvider: Starting authentication check');
    
    const initializeAuth = async () => {
      try {
        // Check active sessions and sets the user
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError) {
          console.error('AuthProvider: Session error:', sessionError);
          if (mounted) {
            setError(sessionError);
            setLoading(false);
          }
          return;
        }

        if (mounted) {
          setUser(session?.user ?? null);
          setLoading(false);
        }

        // Listen for changes on auth state
        const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
          console.log('AuthProvider: Auth state changed:', { event: _event, session });
          
          if (mounted) {
            const currentUser = session?.user ?? null;
            setUser(currentUser);

            // If this is a new sign up (user exists but no previous user state)
            if (_event === 'SIGNED_IN' && currentUser) {
              try {
                console.log('AuthProvider: Creating/updating profile for new user');
                // Create or update user profile
                const result = await updateUserProfile(currentUser.id, {
                  display_name: currentUser.email?.split('@')[0] || '',
                  email_notifications: false,
                  remind_time: '20:00',
                  theme: 'light'
                });
                console.log('AuthProvider: Profile update result:', result);
              } catch (error) {
                console.error('AuthProvider: Error creating user profile:', error);
                // Don't set error here as it's not critical for the app to function
              }
            }
            
            // Always set loading to false after handling auth state change
            setLoading(false);
          }
        });

        return () => {
          console.log('AuthProvider: Cleaning up auth subscription');
          mounted = false;
          subscription.unsubscribe();
        };
      } catch (error) {
        console.error('AuthProvider: Unexpected error during initialization:', error);
        if (mounted) {
          setError(error);
          setLoading(false);
        }
      }
    };

    initializeAuth();

    return () => {
      mounted = false;
    };
  }, []);

  const signUp = async (data) => {
    try {
      setLoading(true);
      const { data: authData, error: signUpError } = await supabase.auth.signUp(data);
      
      if (signUpError) {
        console.error('AuthProvider: Sign up error:', signUpError);
        setError(signUpError);
        return { error: signUpError };
      }

      console.log('AuthProvider: Sign up successful:', authData);
      return { data: authData };
    } catch (error) {
      console.error('AuthProvider: Unexpected error during sign up:', error);
      setError(error);
      return { error };
    } finally {
      setLoading(false);
    }
  };

  const signIn = async (data) => {
    try {
      setLoading(true);
      const { data: authData, error: signInError } = await supabase.auth.signInWithPassword(data);
      
      if (signInError) {
        console.error('AuthProvider: Sign in error:', signInError);
        setError(signInError);
        return { error: signInError };
      }

      console.log('AuthProvider: Sign in successful:', authData);
      return { data: authData };
    } catch (error) {
      console.error('AuthProvider: Unexpected error during sign in:', error);
      setError(error);
      return { error };
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    try {
      setLoading(true);
      const { error: signOutError } = await supabase.auth.signOut();
      
      if (signOutError) {
        console.error('AuthProvider: Sign out error:', signOutError);
        setError(signOutError);
        return { error: signOutError };
      }

      console.log('AuthProvider: Sign out successful');
      setUser(null);
      return { data: null };
    } catch (error) {
      console.error('AuthProvider: Unexpected error during sign out:', error);
      setError(error);
      return { error };
    } finally {
      setLoading(false);
    }
  };

  const value = {
    signUp,
    signIn,
    signOut,
    user,
    loading,
    error
  };

  if (error) {
    console.error('AuthProvider: Rendering error state');
    return (
      <div style={{ padding: '20px', textAlign: 'center' }}>
        <h2>Authentication Error</h2>
        <p>{error.message}</p>
        <button onClick={() => window.location.reload()}>Retry</button>
      </div>
    );
  }

  // If we have a user but still loading, show loading spinner
  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};