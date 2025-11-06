import React, { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import web3Service from '../services/web3Service';
import StorageService from '../services/StorageService';

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

  const navigate = useNavigate();

  useEffect(() => {
    const wallets = web3Service.getAvailableWallets();
    setAvailableWallets(wallets);
    checkInitialConnection();
  }, []);

  const checkInitialConnection = async () => {
    const current = StorageService.getCurrentUser();
    if (current) {
      setIsConnected(true);
      setPublicKey(current.walletAddress);
      setWalletName(current.walletName || 'Connected Wallet');
      setBalance(StorageService.getPoints(current.walletAddress) || '0');
      navigate('/dashboard');
    }
  };

  const connectWallet = async (walletType = 'backpack') => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await web3Service.connectWallet(walletType);
      if (result.success) {
        const walletAddress = result.publicKey;
        const walletUser = {
          walletAddress,
          walletName: result.walletName,
          network: result.network,
          points: StorageService.getPoints(walletAddress),
        };

        StorageService.saveUser(walletUser);

        setIsConnected(true);
        setPublicKey(walletAddress);
        setWalletName(result.walletName);
        const accountBalance = await web3Service.getBalance();
        setBalance(accountBalance);

        navigate('/dashboard'); // 🔥 التحويل بعد الاتصال الناجح
      }
    } catch (error) {
      setError(error.message);
      console.error('Wallet connection error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const disconnectWallet = async () => {
    try {
      await web3Service.disconnectWallet();
      setIsConnected(false);
      setPublicKey(null);
      setBalance('0');
      setError(null);
      setWalletName(null);
      localStorage.removeItem('carvfi_current_user');
      navigate('/');
    } catch (error) {
      console.error('Error disconnecting wallet:', error);
    }
  };

  const refreshBalance = async () => {
    if (isConnected && publicKey) {
      try {
        const accountBalance = await web3Service.getBalance();
        setBalance(accountBalance);
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