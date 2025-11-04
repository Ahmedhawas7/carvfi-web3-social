import React, { useState, useEffect } from 'react';
import AuthModal from './components/AuthModal';
import UserProfile from './components/UserProfile';
import AIChat from './components/AIChat';
import RewardsDashboard from './components/RewardsDashboard';
import BotProtection from './components/BotProtection';
import './App.css';

// خدمة تخزين محلية محسنة
const StorageService = {
  // حفظ بيانات المستخدم مع جميع الإحصائيات
  saveUser: (userData) => {
    const users = JSON.parse(localStorage.getItem('carvfi_users') || '{}');
    const userKey = userData.walletAddress?.toLowerCase();
    
    if (users[userKey]) {
      // تحديث المستخدم الموجود
      users[userKey] = {
        ...users[userKey],
        ...userData,
        lastUpdated: new Date().toISOString()
      };
    } else {
      // إنشاء مستخدم جديد
      users[userKey] = {
        ...userData,
        points: 0,
        streak: 1,
        level: 1,
        loginCount: 1,
        lastLogin: new Date().toISOString(),
        createdAt: new Date().toISOString(),
        lastUpdated: new Date().toISOString()
      };
    }
    
    localStorage.setItem('carvfi_users', JSON.stringify(users));
    localStorage.setItem('carvfi_current_user', JSON.stringify(users[userKey]));
  },

  // جلب بيانات المستخدم
  getUser: (walletAddress) => {
    const users = JSON.parse(localStorage.getItem('carvfi_users') || '{}');
    return users[walletAddress?.toLowerCase()];
  },

  // جلب المستخدم الحالي
  getCurrentUser: () => {
    return JSON.parse(localStorage.getItem('carvfi_current_user') || 'null');
  },

  // حفظ النشاطات
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
    
    // حفظ آخر 50 نشاط فقط
    activities[userKey] = activities[userKey].slice(0, 50);
    localStorage.setItem('carvfi_activities', JSON.stringify(activities));
  },

  // جلب النشاطات
  getActivities: (walletAddress) => {
    const activities = JSON.parse(localStorage.getItem('carvfi_activities') || '{}');
    return activities[walletAddress?.toLowerCase()] || [];
  },

  // تحديث النقاط
  updatePoints: (walletAddress, pointsToAdd) => {
    const users = JSON.parse(localStorage.getItem('carvfi_users') || '{}');
    const userKey = walletAddress?.toLowerCase();
    
    if (users[userKey]) {
      users[userKey].points = (users[userKey].points || 0) + pointsToAdd;
      users[userKey].lastUpdated = new Date().toISOString();
      localStorage.setItem('carvfi_users', JSON.stringify(users));
      
      // تحديث المستخدم الحالي أيضاً
      const currentUser = StorageService.getCurrentUser();
      if (currentUser && currentUser.walletAddress?.toLowerCase() === userKey) {
        currentUser.points = users[userKey].points;
        localStorage.setItem('carvfi_current_user', JSON.stringify(currentUser));
      }
      
      return users[userKey].points;
    }
    return 0;
  },

  // تحديث streak
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
        localStorage.setItem('carvfi_users', JSON.stringify(users));
        
        // تحديث المستخدم الحالي
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

  // الحصول على جميع المستخدمين (للتطوير)
  getAllUsers: () => {
    return JSON.parse(localStorage.getItem('carvfi_users') || '{}');
  }
};

function App() {
  const [user, setUser] = useState(null);
  const [showAuthModal, setShowAuthModal] = useState(true);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [showAIChat, setShowAIChat] = useState(false);

  useEffect(() => {
    const savedUser = StorageService.getCurrentUser();
    if (savedUser) {
      // تحديث streak عند الدخول
      const newStreak = StorageService.updateStreak(savedUser.walletAddress);
      
      setUser({
        ...savedUser,
        streak: newStreak || savedUser.streak
      });
      setShowAuthModal(false);
      
      // تسجيل نشاط الدخول
      if (newStreak > 0) {
        StorageService.saveActivity(savedUser.walletAddress, {
          type: 'login',
          description: `Daily login - Streak: ${newStreak} days`,
          points: 10
        });
        StorageService.updatePoints(savedUser.walletAddress, 10);
      }
    }
  }, []);

  const handleAuthSuccess = (userData) => {
    console.log('Authentication successful:', userData);
    
    const userWithStats = {
      walletAddress: userData.address,
      type: userData.type,
      username: `user_${userData.address.slice(2, 8)}`
    };
    
    // حفظ في التخزين المحلي
    StorageService.saveUser(userWithStats);
    
    // تحديث streak
    const newStreak = StorageService.updateStreak(userData.address);
    
    // تسجيل نشاط الدخول
    StorageService.saveActivity(userData.address, {
      type: 'login',
      description: `User logged in successfully - Streak: ${newStreak} days`,
      points: 10
    });
    
    // تحديث النقاط
    const newPoints = StorageService.updatePoints(userData.address, 10);
    
    // تحميل بيانات المستخدم المحدثة
    const updatedUser = StorageService.getUser(userData.address);
    
    setUser(updatedUser);
    setShowAuthModal(false);
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('carvfi_current_user');
    setShowAuthModal(true);
  };

  if (showAuthModal) {
    return (
      <div className="app">
        <AuthModal 
          isOpen={true}
          onClose={() => {}} 
          onAuthSuccess={handleAuthSuccess}
        />
        <div className="auth-background">
          <div className="welcome-content">
            <h1>🌐 CARVFi</h1>
            <p>Web3 Social Platform</p>
            <div className="welcome-features">
              <div className="feature">🤖 AI Assistant</div>
              <div className="feature">💰 Rewards System</div>
              <div className="feature">🛡️ Bot Protection</div>
              <div className="feature">🔗 Multi-Chain Support</div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="app">
      <header className="header">
        <div className="header-left">
          <h1 className="logo">🌐 CARVFi</h1>
          <p className="tagline">Web3 Social Platform</p>
        </div>
        
        <div className="header-right">
          <div className="user-info">
            <span className="user-wallet">
              {user?.walletAddress ? `${user.walletAddress.substring(0, 6)}...${user.walletAddress.substring(38)}` : 'No wallet'}
            </span>
            <span className="network-badge">
              {user?.type === 'evm' ? 'Ethereum' : 'Solana'}
            </span>
            <span style={{fontSize: '0.7rem', color: '#10b981', marginTop: '2px'}}>
              {user?.points || 0} points | Streak: {user?.streak || 0} days
            </span>
          </div>
          <button className="btn btn-logout" onClick={handleLogout}>
            Logout
          </button>
          <button 
            className="btn btn-ai" 
            onClick={() => setShowAIChat(!showAIChat)}
          >
            🤖 AI
          </button>
        </div>
      </header>

      <nav className="navigation">
        {['dashboard', 'profile', 'protection'].map(tab => (
          <button
            key={tab}
            className={`nav-btn ${activeTab === tab ? 'active' : ''}`}
            onClick={() => setActiveTab(tab)}
          >
            {tab === 'dashboard' ? 'Dashboard' : tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </nav>

      <main className="main-content">
        {activeTab === 'dashboard' && <RewardsDashboard user={user} storageService={StorageService} />}
        {activeTab === 'profile' && <UserProfile user={user} storageService={StorageService} />}
        {activeTab === 'protection' && <BotProtection user={user} />}
      </main>

      {showAIChat && (
        <AIChat 
          user={user}
          onClose={() => setShowAIChat(false)}
        />
      )}
    </div>
  );
}

export default App;
