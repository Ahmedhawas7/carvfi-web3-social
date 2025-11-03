import React, { useState } from 'react';

const AuthModal = ({ isOpen, onClose, onAuthSuccess }) => {
  const [activeTab, setActiveTab] = useState('evm');
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const connectEVM = async () => {
    try {
      setIsConnecting(true);
      setError('');
      
      // طريقة أفضل للتحقق من وجود MetaMask
      if (typeof window.ethereum !== 'undefined') {
        console.log('MetaMask detected:', window.ethereum);
        
        // طلب الإذن للوصول إلى الحسابات
        const accounts = await window.ethereum.request({
          method: 'eth_requestAccounts'
        });
        
        console.log('Connected accounts:', accounts);
        
        if (accounts.length > 0) {
          onAuthSuccess({
            type: 'evm',
            address: accounts[0],
            provider: window.ethereum
          });
        } else {
          setError('No accounts found. Please check your MetaMask.');
        }
      } else {
        setError('MetaMask not detected. Please install MetaMask or use a Web3 browser.');
        
        // عرض رسالة مساعدة
        const installMetaMask = confirm(
          'MetaMask not found. Would you like to install it?'
        );
        if (installMetaMask) {
          window.open('https://metamask.io/download.html', '_blank');
        }
      }
    } catch (error) {
      console.error('Error connecting EVM wallet:', error);
      
      if (error.code === 4001) {
        setError('Connection rejected. Please approve the connection in MetaMask.');
      } else {
        setError('Failed to connect wallet: ' + error.message);
      }
    } finally {
      setIsConnecting(false);
    }
  };

  const connectSolana = async () => {
    try {
      setIsConnecting(true);
      setError('');
      
      // التحقق من وجود Phantom
      const provider = window.solana || window.phantom;
      
      if (provider) {
        console.log('Solana wallet detected:', provider);
        
        if (!provider.isConnected) {
          await provider.connect();
        }
        
        onAuthSuccess({
          type: 'solana',
          address: provider.publicKey.toString(),
          provider: provider
        });
      } else {
        setError('Phantom wallet not detected. Please install Phantom.');
        
        const installPhantom = confirm(
          'Phantom wallet not found. Would you like to install it?'
        );
        if (installPhantom) {
          window.open('https://phantom.app/', '_blank');
        }
      }
    } catch (error) {
      console.error('Error connecting Solana wallet:', error);
      setError('Failed to connect Solana wallet: ' + error.message);
    } finally {
      setIsConnecting(false);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="modal-header">
          <h2>Connect Wallet</h2>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>

        {/* عرض الأخطاء */}
        {error && (
          <div className="error-message">
            ⚠️ {error}
          </div>
        )}

        <div className="modal-tabs">
          <button 
            className={`tab-btn ${activeTab === 'evm' ? 'active' : ''}`}
            onClick={() => setActiveTab('evm')}
          >
            EVM Chains
          </button>
          <button 
            className={`tab-btn ${activeTab === 'solana' ? 'active' : ''}`}
            onClick={() => setActiveTab('solana')}
          >
            Solana
          </button>
        </div>

        <div className="modal-body">
          {activeTab === 'evm' && (
            <div className="wallet-options">
              <div className="wallet-option">
                <div className="wallet-icon">🦊</div>
                <div className="wallet-info">
                  <h3>MetaMask</h3>
                  <p>Connect to Ethereum and EVM chains</p>
                  <div className="wallet-status">
                    {typeof window.ethereum !== 'undefined' 
                      ? '✅ Detected' 
                      : '❌ Not detected'
                    }
                  </div>
                </div>
                <button 
                  className="btn btn-connect"
                  onClick={connectEVM}
                  disabled={isConnecting || typeof window.ethereum === 'undefined'}
                >
                  {isConnecting ? 'Connecting...' : 'Connect'}
                </button>
              </div>

              <div className="wallet-option">
                <div className="wallet-icon">🟠</div>
                <div className="wallet-info">
                  <h3>WalletConnect</h3>
                  <p>Connect with QR code</p>
                </div>
                <button className="btn btn-connect" disabled>
                  Coming Soon
                </button>
              </div>
            </div>
          )}

          {activeTab === 'solana' && (
            <div className="wallet-options">
              <div className="wallet-option">
                <div className="wallet-icon">👻</div>
                <div className="wallet-info">
                  <h3>Phantom</h3>
                  <p>Connect to Solana network</p>
                  <div className="wallet-status">
                    {(window.solana || window.phantom) 
                      ? '✅ Detected' 
                      : '❌ Not detected'
                    }
                  </div>
                </div>
                <button 
                  className="btn btn-connect"
                  onClick={connectSolana}
                  disabled={isConnecting || !(window.solana || window.phantom)}
                >
                  {isConnecting ? 'Connecting...' : 'Connect'}
                </button>
              </div>

              <div className="wallet-option">
                <div className="wallet-icon">🔷</div>
                <div className="wallet-info">
                  <h3>Solflare</h3>
                  <p>Connect to Solana network</p>
                </div>
                <button className="btn btn-connect" disabled>
                  Coming Soon
                </button>
              </div>
            </div>
          )}
        </div>

        <div className="modal-footer">
          <p className="disclaimer">
            By connecting your wallet, you agree to our Terms of Service and Privacy Policy
          </p>
        </div>
      </div>
    </div>
  );
};

export default AuthModal;
