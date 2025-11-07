import React, { useState, useEffect } from 'react';
import { WalletProvider } from './contexts/WalletContext';
import AuthModal from './components/AuthModal';
import RewardsDashboard from './components/RewardsDashboard';
import UserProfile from './components/UserProfile';
import BotProtection from './components/BotProtection';
import AIChat from './components/AIChat';
import StorageService from './services/StorageService';
import './App.css';

function App() {
  const [user, setUser] = useState(null);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [activeSection, setActiveSection] = useState('dashboard');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuthentication();
  }, []);

  const checkAuthentication = () => {
    const userData = StorageService.getLocalUser();
    if (userData) {
      setUser(userData);
    }
    setLoading(false);
  };

  const handleLoginSuccess = (userData) => {
    setUser(userData);
    setShowAuthModal(false);
  };

  const handleLogout = () => {
    StorageService.logout();
    setUser(null);
    setActiveSection('dashboard');
  };

  if (loading) {
    return (
      <div className="app-loading">
        <div className="loading-spinner"></div>
        <p>Loading CARVFi...</p>
      </div>
    );
  }

  return (
    <WalletProvider>
      <div className="App">
        <BotProtection />
        
        {/* Navigation Header */}
        <header className="app-header">
          <div className="header-content">
            <div className="logo-section">
              <h1 className="logo">🚀 CARVFi</h1>
              <span className="tagline">Social Finance Platform</span>
            </div>

            <nav className="nav-section">
              <button 
                className={`nav-btn ${activeSection === 'dashboard' ? 'active' : ''}`}
                onClick={() => setActiveSection('dashboard')}
              >
                Dashboard
              </button>
              <button 
                className={`nav-btn ${activeSection === 'profile' ? 'active' : ''}`}
                onClick={() => setActiveSection('profile')}
              >
                Profile
              </button>
              <button 
                className="nav-btn"
                onClick={() => setActiveSection('ai-chat')}
              >
                AI Assistant
              </button>
            </nav>

            <div className="auth-section">
              {user ? (
                <div className="user-menu">
                  <span className="welcome-text">Welcome, {user.username}!</span>
                  <button className="logout-btn" onClick={handleLogout}>
                    Logout
                  </button>
                </div>
              ) : (
                <button 
                  className="login-btn"
                  onClick={() => setShowAuthModal(true)}
                >
                  Login / Sign Up
                </button>
              )}
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="app-main">
          {!user ? (
            <div className="welcome-section">
              <div className="welcome-content">
                <h2>Welcome to CARVFi</h2>
                <p>Join our Social Finance platform and start earning rewards today!</p>
                <button 
                  className="cta-button"
                  onClick={() => setShowAuthModal(true)}
                >
                  Get Started
                </button>
              </div>
            </div>
          ) : (
            <>
              {activeSection === 'dashboard' && <RewardsDashboard />}
              {activeSection === 'profile' && <UserProfile />}
              {activeSection === 'ai-chat' && <AIChat />}
            </>
          )}
        </main>

        {/* Auth Modal */}
        {showAuthModal && (
          <AuthModal 
            isOpen={showAuthModal}
            onClose={() => setShowAuthModal(false)}
            onLoginSuccess={handleLoginSuccess}
          />
        )}

        {/* AI Chat Widget */}
        <AIChat />
      </div>
    </WalletProvider>
  );
}

export default App;