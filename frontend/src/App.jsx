import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { WalletProvider, useWallet } from './contexts/WalletContext';
import AuthModal from './components/AuthModal';
import UserProfile from './components/UserProfile';
import AIChat from './components/AIChat';
import RewardsDashboard from './components/RewardsDashboard';
import BotProtection from './components/BotProtection';
import './App.css';

// نفس كود StorageService بتاعك بالضبط هنا ✅ (ما نغيروش)

// ... (انسخ هنا نفس StorageService اللي في ملفك الحالي بالكامل)

const AppContent = () => {
  const { isConnected, publicKey, balance, walletName, connectWallet, disconnectWallet } = useWallet();
  const [user, setUser] = useState(null);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [showAIChat, setShowAIChat] = useState(false);

  useEffect(() => {
    if (isConnected && publicKey) {
      const savedUser = StorageService.getCurrentUser();
      if (savedUser && savedUser.walletAddress === publicKey) {
        const newStreak = StorageService.updateStreak(publicKey);
        const updatedUser = { ...savedUser, streak: newStreak || savedUser.streak };
        setUser(updatedUser);
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
      username: userData.username || `user_${publicKey.slice(2, 8)}`,
      displayName: userData.displayName || '',
      bio: userData.bio || '',
      walletName: walletName
    };
    StorageService.saveUser(userWithStats);
    const newStreak = StorageService.updateStreak(publicKey);
    StorageService.saveActivity(publicKey, {
      type: 'login',
      description: `User logged in successfully - Streak: ${newStreak} days`,
      points: 10
    });
    StorageService.updatePoints(publicKey, 10);
    const updatedUser = StorageService.getUser(publicKey);
    setUser(updatedUser);
    setShowAuthModal(false);
  };

  const handleLogout = () => {
    disconnectWallet();
    setUser(null);
    localStorage.removeItem('carvfi_current_user');
  };

  const handleConnectWallet = async () => {
    try {
      await connectWallet('backpack');
    } catch (error) {
      console.error('❌ Failed to connect wallet:', error);
    }
  };

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
            <button className="btn btn-primary connect-btn" onClick={handleConnectWallet}>
              Connect BackPack Wallet
            </button>
            <p className="wallet-info">Connect your BackPack wallet to start earning CARV rewards</p>
          </div>
        </div>
      </div>
    );
  }

  if (isConnected && publicKey && !user) {
    return (
      <AuthModal
        isOpen={true}
        onClose={() => disconnectWallet()}
        onAuthSuccess={handleAuthSuccess}
        walletAddress={publicKey}
      />
    );
  }

  if (isConnected && publicKey && user) {
    return (
      <Router>
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
                <span className="network-badge">{walletName || 'Solana'}</span>
                <span className="balance-info">{parseFloat(balance).toFixed(4)} CARV</span>
                <span style={{ fontSize: '0.7rem', color: '#10b981', marginTop: '2px' }}>
                  {user?.points || 0} points | Streak: {user?.streak || 0} days
                </span>
              </div>
              <button className="btn btn-logout" onClick={handleLogout}>Logout</button>
              <button className="btn btn-ai" onClick={() => setShowAIChat(!showAIChat)}>🤖 AI</button>
            </div>
          </header>

          <Routes>
            <Route
              path="/"
              element={
                <>
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

                  {showAIChat && <AIChat user={user} onClose={() => setShowAIChat(false)} />}
                </>
              }
            />

            {/* صفحة المكافآت المستقلة */}
            <Route path="/rewards" element={<RewardsDashboard user={user} storageService={StorageService} />} />

            {/* أي مسار غير معروف يرجع للصفحة الرئيسية */}
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </div>
      </Router>
    );
  }

  return null;
};

function App() {
  return (
    <WalletProvider>
      <AppContent />
    </WalletProvider>
  );
}

export default App;