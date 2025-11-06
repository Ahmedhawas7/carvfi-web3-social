import React, { useState, useEffect } from 'react';
import { WalletProvider, useWallet } from './contexts/WalletContext';
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
    console.log('💾 User saved to storage:', users[userKey]);
  },

  // جلب بيانات المستخدم
  getUser: (walletAddress) => {
    const users = JSON.parse(localStorage.getItem('carvfi_users') || '{}');
    return users[walletAddress?.toLowerCase()];
  },

  // جلب المستخدم الحالي
  getCurrentUser: () => {
    const user = JSON.parse(localStorage.getItem('carvfi_current_user') || 'null');
    console.log('📂 Current user from storage:', user);
    return user;
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

// المكون الرئيسي للتطبيق
const AppContent = () => {
  const { isConnected, publicKey, balance, walletName, connectWallet, disconnectWallet } = useWallet();
  const [user, setUser] = useState(null);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [showAIChat, setShowAIChat] = useState(false);

  // مزامنة حالة المحفظة مع نظام المستخدم
  useEffect(() => {
    console.log('🔄 Wallet state changed:', { isConnected, publicKey });
    
    if (isConnected && publicKey) {
      const savedUser = StorageService.getCurrentUser();
      console.log('💾 Saved user from storage:', savedUser);
      
      if (savedUser && savedUser.walletAddress === publicKey) {
        // المستخدم مسجل مسبقاً - تحديث البيانات
        console.log('✅ Existing user found - updating data');
        const newStreak = StorageService.updateStreak(publicKey);
        const updatedUser = {
          ...savedUser,
          streak: newStreak || savedUser.streak
        };
        setUser(updatedUser);
        console.log('👤 User state set:', updatedUser);
        
        // تسجيل نشاط الدخول
        if (newStreak > 0) {
          StorageService.saveActivity(publicKey, {
            type: 'login',
            description: `Daily login - Streak: ${newStreak} days`,
            points: 10
          });
          StorageService.updatePoints(publicKey, 10);
        }
      } else {
        // مستخدم جديد - فتح مودال التسجيل
        console.log('🆕 New user detected - opening auth modal');
        setShowAuthModal(true);
        setUser(null);
      }
    } else {
      // المحفظة غير متصلة
      console.log('🔌 Wallet disconnected');
      setUser(null);
      setShowAuthModal(false);
    }
  }, [isConnected, publicKey]);

  // مراقبة حالة الـ auth modal
  useEffect(() => {
    console.log('🎯 Auth modal state changed:', showAuthModal);
  }, [showAuthModal]);

  const handleAuthSuccess = (userData) => {
    console.log('🎉 Authentication successful:', userData);
    
    const userWithStats = {
      walletAddress: publicKey,
      type: 'solana',
      username: userData.username || `user_${publicKey.slice(2, 8)}`,
      displayName: userData.displayName || '',
      bio: userData.bio || '',
      walletName: walletName
    };
    
    // حفظ في التخزين المحلي
    StorageService.saveUser(userWithStats);
    
    // تحديث streak
    const newStreak = StorageService.updateStreak(publicKey);
    
    // تسجيل نشاط الدخول
    StorageService.saveActivity(publicKey, {
      type: 'login',
      description: `User logged in successfully - Streak: ${newStreak} days`,
      points: 10
    });
    
    // تحديث النقاط
    StorageService.updatePoints(publicKey, 10);
    
    // تحميل بيانات المستخدم المحدثة
    const updatedUser = StorageService.getUser(publicKey);
    
    setUser(updatedUser);
    setShowAuthModal(false);
    
    console.log('✅ User registration completed:', updatedUser);
  };

  const handleLogout = () => {
    console.log('🚪 User logging out');
    disconnectWallet();
    setUser(null);
    localStorage.removeItem('carvfi_current_user');
  };

  const handleConnectWallet = async () => {
    try {
      console.log('🔗 Connecting wallet...');
      await connectWallet('backpack');
    } catch (error) {
      console.error('❌ Failed to connect wallet:', error);
    }
  };

  // إذا لم يكن هناك محفظة متصلة، عرض شاشة الترحيب
  if (!isConnected) {
    return (
      <div className="app">
        <div className="auth-background">
          <div className="welcome-content">
            <h1>🌐 CARVFi</h1>
            <p>Web3 Social Platform on Carv SVM</p>
            <div className="welcome-features">
              <div className="feature">🤖 AI Assistant</div>
              <div className="feature">💰 Rewards System</div>
              <div className="feature">🛡️ Bot Protection</div>
              <div className="feature">🎒 BackPack Support</div>
            </div>
            <button 
              className="btn btn-primary connect-btn"
              onClick={handleConnectWallet}
            >
              Connect BackPack Wallet
            </button>
            <p className="wallet-info">
              Connect your BackPack wallet to start earning CARV rewards
            </p>
          </div>
        </div>
      </div>
    );
  }

  // إذا كان المستخدم متصلاً ولكن لم يكمل التسجيل
  if (isConnected && publicKey && !user) {
    console.log('🚨 Rendering auth modal state');
    return (
      <div className="app">
        <AuthModal 
          isOpen={true}
          onClose={() => {
            console.log('❌ Auth modal closed without completion');
            // إذا المستخدم سكر المودال من غير ما يكمل, نفضي الاتصال
            disconnectWallet();
          }} 
          onAuthSuccess={handleAuthSuccess}
          walletAddress={publicKey}
        />
        <div className="auth-background">
          <div className="welcome-content">
            <h1>🌐 CARVFi</h1>
            <p>Complete your profile to continue</p>
            <div className="connected-wallet">
              <p>Connected: {publicKey?.slice(0, 8)}...{publicKey?.slice(-6)}</p>
              <p>Wallet: {walletName}</p>
              <p>Balance: {parseFloat(balance).toFixed(4)} CARV</p>
              <p style={{color: '#f59e0b', fontSize: '14px', marginTop: '10px'}}>
                ⚠️ Please complete your profile in the modal above
              </p>
              
              {/* زر للمساعدة في حالة وجود مشكلة */}
              <button 
                onClick={() => {
                  console.log('🔄 Manual refresh triggered');
                  const savedUser = StorageService.getCurrentUser();
                  console.log('Current saved user:', savedUser);
                  if (savedUser && savedUser.walletAddress === publicKey) {
                    setUser(savedUser);
                    console.log('✅ User manually set from storage');
                  }
                }}
                style={{
                  background: '#3b82f6',
                  color: 'white',
                  border: 'none',
                  padding: '8px 16px',
                  borderRadius: '6px',
                  fontSize: '12px',
                  marginTop: '10px',
                  cursor: 'pointer'
                }}
              >
                Refresh Status
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // الواجهة الرئيسية عندما يكون المستخدم متصلاً ومسجلاً
  if (isConnected && publicKey && user) {
    console.log('🎯 Rendering main app with user:', user);
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
                {publicKey ? `${publicKey.substring(0, 6)}...${publicKey.substring(publicKey.length - 4)}` : 'No wallet'}
              </span>
              <span className="network-badge">
                {walletName || 'Solana'}
              </span>
              <span className="balance-info">
                {parseFloat(balance).toFixed(4)} CARV
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
              {tab === 'dashboard' ? 'Dashboard' : 
               tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
          <button
            className={`nav-btn ${showAIChat ? 'active' : ''}`}
            onClick={() => setShowAIChat(!showAIChat)}
          >
            AI Assistant
          </button>
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

  // شاشة التحميل
  return (
    <div className="app">
      <div className="auth-background">
        <div className="welcome-content">
          <h1>🌐 CARVFi</h1>
          <p>Loading your profile...</p>
          <div className="connected-wallet">
            <p>Connected: {publicKey?.slice(0, 8)}...{publicKey?.slice(-6)}</p>
            <p>Please wait...</p>
          </div>
        </div>
      </div>
    </div>
  );
};

// المكون الرئيسي المغلف بالـ Provider
function App() {
  return (
    <WalletProvider>
      <AppContent />
    </WalletProvider>
  );
}

export default App;