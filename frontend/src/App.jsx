import React, { useState, useEffect } from 'react';
import AuthModal from './components/AuthModal';
import UserProfile from './components/UserProfile';
import AIChat from './components/AIChat';
import RewardsDashboard from './components/RewardsDashboard';
import BotProtection from './components/BotProtection';
import './App.css';

function App() {
  const [user, setUser] = useState(null);
  const [showAuthModal, setShowAuthModal] = useState(true); // دائماً نبدأ بفتح ال modal
  const [activeTab, setActiveTab] = useState('profile');
  const [showAIChat, setShowAIChat] = useState(false);

  useEffect(() => {
    // تحقق من وجود user محفوظ
    const savedUser = localStorage.getItem('carvfi_user');
    if (savedUser) {
      try {
        const userData = JSON.parse(savedUser);
        setUser(userData);
        setShowAuthModal(false); // إغلق ال modal إذا وجد user
      } catch (error) {
        console.error('Error parsing saved user:', error);
        localStorage.removeItem('carvfi_user');
      }
    }
  }, []);

  const handleAuthSuccess = (userData) => {
    console.log('Auth success:', userData);
    setUser(userData);
    localStorage.setItem('carvfi_user', JSON.stringify(userData));
    setShowAuthModal(false);
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('carvfi_user');
    setShowAuthModal(true);
  };

  // إذا كان ال modal مفتوح، اعرض فقط ال modal وشاشة التحميل
  if (showAuthModal) {
    return (
      <div className="app">
        <AuthModal 
          isOpen={true}
          onClose={() => {}} // لا تسمح بالإغلاق إلا بالتسجيل
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

  // إذا كان فيه user، اعرض الواجهة الرئيسية
  return (
    <div className="app">
      {/* Header */}
      <header className="header">
        <div className="header-left">
          <h1 className="logo">🌐 CARVFi</h1>
          <p className="tagline">Web3 Social Platform</p>
        </div>
        
        <div className="header-right">
          <div className="user-info">
            <span className="user-wallet">
              {user?.type === 'evm' 
                ? `EVM: ${user?.address?.substring(0, 6)}...${user?.address?.substring(38)}`
                : `SOL: ${user?.address?.substring(0, 6)}...`
              }
            </span>
            <span className="network-badge">
              {user?.type === 'evm' ? 'Ethereum' : 'Solana'}
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

      {/* Navigation */}
      <nav className="navigation">
        {['profile', 'rewards', 'protection'].map(tab => (
          <button
            key={tab}
            className={`nav-btn ${activeTab === tab ? 'active' : ''}`}
            onClick={() => setActiveTab(tab)}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </nav>

      {/* Main Content */}
      <main className="main-content">
        {activeTab === 'profile' && <UserProfile user={user} />}
        {activeTab === 'rewards' && <RewardsDashboard user={user} />}
        {activeTab === 'protection' && <BotProtection user={user} />}
      </main>

      {/* AI Chat */}
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
