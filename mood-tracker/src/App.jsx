import React, { useState, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route, NavLink } from 'react-router-dom';
import HomeLayout from './layout/HomeLayout';
import LogMoodLayout from './layout/LogMoodLayout';
import JournalLayout from './layout/JournalLayout';
import HistoryLayout from './layout/HistoryLayout';
import SettingsLayout from './layout/SettingsLayout';
import MobileDrawer from './components/MobileDrawer';
import ProtectedRoute from './components/ProtectedRoute';
import ErrorBoundary from './components/ErrorBoundary';
import Login from './pages/Login';
import { AuthProvider } from './context/AuthContext';
import { useTheme } from './hooks/useTheme';
import LoadingSpinner from './components/LoadingSpinner';
import './App.css';

function AppContent() {
  const { isDarkMode } = useTheme();
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  return (
    <div className={`app ${isDarkMode ? 'dark' : 'light'}`}>
      <nav className="nav">
        <div className="logo">MindScribe</div>
        <div className="nav-links">
          <NavLink to="/" end>
            Home
          </NavLink>
          <NavLink to="/log-mood">
            Log Mood
          </NavLink>
          <NavLink to="/journal">
            Journal
          </NavLink>
          <NavLink to="/history">
            History
          </NavLink>
          <NavLink to="/settings">
            Settings
          </NavLink>
        </div>
        <button 
          className="menu-toggle"
          onClick={() => setIsDrawerOpen(true)}
          aria-label="Toggle menu"
        >
          ☰
        </button>
      </nav>

      <MobileDrawer 
        isOpen={isDrawerOpen} 
        onClose={() => setIsDrawerOpen(false)} 
      />

      <main className="main-content">
        <Suspense fallback={<LoadingSpinner />}>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/" element={
              <ProtectedRoute>
                <HomeLayout darkMode={isDarkMode} />
              </ProtectedRoute>
            } />
            <Route path="/log-mood" element={
              <ProtectedRoute>
                <LogMoodLayout />
              </ProtectedRoute>
            } />
            <Route path="/journal" element={
              <ProtectedRoute>
                <JournalLayout />
              </ProtectedRoute>
            } />
            <Route path="/history" element={
              <ProtectedRoute>
                <HistoryLayout />
              </ProtectedRoute>
            } />
            <Route path="/settings" element={
              <ProtectedRoute>
                <SettingsLayout />
              </ProtectedRoute>
            } />
          </Routes>
        </Suspense>
      </main>
    </div>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <Router>
          <AppContent />
        </Router>
      </AuthProvider>
    </ErrorBoundary>
  );
}

export default App;
