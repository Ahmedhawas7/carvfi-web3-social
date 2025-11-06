// src/contexts/WalletContext.jsx
import React, { createContext, useContext, useState, useEffect } from 'react';
import solanaService from '../services/web3Service';

const WalletContext = createContext();

export const useWallet = () => {
  const context = useContext(WalletContext);
  if (!context) {
    throw new Error('useWallet must be used within a WalletProvider');
  }
  return context;
};

export const WalletProvider = ({ children }) => {
  const [isConnected, setIsConnected] = useState(false);
  const [publicKey, setPublicKey] = useState(null);
  const [balance, setBalance] = useState('0');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [walletName, setWalletName] = useState(null);

  // Check initial connection status
  useEffect(() => {
    checkInitialConnection();
  }, []);

  const checkInitialConnection = async () => {
    const status = solanaService.getConnectionStatus();
    if (status.isConnected) {
      setIsConnected(true);
      setPublicKey(status.publicKey);
      setWalletName(status.walletName);
      
      try {
        const accountBalance = await solanaService.getBalance();
        setBalance(accountBalance.toString());
      } catch (error) {
        console.error('Failed to get balance:', error);
      }
    }
  };

  // Connect wallet function
  const connectWallet = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const result = await solanaService.connectWallet();
      
      if (result.success) {
        setIsConnected(true);
        setPublicKey(result.publicKey);
        setWalletName(result.walletName);
        
        // Get initial balance
        const accountBalance = await solanaService.getBalance();
        setBalance(accountBalance.toString());
      }
    } catch (error) {
      setError(error.message);
      console.error('Wallet connection error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Disconnect wallet function
  const disconnectWallet = () => {
    solanaService.disconnectWallet();
    setIsConnected(false);
    setPublicKey(null);
    setBalance('0');
    setError(null);
    setWalletName(null);
  };

  // Refresh balance
  const refreshBalance = async () => {
    if (isConnected && publicKey) {
      try {
        const accountBalance = await solanaService.getBalance();
        setBalance(accountBalance.toString());
      } catch (error) {
        console.error('Failed to refresh balance:', error);
      }
    }
  };

  const value = {
    isConnected,
    publicKey,
    balance,
    walletName,
    isLoading,
    error,
    connectWallet,
    disconnectWallet,
    refreshBalance,
    isWalletAvailable: solanaService.isWalletAvailable()
  };

  return (
    <WalletContext.Provider value={value}>
      {children}
    </WalletContext.Provider>
  );
};