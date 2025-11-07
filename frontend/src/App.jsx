import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { WalletProvider, useWallet } from './contexts/WalletContext';
import AuthModal from './components/AuthModal';
import RewardsDashboard from './components/RewardsDashboard';
import UserProfile from './components/UserProfile';
import BotProtection from './components/BotProtection';
import AIChat from './components/AIChat';
import './App.css';

// خدمة تخزين محلية مبسطة
const StorageService = {
  getCurrentUser: () => {
    try {
      return JSON.parse(localStorage.getItem('carvfi_current_user') || 'null');
    } catch (error) {
      console.error('Error getting user:', error);
      return null;
    }
  },

  saveUser: (userData) => {
    try {
      localStorage.setItem('carvfi_current_user', JSON.stringify(userData));
      
      const users = JSON.parse(localStorage.getItem('carvfi_users') || '{}');
      const userKey = userData.walletAddress?.toLowerCase();
      users[userKey] = userData;
      localStorage.setItem('carvfi_users', JSON.stringify(users));
      
      return true;
    } catch (error) {
      console.error('Error saving user:', error);
      return false;
    }
  },

  logout: () => {
    localStorage.removeItem('carvfi_current_user');
  }
};

const AppContent = () => {
  const { isConnected, publicKey, disconnectWallet } = useWallet();
  const [user, setUser] = useState(null);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    checkAuthentication();
  }, []);

  useEffect(() => {
    if (isConnected && publicKey) {
      const savedUser = StorageService.getCurrentUser();
      if (savedUser && savedUser.walletAddress === publicKey) {
        setUser(savedUser);
        setShowAuthModal(false);
        navigate('/dashboard');
      } else {
        setShowAuthModal(true);
      }
    } else {
      setUser(null);
    }
  }, [isConnected, publicKey, navigate]);

  const checkAuthentication = () => {
    const userData = StorageService.getCurrentUser();
    if (userData) {
      setUser(userData);
    }
    setLoading(false);
  };

  const handleLoginSuccess = (userData) => {
    const success = StorageService.saveUser(userData);
    if (success) {
      setUser(userData);
      setShowAuthModal(false);
      navigate('/dashboard');
    }
  };

  const handleLogout = () => {
    StorageService.logout();
    setUser(null);
    disconnectWallet();
    navigate('/');
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
            {user ? (
              <>
                <button 
                  className="nav-btn"
                  onClick={() => navigate('/dashboard')}
                >
                  Dashboard
                </button>
                <button 
                  className="nav-btn"
                  onClick={() => navigate('/profile')}
                >
                  Profile
                </button>
                <button 
                  className="nav-btn"
                  onClick={() => navigate('/ai-chat')}
                >
                  AI Assistant
                </button>
              </>
            ) : (
              <button 
                className="nav-btn"
                onClick={() => setShowAuthModal(true)}
              >
                Features
              </button>
            )}
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
                Connect Wallet
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Main Content with Router */}
      <main className="app-main">
        <Routes>
          {/* Public Routes */}
          <Route 
            path="/" 
            element={
              user ? (
                <Navigate to="/dashboard" replace />
              ) : (
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
              )
            } 
          />
          
          {/* Protected Routes */}
          <Route 
            path="/dashboard" 
            element={
              user ? <RewardsDashboard user={user} /> : <Navigate to="/" replace />
            } 
          />
          
          <Route 
            path="/profile" 
            element={
              user ? <UserProfile user={user} /> : <Navigate to="/" replace />
            } 
          />
          
          <Route 
            path="/ai-chat" 
            element={
              user ? <AIChat /> : <Navigate to="/" replace />
            } 
          />
          
          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>

      {/* Auth Modal */}
      {showAuthModal && (
        <AuthModal 
          isOpen={showAuthModal}
          onClose={() => {
            setShowAuthModal(false);
            if (!user) {
              disconnectWallet();
            }
          }}
          onLoginSuccess={handleLoginSuccess}
          walletAddress={publicKey}
        />
      )}
    </div>
  );
};

function App() {
  return (
    <WalletProvider>
      <AppContent />
    </WalletProvider>
  );
}

export default App;
