import React from 'react';
import { NavLink } from 'react-router-dom';
import './MobileDrawer.css';

function MobileDrawer({ isOpen, onClose }) {
  return (
    <>
      {isOpen && <div className="drawer-overlay" onClick={onClose} />}
      <div className={`drawer ${isOpen ? 'open' : ''}`}>
        <div className="drawer-header">
          <div className="drawer-logo">MindScribe</div>
          <button className="drawer-close" onClick={onClose}>×</button>
        </div>
        <nav className="drawer-nav">
          <NavLink to="/" end onClick={onClose}>
            Home
          </NavLink>
          <NavLink to="/log-mood" onClick={onClose}>
            Log Mood
          </NavLink>
          <NavLink to="/journal" onClick={onClose}>
            Journal
          </NavLink>
          <NavLink to="/history" onClick={onClose}>
            History
          </NavLink>
          <NavLink to="/settings" onClick={onClose}>
            Settings
          </NavLink>
        </nav>
      </div>
    </>
  );
}

export default MobileDrawer;