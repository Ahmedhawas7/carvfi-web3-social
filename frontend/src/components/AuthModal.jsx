import React, { useState, useEffect } from 'react';
import { useWallet } from '../contexts/WalletContext';

const AuthModal = ({ isOpen, onClose, onAuthSuccess, walletAddress }) => {
  const { 
    availableWallets, 
    connectWallet, 
    isLoading, 
    error 
  } = useWallet();
  
  const [activeTab, setActiveTab] = useState('connect');
  const [formData, setFormData] = useState({
    username: '',
    firstName: '',
    lastName: '',
    email: '',
    carvPlayUsername: '',
    carvUID: '',
    twitter: '',
    telegram: '',
    avatar: ''
  });

  const [formErrors, setFormErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // توليد username تلقائي عند فتح المودال
  useEffect(() => {
    if (walletAddress && isOpen && !formData.username) {
      const randomNum = Math.floor(Math.random() * 10000);
      const newUsername = `user${randomNum}`;
      setFormData(prev => ({ ...prev, username: newUsername }));
    }
  }, [walletAddress, isOpen, formData.username]);

  if (!isOpen) return null;

  const handleWalletConnect = async (walletType) => {
    try {
      console.log(`🔗 Connecting to ${walletType}...`);
      const result = await connectWallet(walletType);
      if (result.success) {
        console.log('✅ Wallet connected successfully');
        onClose();
      }
    } catch (error) {
      console.error('❌ Wallet connection failed:', error);
    }
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // مسح الخطأ عندما يبدأ المستخدم الكتابة
    if (formErrors[field]) {
      setFormErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const validateForm = () => {
    const errors = {};

    if (!formData.username) {
      errors.username = 'Username is required';
    } else if (!/^[a-z0-9]+$/.test(formData.username)) {
      errors.username = 'Username must contain only lowercase letters and numbers';
    }

    if (!formData.firstName) {
      errors.firstName = 'First name is required';
    }

    if (!formData.lastName) {
      errors.lastName = 'Last name is required';
    }

    if (!formData.email) {
      errors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.email = 'Please enter a valid email address';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      console.log('📝 Submitting profile data:', formData);
      
      // حفظ البيانات في localStorage مباشرة
      const userData = {
        address: walletAddress,
        type: 'solana',
        ...formData,
        points: 50,
        streak: 1,
        level: 1,
        loginCount: 1,
        lastLogin: new Date().toISOString(),
        createdAt: new Date().toISOString(),
        lastUpdated: new Date().toISOString()
      };

      // حفظ المستخدم في localStorage
      const users = JSON.parse(localStorage.getItem('carvfi_users') || '{}');
      const userKey = walletAddress?.toLowerCase();
      users[userKey] = userData;
      localStorage.setItem('carvfi_users', JSON.stringify(users));
      localStorage.setItem('carvfi_current_user', JSON.stringify(userData));

      // حفظ النشاط
      const activities = JSON.parse(localStorage.getItem('carvfi_activities') || '{}');
      if (!activities[userKey]) {
        activities[userKey] = [];
      }
      activities[userKey].unshift({
        id: Date.now().toString(),
        type: 'registration',
        description: 'New user registered successfully',
        points: 50,
        timestamp: new Date().toISOString()
      });
      localStorage.setItem('carvfi_activities', JSON.stringify(activities));

      console.log('✅ User data saved successfully');

      // استدعاء onAuthSuccess إذا كان موجوداً
      if (onAuthSuccess) {
        onAuthSuccess(userData);
        console.log('✅ onAuthSuccess called successfully');
      }

      // 🚀 الانتقال المباشر إلى صفحة Rewards Dashboard
      console.log('🚀 Redirecting to rewards dashboard...');
      window.location.href = '/rewards';

    } catch (error) {
      console.error('❌ Error creating account:', error);
      setFormErrors({ submit: 'Failed to create account. Please try again.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const generateRandomUsername = () => {
    const randomNum = Math.floor(Math.random() * 10000);
    const newUsername = `user${randomNum}`;
    setFormData(prev => ({ ...prev, username: newUsername }));
  };

  // مودال إكمال الملف الشخصي
  if (walletAddress) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-lg p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
          {/* Header */}
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-gray-800">Create Your Account</h2>
            <button 
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700"
              disabled={isSubmitting}
            >
              ✕
            </button>
          </div>

          {/* Wallet Info */}
          <div className="bg-green-50 border border-green-200 rounded-lg p-3 mb-4">
            <p className="text-sm text-green-800 font-medium">
              ✅ Wallet Connected
            </p>
            <p className="text-xs text-green-600 mt-1 font-mono">
              {walletAddress.slice(0, 10)}...{walletAddress.slice(-8)}
            </p>
          </div>

          {/* Profile Form */}
          <form onSubmit={handleProfileSubmit} className="space-y-4">
            {/* Basic Information */}
            <div className="border-b pb-4">
              <h3 className="font-semibold text-gray-700 mb-3">Basic Information</h3>
              
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Username *
                  </label>
                  <div className="flex space-x-2">
                    <input
                      type="text"
                      value={formData.username}
                      onChange={(e) => handleInputChange('username', e.target.value.toLowerCase())}
                      placeholder="username123"
                      className={`flex-1 px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                        formErrors.username ? 'border-red-500' : 'border-gray-300'
                      }`}
                      required
                      disabled={isSubmitting}
                    />
                    <button
                      type="button"
                      onClick={generateRandomUsername}
                      className="px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 text-sm disabled:opacity-50"
                      disabled={isSubmitting}
                    >
                      Random
                    </button>
                  </div>
                  {formErrors.username && (
                    <p className="text-red-500 text-xs mt-1">{formErrors.username}</p>
                  )}
                  <p className="text-xs text-gray-500 mt-1">Lowercase letters and numbers only</p>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      First Name *
                    </label>
                    <input
                      type="text"
                      value={formData.firstName}
                      onChange={(e) => handleInputChange('firstName', e.target.value)}
                      placeholder="John"
                      className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                        formErrors.firstName ? 'border-red-500' : 'border-gray-300'
                      }`}
                      required
                      disabled={isSubmitting}
                    />
                    {formErrors.firstName && (
                      <p className="text-red-500 text-xs mt-1">{formErrors.firstName}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Last Name *
                    </label>
                    <input
                      type="text"
                      value={formData.lastName}
                      onChange={(e) => handleInputChange('lastName', e.target.value)}
                      placeholder="Doe"
                      className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                        formErrors.lastName ? 'border-red-500' : 'border-gray-300'
                      }`}
                      required
                      disabled={isSubmitting}
                    />
                    {formErrors.lastName && (
                      <p className="text-red-500 text-xs mt-1">{formErrors.lastName}</p>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email Address *
                    </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    placeholder="your@email.com"
                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      formErrors.email ? 'border-red-500' : 'border-gray-300'
                    }`}
                    required
                    disabled={isSubmitting}
                  />
                  {formErrors.email && (
                    <p className="text-red-500 text-xs mt-1">{formErrors.email}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Carv Information */}
            <div className="border-b pb-4">
              <h3 className="font-semibold text-gray-700 mb-3">Carv Information (Optional)</h3>
              
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Carv Play Username
                  </label>
                  <input
                    type="text"
                    value={formData.carvPlayUsername}
                    onChange={(e) => handleInputChange('carvPlayUsername', e.target.value)}
                    placeholder="Your Carv Play username"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    disabled={isSubmitting}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Carv UID
                  </label>
                  <input
                    type="text"
                    value={formData.carvUID}
                    onChange={(e) => handleInputChange('carvUID', e.target.value)}
                    placeholder="Your Carv UID"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    disabled={isSubmitting}
                  />
                </div>
              </div>
            </div>

            {/* Social Media */}
            <div className="border-b pb-4">
              <h3 className="font-semibold text-gray-700 mb-3">Social Media (Optional)</h3>
              
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Twitter
                  </label>
                  <input
                    type="text"
                    value={formData.twitter}
                    onChange={(e) => handleInputChange('twitter', e.target.value)}
                    placeholder="@username"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    disabled={isSubmitting}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Telegram
                  </label>
                  <input
                    type="text"
                    value={formData.telegram}
                    onChange={(e) => handleInputChange('telegram', e.target.value)}
                    placeholder="@username"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    disabled={isSubmitting}
                  />
                </div>
              </div>
            </div>

            {/* Profile Picture */}
            <div>
              <h3 className="font-semibold text-gray-700 mb-3">Profile Picture (Optional)</h3>
              
              <div className="flex items-center space-x-4">
                <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center">
                  {formData.avatar ? (
                    <img 
                      src={formData.avatar} 
                      alt="Profile" 
                      className="w-16 h-16 rounded-full object-cover"
                    />
                  ) : (
                    <span className="text-gray-500 text-2xl">👤</span>
                  )}
                </div>
                
                <div className="flex-1">
                  <input
                    type="url"
                    value={formData.avatar}
                    onChange={(e) => handleInputChange('avatar', e.target.value)}
                    placeholder="Paste image URL"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                    disabled={isSubmitting}
                  />
                  <p className="text-xs text-gray-500 mt-1">Paste a direct image URL</p>
                </div>
              </div>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 p-3 rounded-lg">
                <p className="text-sm">{error}</p>
              </div>
            )}

            {formErrors.submit && (
              <div className="bg-red-50 border border-red-200 text-red-700 p-3 rounded-lg">
                <p className="text-sm">{formErrors.submit}</p>
              </div>
            )}

            <div className="flex space-x-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 bg-gray-200 text-gray-800 py-3 rounded-lg font-medium hover:bg-gray-300 transition-colors disabled:opacity-50"
                disabled={isSubmitting}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex-1 bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center justify-center"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                    Creating...
                  </>
                ) : (
                  'Create Account'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  }

  // مودال ربط المحفظة العادي
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        {/* Header */}
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-gray-800">Connect Wallet</h2>
          <button 
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            ✕
          </button>
        </div>

        {/* Tabs */}
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

        {/* Content */}
        <div className="space-y-4">
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="font-semibold mb-2">Available Wallets</h3>
            <p className="text-sm text-gray-600">
              Connect your wallet to start using CARVFi
            </p>
          </div>

          {/* Wallet List */}
          <div className="space-y-3">
            {availableWallets.length > 0 ? (
              availableWallets.map((wallet, index) => (
                <button 
                  key={index}
                  onClick={() => handleWalletConnect(wallet.name.toLowerCase())}
                  disabled={isLoading}
                  className="w-full flex items-center space-x-3 p-3 border border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <span className="text-xl">{wallet.icon}</span>
                  <span className="font-medium">{wallet.name}</span>
                  {isLoading && (
                    <div className="ml-auto w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                  )}
                </button>
              ))
            ) : (
              <div className="text-center py-4">
                <p className="text-gray-500 mb-3">No wallets detected</p>
                <div className="space-y-2">
                  <a 
                    href="https://www.backpack.app/" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="inline-block bg-purple-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-purple-700"
                  >
                    Install BackPack
                  </a>
                </div>
              </div>
            )}
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 p-3 rounded-lg">
              <p className="text-sm">{error}</p>
            </div>
          )}

          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
            <p className="text-sm text-yellow-800">
              🔒 Your wallet connection is secure and private
            </p>
          </div>
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