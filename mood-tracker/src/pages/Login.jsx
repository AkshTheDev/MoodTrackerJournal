import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import LoadingSpinner from '../components/LoadingSpinner';
import styles from './Login.module.css';

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const { signIn, signUp } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const { error } = isSignUp 
        ? await signUp({ email, password })
        : await signIn({ email, password });

      if (error) throw error;
      
      if (!isSignUp) {
        navigate('/');
      } else {
        setError('Please check your email for verification link');
      }
    } catch (error) {
      setError(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return <LoadingSpinner />;
  }

  return (
    <div className={styles.container}>
      <div className={styles.formCard}>
        <h1 className={styles.title}>MindScribe</h1>
        <p className={styles.subtitle}>
          {isSignUp 
            ? 'Create an account to start tracking your moods'
            : 'Welcome back! Please sign in to continue'
          }
        </p>

        {error && (
          <div className={styles.error}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.inputGroup}>
            <label htmlFor="email">Email</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="Enter your email"
            />
          </div>

          <div className={styles.inputGroup}>
            <label htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="Enter your password"
            />
          </div>

          <button type="submit" className={styles.submitButton}>
            {isSignUp ? 'Sign Up' : 'Sign In'}
          </button>
        </form>

        <p className={styles.toggleText}>
          {isSignUp 
            ? 'Already have an account? '
            : "Don't have an account? "
          }
          <button
            className={styles.toggleButton}
            onClick={() => setIsSignUp(!isSignUp)}
          >
            {isSignUp ? 'Sign In' : 'Sign Up'}
          </button>
        </p>
      </div>
    </div>
  );
}

export default Login;