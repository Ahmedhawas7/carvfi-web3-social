import React, { useState, useEffect } from 'react';
import { useWallet } from '../contexts/WalletContext';
import StorageService from '../services/StorageService';

const LoginPage = ({ onLoginSuccess, onShowRegister }) => {
  const { 
    isConnected, 
    publicKey, 
    connectWallet, 
    disconnectWallet,
    walletName 
  } = useWallet();
  
  const [loginMethod, setLoginMethod] = useState('wallet'); // 'wallet' or 'email'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  // التحقق التلقائي عند توصيل المحفظة
  useEffect(() => {
    if (isConnected && publicKey) {
      checkExistingUser();
    }
  }, [isConnected, publicKey]);

  const checkExistingUser = async () => {
    try {
      setIsLoading(true);
      setError('');

      const existingUser = StorageService.getUser(publicKey);
      
      if (existingUser) {
        console.log('✅ User found, logging in...', existingUser);
        
        // تحديث بيانات الدخول
        StorageService.updateStreak(publicKey);
        StorageService.saveActivity(publicKey, {
          type: 'login',
          description: 'User logged in successfully',
          points: 5
        });

        // إرسال بيانات المستخدم للتطبيق الرئيسي
        onLoginSuccess(existingUser);
      } else {
        console.log('❌ No existing user found, showing registration');
        // إذا لم يوجد مستخدم، انتقل لإنشاء حساب جديد
        onShowRegister();
      }
    } catch (error) {
      console.error('Error checking user:', error);
      setError('Failed to check user account');
    } finally {
      setIsLoading(false);
    }
  };

  const handleWalletLogin = async () => {
    try {
      setIsLoading(true);
      setError('');

      if (!isConnected) {
        await connectWallet('backpack');
      } else {
        await checkExistingUser();
      }
    } catch (error) {
      console.error('Wallet login error:', error);
      setError('Failed to connect wallet');
      setIsLoading(false);
    }
  };

  const handleEmailLogin = async (e) => {
    e.preventDefault();
    // سيتم تطوير هذا الجزء لاحقاً
    setError('Email login coming soon!');
  };

  const handleSwitchToRegister = () => {
    disconnectWallet();
    onShowRegister();
  };

  return (
    <div className="modern-app">
      <div className="hero-section">
        <div className="hero-background">
          <div className="hero-content">
            
            {/* Header */}
            <div className="logo-section">
              <div className="logo-icon">🌐</div>
              <h1 className="hero-title">CARVFi</h1>
              <p className="hero-subtitle">Welcome Back!</p>
            </div>

            {/* Login Methods Tabs */}
            <div className="auth-tabs">
              <button 
                className={`tab-button ${loginMethod