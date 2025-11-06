import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { WalletProvider, useWallet } from './contexts/WalletContext';
import AuthModal from './components/AuthModal';
import LoginPage from './components/LoginPage';
import RewardsDashboard from './components/RewardsDashboard';
import UserProfile from './components/UserProfile';
import StorageService from './services/StorageService';
import './App.css';

const AppContent = () => {
  const { isConnected, publicKey, balance, walletName, connectWallet, disconnectWallet } = useWallet();
  const [user, setUser] = useState(null);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showLoginPage, setShowLoginPage] = useState(false);
  const [activeTab, setActiveTab] = useState('dashboard');
  const navigate = useNavigate();

  // التحقق من المستخدم الحالي عند التحميل
  useEffect(() => {
    const checkExistingSession = () => {
      if (isConnected && publicKey) {
        const existingUser = StorageService.getUser(publicKey);
        if (existingUser) {
          console.log('✅ Existing session found, auto-login:', existingUser);
          setUser(existingUser);
          setShowLoginPage(false);
          setShowAuthModal(false);
        } else {
          console.log('❌ No existing user, showing login page');
          setShowLoginPage(true);
        }
      }
    };

    checkExistingSession();
  }, [isConnected, publicKey]);

  const handleLoginSuccess = (userData) => {
    console.log('✅ Login successful, redirecting to dashboard:', userData);
    setUser(userData);
    setShowLoginPage(false);
    setShowAuthModal(false);
    navigate('/rewards'); // التوجه مباشرة إلى RewardsDashboard
  };

  const handleShowRegister = () => {
    console.log('🔄 Switching to registration');
    setShowLoginPage(false);
    setShowAuthModal(true);
  };

  const handleShowLogin = () => {
    console.log('🔄 Switching to login');
    setShowAuthModal(false);
    setShowLoginPage(true);
  };

  const handleAuthSuccess = async (userData) => {
    console.log('🎉 Registration successful:', userData);
    
    try {
      const result = StorageService.saveUserData({
        address: publicKey,
        username: userData.username,
        firstName: userData.firstName,
        lastName: userData.lastName,
        email: userData.email,
        carvPlayUsername: userData.carvPlayUsername,
        carvUID: userData.carvUID,
        twitter: userData.twitter,
        telegram: userData.telegram,
        avatar: userData.avatar,
        type: 'solana'
      });

      if (result.success) {
        console.log('✅ User data saved via StorageService');
        
        StorageService.saveActivity(publicKey, {
          type: 'registration',
          description: 'New user registered successfully',
          points: 50
        });

        const savedUser = StorageService.getCurrentUserData();
        setUser(savedUser);
        setShowAuthModal(false);
        setShowLoginPage(false);
        
        console.log('✅ Redirecting to rewards dashboard');
        navigate('/rewards'); // التوجه مباشرة إلى RewardsDashboard بعد التسجيل
      }
    } catch (error) {
      console.error('❌ Error in handleAuthSuccess:', error);
    }
  };

  const handleConnectWallet = async () => {
    try {
      console.log('🔗 Initiating wallet connection...');
      await connectWallet('backpack');
    } catch (error) {
      console.error('❌ Failed to connect wallet:', error);
    }
  };

  const handleLogout = () => {
    console.log('👋 User logging out');
    disconnectWallet();
    setUser(null);
    StorageService.logout();
    setShowLoginPage(true);
    navigate('/');
  };

  // صفحة التسجيل الجديدة
  if (showLoginPage) {
    return (
      <LoginPage 
        onLoginSuccess={handleLoginSuccess}
        onShowRegister={handleShowRegister}
      />
    );
  }

  // شاشة إنشاء حساب جديد
  if (isConnected && publicKey && showAuthModal) {
    return (
      <div className="modern-app">
        <AuthModal 
          isOpen={true}
          onClose={handleShowLogin}
          onAuthSuccess={handleAuthSuccess}
          walletAddress={publicKey}
        />
      </div>
    );
  }

  // شاشة الترحيب قبل الربط
  if (!isConnected && !showLoginPage && !user) {
    return (
      <div className="modern-app">
        <div className="hero-section">
          <div className="hero-background">
            <div className="hero-content">
              <div className="logo-section">
                <div className="logo-icon">🌐</div>
                <h1 className="hero-title">CARVFi</h1>
                <p className="hero-subtitle">Next Generation Social Finance</p>
              </div>
              
              <div className="features-grid">
                <div className="feature-card">
                  <div className="feature-icon">🤖</div>
                  <h3>AI Assistant</h3>
                  <p>Smart AI-powered guidance</p>
                </div>
                <div className="feature-card">
                  <div className="feature-icon">💰</div>
                  <h3>Social Rewards</h3>
                  <p>Earn while you socialize</p>
                </div>
                <div className="feature-card">
                  <div className="feature-icon">🛡️</div>
                  <h3>Bot Protection</h3>
                  <p>Advanced security system</p>
                </div>
                <div className="feature-card">
                  <div className="feature-icon">🎒</div>
                  <h3>BackPack Ready</h3>
                  <p>Seamless wallet integration</p>
                </div>
              </div>

              <button 
                className="cta-button"
                onClick={handleConnectWallet}
              >
                <span className="button-icon">🔗</span>
                Connect BackPack Wallet
                <span className="button-glow"></span>
              </button>

              <div className="auth-options">
                <p>Already have an account?</p>
                <button 
                  className="text-button"
                  onClick={() => setShowLoginPage(true)}
                >
                  Sign In Here
                </button>
              </div>
              
              <p className="cta-subtext">
                Join the future of social finance on Carv SVM
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // الواجهة الرئيسية للمستخدم المسجل
  if (isConnected && publicKey && user) {
    return (
      <div className="modern-app">
        {/* Header */}
        <header className="modern-header">
          <div className="header-container">
            <div className="brand-section">
              <div className="brand-logo">
                <span className="logo-emoji">🌐</span>
                <div className="brand-text">
                  <h1>CARVFi</h1>
                  <span className="beta-badge">Beta</span>
                </div>
              </div>
            </div>

            <div className="user-section">
              <div className="user-profile">
                <div className="avatar-container">
                  {user.avatar ? (
                    <img src={user.avatar} alt="Profile" className="user-avatar" />
                  ) : (
                    <div className="avatar-placeholder">
                      {user.firstName?.charAt(0)}{user.lastName?.charAt(0)}
                    </div>
                  )}
                  <div className="online-indicator"></div>
                </div>
                <div className="user-info">
                  <span className="user-name">{user.firstName} {user.lastName}</span>
                  <span className="user-handle">@{user.username}</span>
                </div>
              </div>
              
              <div className="wallet-display">
                <div className="balance-card">
                  <span className="balance-amount">{parseFloat(balance).toFixed(2)}</span>
                  <span className="balance-currency">CARV</span>
                </div>
                <button className="logout-btn" onClick={handleLogout}>
                  <span className="logout-icon">⎋</span>
                </button>
              </div>
            </div>
          </div>
        </header>

        {/* Navigation */}
        <nav className="modern-nav">
          <div className="nav-container">
            <button
              className={`nav-item ${activeTab === 'dashboard' ? 'active' : ''}`}
              onClick={() => { setActiveTab('dashboard'); navigate('/'); }}
            >
              <span className="nav-icon">📊</span>
              <span className="nav-label">Dashboard</span>
            </button>
            <button
              className={`nav-item ${activeTab === 'rewards' ? 'active' : ''}`}
              onClick={() => { setActiveTab('rewards'); navigate('/rewards'); }}
            >
              <span className="nav-icon">💰</span>
              <span className="nav-label">Rewards</span>
            </button>
            <button
              className={`nav-item ${activeTab === 'profile' ? 'active' : ''}`}
              onClick={() => { setActiveTab('profile'); navigate('/profile'); }}
            >
              <span className="nav-icon">👤</span>
              <span className="nav-label">Profile</span>
            </button>
          </div>
        </nav>

        {/* Main Content with Routes */}
        <main className="modern-main">
          <div className="main-container">
            <Routes>
              <Route path="/" element={<DashboardView user={user} balance={balance} walletName={walletName} publicKey={publicKey} />} />
              <Route path="/rewards" element={<RewardsDashboard user={user} />} />
              <Route path="/profile" element={<UserProfile user={user} />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="modern-app">
      <div className="hero-section">
        <div className="hero-background">
          <div className="hero-content">
            <div className="loading-state">
              <div className="loading-spinner"></div>
              <p>Loading CARVFi...</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Dashboard Component (نفس الكود السابق)
const DashboardView = ({ user, balance, walletName, publicKey }) => {
  return (
    <>
      <div className="welcome-banner">
        <div className="welcome-content">
          <h2>Welcome back, {user.firstName}! 👋</h2>
          <p>Ready to explore the world of Social Finance?</p>
        </div>
        <div className="stats-overview">
          <div className="stat-item">
            <div className="stat-value">{user.points || 0}</div>
            <div className="stat-label">Points</div>
          </div>
          <div className="stat-item">
            <div className="stat-value">{user.streak || 0}</div>
            <div className="stat-label">Day Streak</div>
          </div>
          <div className="stat-item">
            <div className="stat-value">Lv. {user.level || 1}</div>
            <div className="stat-label">Level</div>
          </div>
        </div>
      </div>

      <div className="dashboard-grid">
        <div className="dashboard-card profile-card">
          <div className="card-header">
            <h3>👤 Personal Profile</h3>
            <span className="card-badge">Complete</span>
          </div>
          <div className="card-content">
            <div className="info-grid">
              <div className="info-item">
                <label>Email</label>
                <span>{user.email}</span>
              </div>
              {user.carvPlayUsername && (
                <div className="info-item">
                  <label>Carv Play</label>
                  <span>{user.carvPlayUsername}</span>
                </div>
              )}
              {user.twitter && (
                <div className="info-item">
                  <label>Twitter</label>
                  <span>{user.twitter}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="dashboard-card wallet-card">
          <div className="card-header">
            <h3>💰 Wallet</h3>
            <span className="network-badge">Carv SVM</span>
          </div>
          <div className="card-content">
            <div className="wallet-info">
              <div className="balance-display">
                <div className="crypto-amount">{parseFloat(balance).toFixed(4)}</div>
                <div className="crypto-name">CARV</div>
              </div>
              <div className="wallet-details">
                <p className="wallet-type">Connected with {walletName}</p>
                <p className="wallet-address">{publicKey?.slice(0, 12)}...{publicKey?.slice(-8)}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
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