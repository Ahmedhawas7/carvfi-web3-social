import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { WalletProvider, useWallet } from './contexts/WalletContext';
import AuthModal from './components/AuthModal';
import RewardsDashboard from './components/RewardsDashboard';
import UserProfile from './components/UserProfile';
import './App.css';

// خدمة تخزين محلية
const StorageService = {
  saveUser: (userData) => {
    const users = JSON.parse(localStorage.getItem('carvfi_users') || '{}');
    const userKey = userData.walletAddress?.toLowerCase();
    
    users[userKey] = {
      ...userData,
      points: userData.points || 0,
      streak: userData.streak || 1,
      level: userData.level || 1,
      loginCount: userData.loginCount || 1,
      lastLogin: userData.lastLogin || new Date().toISOString(),
      createdAt: userData.createdAt || new Date().toISOString(),
      lastUpdated: new Date().toISOString()
    };
    
    localStorage.setItem('carvfi_users', JSON.stringify(users));
    localStorage.setItem('carvfi_current_user', JSON.stringify(users[userKey]));
  },

  getCurrentUser: () => {
    return JSON.parse(localStorage.getItem('carvfi_current_user') || 'null');
  },

  getUser: (walletAddress) => {
    const users = JSON.parse(localStorage.getItem('carvfi_users') || '{}');
    return users[walletAddress?.toLowerCase()];
  },

  updateStreak: (walletAddress) => {
    const users = JSON.parse(localStorage.getItem('carvfi_users') || '{}');
    const userKey = walletAddress?.toLowerCase();
    
    if (users[userKey]) {
      const today = new Date().toDateString();
      const lastLogin = users[userKey].lastLogin ? new Date(users[userKey].lastLogin).toDateString() : null;
      
      if (lastLogin !== today) {
        users[userKey].streak = (users[userKey].streak || 0) + 1;
        users[userKey].lastLogin = new Date().toISOString();
        users[userKey].loginCount = (users[userKey].loginCount || 0) + 1;
        users[userKey].lastUpdated = new Date().toISOString();
        localStorage.setItem('carvfi_users', JSON.stringify(users));
        
        const currentUser = StorageService.getCurrentUser();
        if (currentUser && currentUser.walletAddress?.toLowerCase() === userKey) {
          currentUser.streak = users[userKey].streak;
          currentUser.lastLogin = users[userKey].lastLogin;
          currentUser.loginCount = users[userKey].loginCount;
          localStorage.setItem('carvfi_current_user', JSON.stringify(currentUser));
        }
        
        return users[userKey].streak;
      }
    }
    return 0;
  },

  updatePoints: (walletAddress, pointsToAdd) => {
    const users = JSON.parse(localStorage.getItem('carvfi_users') || '{}');
    const userKey = walletAddress?.toLowerCase();
    
    if (users[userKey]) {
      users[userKey].points = (users[userKey].points || 0) + pointsToAdd;
      users[userKey].lastUpdated = new Date().toISOString();
      localStorage.setItem('carvfi_users', JSON.stringify(users));
      
      const currentUser = StorageService.getCurrentUser();
      if (currentUser && currentUser.walletAddress?.toLowerCase() === userKey) {
        currentUser.points = users[userKey].points;
        localStorage.setItem('carvfi_current_user', JSON.stringify(currentUser));
      }
      
      return users[userKey].points;
    }
    return 0;
  },

  saveActivity: (walletAddress, activity) => {
    const activities = JSON.parse(localStorage.getItem('carvfi_activities') || '{}');
    const userKey = walletAddress?.toLowerCase();
    
    if (!activities[userKey]) {
      activities[userKey] = [];
    }
    
    activities[userKey].unshift({
      id: Date.now().toString(),
      ...activity,
      timestamp: new Date().toISOString()
    });
    
    activities[userKey] = activities[userKey].slice(0, 50);
    localStorage.setItem('carvfi_activities', JSON.stringify(activities));
  },

  // دالة جديدة للتحقق من تسجيل الدخول
  isUserLoggedIn: () => {
    return !!localStorage.getItem('carvfi_current_user');
  },

  // دالة جديدة للحصول على بيانات المستخدم الحالي
  getCurrentUserData: () => {
    return StorageService.getCurrentUser();
  }
};

