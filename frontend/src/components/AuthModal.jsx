// frontend/src/components/AuthModal.jsx
import React, { useState } from 'react';
import { useWallet } from '../contexts/WalletContext';

const AuthModal = ({ isOpen, onClose }) => {
  const { 
    isConnected, 
    publicKey, 
    balance, 
    isLoading, 
    error, 
    connectWallet, 
    disconnectWallet,
    isBackPackInstalled 
  } = useWallet();

  const [activeTab, setActiveTab] = useState('connect');

  if (!isOpen) return null;

  const formatPublicKey = (pubkey) => {
    return `${pubkey.slice(0, 6)}...${pubkey.slice(-4)}`;
  };

  const handleConnect = async () => {
    await connectWallet();
  };

  const handleDisconnect = () => {
    disconnectWallet();
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl p-6 w-full max-w-md">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900">
            {isConnected ? 'Wallet Connected' : 'Connect Wallet'}
          </h2>
          <button 
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-xl"
          >
            ✕
          </button>
        </div>

        {/* Tabs */}
        {!isConnected && (
          <div className="flex mb-6 border-b">
            <button
              className={`flex-1 py-3 font-semibold text-lg ${
                activeTab === 'connect' 
                  ? 'text-purple-600 border-b-2 border-purple-600' 
                  : 'text-gray-500'
              }`}
              onClick={() => setActiveTab('connect')}
            >
              Connect
            </button>
          </div>
        )}

        {/* Content */}
        <div className="space-y-6">
          {!isConnected ? (
            // Connect Wallet State
            <div>
              {!isBackPackInstalled ? (
                <div className="text-center space-y-4">
                  <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto">
                    <span className="text-2xl">⚠️</span>
                  </div>
                  <p className="text-red-600 text-lg font-semibold">BackPack Wallet Not Installed</p>
                  <p className="text-gray-600 mb-4">
                    Please install BackPack wallet to use CARVFi on Carv SVM network
                  </p>
                  <a 
                    href="https://www.backpack.app/" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="inline-block bg-gradient-to-r from-purple-600 to-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:from-purple-700 hover:to-blue-700 transition-all"
                  >
                    Download BackPack
                  </a>
                </div>
              ) : (
                <div className="space-y-6">
                  <div className="bg-gradient-to-r from-purple-50 to-blue-50 p-6 rounded-xl border border-purple-200">
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                        <span className="text-xl">🎒</span>
                      </div>
                      <div>
                        <h3 className="font-bold text-gray-900 text-lg">BackPack Wallet</h3>
                        <p className="text-gray-600">
                          Connect to your BackPack wallet for Carv SVM
                        </p>
                      </div>
                    </div>
                  </div>

                  {error && (
                    <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-lg">
                      <div className="flex items-center">
                        <span className="text-lg mr-2">❌</span>
                        <span className="font-medium">{error}</span>
                      </div>
                    </div>
                  )}

                  <button
                    onClick={handleConnect}
                    disabled={isLoading}
                    className="w-full bg-gradient-to-r from-purple-600 to-blue-600 text-white py-4 rounded-xl font-semibold text-lg hover:from-purple-700 hover:to-blue-700 disabled:from-gray-400 disabled:to-gray-500 disabled:cursor-not-allowed transition-all transform hover:scale-105 disabled:scale-100"
                  >
                    {isLoading ? (
                      <div className="flex items-center justify-center">
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                        Connecting...
                      </div>
                    ) : (
                      'Connect BackPack Wallet'
                    )}
                  </button>
                </div>
              )}
            </div>
          ) : (
            // Connected State
            <div className="space-y-6">
              <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-xl p-6">
                <div className="flex items-center justify-between mb-3">
                  <span className="font-bold text-green-800 text-lg">Connected Successfully</span>
                  <div className="w-4 h-4 bg-green-500 rounded-full animate-pulse"></div>
                </div>
                <div className="bg-white rounded-lg p-3">
                  <p className="text-green-900 font-mono text-sm break-all">
                    {publicKey}
                  </p>
                </div>
              </div>

              <div className="bg-gray-50 rounded-xl p-6 space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600 font-medium">Balance:</span>
                  <span className="font-bold text-xl text-gray-900">
                    {parseFloat(balance).toFixed(4)} CARV
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600 font-medium">Network:</span>
                  <span className="font-semibold text-purple-600 bg-purple-100 px-3 py-1 rounded-full">
                    Carv SVM
                  </span>
                </div>
              </div>

              <div className="flex space-x-3">
                <button
                  onClick={() => navigator.clipboard.writeText(publicKey)}
                  className="flex-1 bg-gray-200 text-gray-800 py-3 rounded-xl font-medium hover:bg-gray-300 transition-colors flex items-center justify-center"
                >
                  <span className="mr-2">📋</span>
                  Copy Address
                </button>
                <button
                  onClick={handleDisconnect}
                  className="flex-1 bg-red-600 text-white py-3 rounded-xl font-medium hover:bg-red-700 transition-colors flex items-center justify-center"
                >
                  <span className="mr-2">🚪</span>
                  Disconnect
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="mt-6 pt-6 border-t border-gray-200">
          <p className="text-xs text-gray-500 text-center">
            By connecting your wallet, you agree to our Terms of Service and Privacy Policy
          </p>
        </div>
      </div>
    </div>
  );
};

export default AuthModal;