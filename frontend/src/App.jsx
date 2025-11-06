import React, { useState, useEffect } from 'react';
import { WalletProvider, useWallet } from './contexts/WalletContext';
import AuthModal from './components/AuthModal';
import './App.css';

// خدمة تخزين محلية
const StorageService = {
  saveUser: (userData) => {
    const users = JSON.parse(localStorage.getItem('carvfi_users') || '{}');
    const userKey = userData.walletAddress?.toLowerCase();
    
    users[userKey] = {
      ...userData,
      points: 0,
      streak: 1,
      level: 1,
      createdAt: new Date().toISOString()
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
  }
};

const AppContent = () => {
  const { isConnected, publicKey, balance, walletName, connectWallet, disconnectWallet } = useWallet();
  const [user, setUser] = useState(null);
  const [showAuthModal, setShowAuthModal] = useState(false);

  useEffect(() => {
    if (isConnected && publicKey) {
      const savedUser = StorageService.getCurrentUser();
      if (savedUser && savedUser.walletAddress === publicKey) {
        setUser(savedUser);
      } else {
        setShowAuthModal(true);
      }
    } else {
      setUser(null);
    }
  }, [isConnected, publicKey]);

  const handleAuthSuccess = (userData) => {
    const userWithStats = {
      walletAddress: publicKey,
      type: 'solana',
      username: userData.username,
      walletName: walletName
    };
    
    StorageService.saveUser(userWithStats);
    const updatedUser = StorageService.getUser(publicKey);
    setUser(updatedUser);
    setShowAuthModal(false);
  };

  const handleConnectWallet = async () => {
    await connectWallet('backpack');
  };

  if (!isConnected) {
    return (
      <div className="app">
        <div className="auth-background">
          <div className="welcome-content">
            <h1>🌐 CARVFi</h1>
            <p>Web3 Social Platform on Carv SVM</p>
            <button className="btn btn-primary connect-btn" onClick={handleConnectWallet}>
              Connect BackPack Wallet
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (isConnected && publicKey && !user) {
    return (
      <div className="app">
        <AuthModal 
          isOpen={true}
          onClose={() => disconnectWallet()}
          onAuthSuccess={handleAuthSuccess}
          walletAddress={publicKey}
        />
        <div className="auth-background">
          <div className="welcome-content">
            <h1>🌐 CARVFi</h1>
            <p>Complete your profile</p>
            <p>Connected: {publicKey?.slice(0, 8)}...{publicKey?.slice(-6)}</p>
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
              {publicKey?.slice(0, 6)}...{publicKey?.slice(-4)}
            </span>
            <span className="balance-info">
              {balance} CARV
            </span>
          </div>
          <button onClick={() => disconnectWallet()}>
            Logout
          </button>
        </div>
      </header>

      <main className="main-content">
        <div className="welcome-message">
          <h2>Welcome to CARVFi! 🎉</h2>
          <p>Your wallet is connected and ready to use.</p>
          <p>Address: {publicKey}</p>
          <p>Balance: {balance} CARV</p>
          <p>Network: Carv SVM Testnet</p>
        </div>
      </main>
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