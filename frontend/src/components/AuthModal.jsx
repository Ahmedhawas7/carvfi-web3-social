import React, { useState } from 'react';
import { useWallet } from '../contexts/WalletContext';

const AuthModal = ({ isOpen, onClose }) => {
  const { 
    isConnected, 
    account, 
    balance, 
    isLoading, 
    error, 
    connectWallet, 
    disconnectWallet,
    isMetaMaskInstalled 
  } = useWallet();

  const [activeTab, setActiveTab] = useState('connect');

  if (!isOpen) return null;

  const formatAddress = (address) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const handleConnect = async () => {
    await connectWallet();
  };

  const handleDisconnect = () => {
    disconnectWallet();
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-96 max-w-full">
        {/* Header */}
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-gray-800">
            {isConnected ? 'Wallet Connected' : 'Connect Wallet'}
          </h2>
          <button 
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            ✕
          </button>
        </div>

        {/* Tabs */}
        {!isConnected && (
          <div className="flex mb-4 border-b">
            <button
              className={`flex-1 py-2 font-medium ${
                activeTab === 'connect' 
                  ? 'text-blue-600 border-b-2 border-blue-600' 
                  : 'text-gray-500'
              }`}
              onClick={() => setActiveTab('connect')}
            >
              Connect
            </button>
          </div>
        )}

        {/* Content */}
        <div className="space-y-4">
          {!isConnected ? (
            // Connect Wallet State
            <div>
              {!isMetaMaskInstalled ? (
                <div className="text-center">
                  <p className="text-red-600 mb-4">MetaMask not installed</p>
                  <a 
                    href="https://metamask.io/download/" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="bg-orange-500 text-white px-4 py-2 rounded-lg hover:bg-orange-600 transition-colors"
                  >
                    Install MetaMask
                  </a>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h3 className="font-semibold mb-2">MetaMask</h3>
                    <p className="text-sm text-gray-600">
                      Connect to your MetaMask wallet
                    </p>
                  </div>

                  {error && (
                    <div className="bg-red-50 text-red-700 p-3 rounded-lg text-sm">
                      {error}
                    </div>
                  )}

                  <button
                    onClick={handleConnect}
                    disabled={isLoading}
                    className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
                  >
                    {isLoading ? 'Connecting...' : 'Connect MetaMask'}
                  </button>
                </div>
              )}
            </div>
          ) : (
            // Connected State
            <div className="space-y-4">
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-semibold text-green-800">Connected</span>
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                </div>
                <p className="text-sm text-green-700 break-all">
                  {account}
                </p>
              </div>

              <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Balance:</span>
                  <span className="font-semibold">
                    {parseFloat(balance).toFixed(4)} CARV
                  </span>
                </div>
                <div className="flex justify-between items-center mt-2">
                  <span className="text-gray-600">Network:</span>
                  <span className="font-semibold text-green-600">
                    Carv SVM
                  </span>
                </div>
              </div>

              <div className="flex space-x-2">
                <button
                  onClick={() => navigator.clipboard.writeText(account)}
                  className="flex-1 bg-gray-200 text-gray-700 py-2 rounded-lg hover:bg-gray-300 transition-colors"
                >
                  Copy Address
                </button>
                <button
                  onClick={handleDisconnect}
                  className="flex-1 bg-red-600 text-white py-2 rounded-lg hover:bg-red-700 transition-colors"
                >
                  Disconnect
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="mt-4 pt-4 border-t border-gray-200">
          <p className="text-xs text-gray-500 text-center">
            By connecting, you agree to our Terms of Service
          </p>
        </div>
      </div>
    </div>
  );
};

export default AuthModal;