const AppContent = () => {
  const { isConnected, publicKey, balance, walletName, connectWallet, disconnectWallet } = useWallet();
  const [user, setUser] = useState(null);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [activeTab, setActiveTab] = useState('dashboard');
  const navigate = useNavigate();

  useEffect(() => {
    if (isConnected && publicKey) {
      const savedUser = StorageService.getCurrentUser();
      if (savedUser && savedUser.walletAddress === publicKey) {
        const newStreak = StorageService.updateStreak(publicKey);
        const updatedUser = {
          ...savedUser,
          streak: newStreak || savedUser.streak
        };
        setUser(updatedUser);
        
        if (newStreak > 0) {
          StorageService.saveActivity(publicKey, {
            type: 'login',
            description: `Daily login - Streak: ${newStreak} days`,
            points: 10
          });
          StorageService.updatePoints(publicKey, 10);
        }
      } else {
        setShowAuthModal(true);
        setUser(null);
      }
    } else {
      setUser(null);
      setShowAuthModal(false);
    }
  }, [isConnected, publicKey]);

  const handleAuthSuccess = (userData) => {
    const userWithStats = {
      walletAddress: publicKey,
      type: 'solana',
      walletName: walletName,
      username: userData.username,
      firstName: userData.firstName,
      lastName: userData.lastName,
      email: userData.email,
      carvPlayUsername: userData.carvPlayUsername,
      carvUID: userData.carvUID,
      twitter: userData.twitter,
      telegram: userData.telegram,
      avatar: userData.avatar,
      points: 50,
      streak: 1,
      level: 1,
      loginCount: 1,
      lastLogin: new Date().toISOString(),
      createdAt: new Date().toISOString(),
      lastUpdated: new Date().toISOString()
    };
    
    StorageService.saveUser(userWithStats);
    StorageService.saveActivity(publicKey, {
      type: 'registration',
      description: `New user registered successfully`,
      points: 50
    });
    
    const updatedUser = StorageService.getUser(publicKey);
    setUser(updatedUser);
    setShowAuthModal(false);
    
    // الانتقال التلقائي إلى صفحة Rewards Dashboard
    navigate('/rewards');
  };

  const handleConnectWallet = async () => {
    try {
      await connectWallet('backpack');
    } catch (error) {
      console.error('❌ Failed to connect wallet:', error);
    }
  };

  const handleLogout = () => {
    disconnectWallet();
    setUser(null);
    localStorage.removeItem('carvfi_current_user');
    navigate('/');
  };

  // شاشة الترحيب قبل الربط
  if (!isConnected) {
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
              
              <p className="cta-subtext">
                Join the future of social finance on Carv SVM
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // شاشة إكمال التسجيل
  if (isConnected && publicKey && !user) {
    return (
      <div className="modern-app">
        <AuthModal 
          isOpen={true}
          onClose={() => disconnectWallet()}
          onAuthSuccess={handleAuthSuccess}
          walletAddress={publicKey}
        />
        <div className="hero-section">
          <div className="hero-background">
            <div className="hero-content">
              <div className="loading-state">
                <div className="loading-spinner"></div>
                <h2>Almost There! 🚀</h2>
                <p>Complete your profile to unlock CARVFi</p>
                <div className="wallet-preview">
                  <div className="wallet-badge">
                    <span className="badge-icon">🎒</span>
                    Connected with {walletName}
                  </div>
                  <p className="wallet-address">{publicKey?.slice(0, 8)}...{publicKey?.slice(-6)}</p>
                </div>
              </div>
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
            <button
              className={`nav-item ${activeTab === 'social' ? 'active' : ''}`}
              onClick={() => setActiveTab('social')}
            >
              <span className="nav-icon">🤝</span>
              <span className="nav-label">Social</span>
            </button>
          </div>
        </nav>

        {/* Main Content with Routes */}
        <main className="modern-main">
          <div className="main-container">
            <Routes>
              {/* Dashboard Route */}
              <Route path="/" element={<DashboardView user={user} balance={balance} walletName={walletName} publicKey={publicKey} />} />
              
              {/* Rewards Dashboard Route */}
              <Route path="/rewards" element={<RewardsDashboard user={user} />} />
              
              {/* User Profile Route */}
              <Route path="/profile" element={<UserProfile user={user} />} />
              
              {/* Fallback to Dashboard */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </div>
        </main>

        {/* Auth Modal */}
        {showAuthModal && (
          <AuthModal
            isOpen={showAuthModal}
            onClose={() => setShowAuthModal(false)}
            onAuthSuccess={handleAuthSuccess}
            walletAddress={publicKey}
          />
        )}
      </div>
    );
  }

  return null;
};

// Dashboard Component (المحتوى الأصلي)
const DashboardView = ({ user, balance, walletName, publicKey }) => {
  return (
    <>
      {/* Welcome Section */}
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

      {/* Dashboard Grid */}
      <div className="dashboard-grid">
        
        {/* Profile Card */}
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

        {/* Wallet Card */}
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

        {/* Quick Actions */}
        <div className="dashboard-card actions-card">
          <div className="card-header">
            <h3>⚡ Quick Actions</h3>
          </div>
          <div className="card-content">
            <div className="actions-grid">
              <button className="action-btn">
                <span className="action-icon">🤖</span>
                AI Assistant
              </button>
              <button className="action-btn">
                <span className="action-icon">💰</span>
                Earn Rewards
              </button>
              <button className="action-btn">
                <span className="action-icon">🛡️</span>
                Security Check
              </button>
              <button className="action-btn">
                <span className="action-icon">🌐</span>
                Social Feed
              </button>
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="dashboard-card activity-card">
          <div className="card-header">
            <h3>📈 Recent Activity</h3>
          </div>
          <div className="card-content">
            <div className="activity-list">
              <div className="activity-item">
                <div className="activity-icon">🎉</div>
                <div className="activity-content">
                  <p>Account Created</p>
                  <span>+50 points</span>
                </div>
              </div>
              <div className="activity-item">
                <div className="activity-icon">🔗</div>
                <div className="activity-content">
                  <p>Wallet Connected</p>
                  <span>Now</span>
                </div>
              </div>
              <div className="activity-item">
                <div className="activity-icon">🔥</div>
                <div className="activity-content">
                  <p>Daily Login</p>
                  <span>+10 points</span>
                </div>
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