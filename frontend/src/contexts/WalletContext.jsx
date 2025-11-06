// src/contexts/WalletContext.jsx
import React, { createContext, useContext, useState, useEffect } from 'react';
import web3Service from '../services/web3Service';

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
  const [availableWallets, setAvailableWallets] = useState([]);

  useEffect(() => {
    // Get available wallets on component mount
    const wallets = web3Service.getAvailableWallets();
    setAvailableWallets(wallets);
    
    // Check initial connection status
    checkInitialConnection();
  }, []);

  const checkInitialConnection = async () => {
    const status = web3Service.getConnectionStatus();
    if (status.isConnected) {
      setIsConnected(true);
      setPublicKey(status.publicKey);
      setWalletName(status.walletName);
      
      try {
        const accountBalance = await web3Service.getBalance();
        setBalance(accountBalance.toString());
      } catch (error) {
        console.error('Failed to get balance:', error);
      }
    }
  };

  const connectWallet = async (walletType = 'walletconnect') => {
    setIsLoading(true);
    setError(null);
    
    try {
      const result = await web3Service.connectWallet(walletType);
      
      if (result.success) {
        setIsConnected(true);
        setPublicKey(result.publicKey);
        setWalletName(result.walletName);
        
        // Get initial balance
        const accountBalance = await web3Service.getBalance();
        setBalance(accountBalance.toString());
      }
    } catch (error) {
      setError(error.message);
      console.error('Wallet connection error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const disconnectWallet = () => {
    web3Service.disconnectWallet();
    setIsConnected(false);
    setPublicKey(null);
    setBalance('0');
    setError(null);
    setWalletName(null);
  };

  const refreshBalance = async () => {
    if (isConnected && publicKey) {
      try {
        const accountBalance = await web3Service.getBalance();
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
    availableWallets,
    connectWallet,
    disconnectWallet,
    refreshBalance,
    isAnyWalletAvailable: web3Service.isAnyWalletAvailable()
  };

  return (
    <WalletContext.Provider value={value}>
      {children}
    </WalletContext.Provider>
  );
};