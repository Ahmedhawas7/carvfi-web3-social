import React, { useState, useEffect } from 'react';
import { Camera, Save, User, Mail, Globe, Twitter, Github, Upload } from 'lucide-react';

const UserProfile = () => {
  const [profile, setProfile] = useState({
    username: '',
    email: '',
    avatar: '',
    bio: '',
    website: '',
    twitter: '',
    github: '',
    walletAddress: ''
  });
  
  const [isLoading, setIsLoading] = useState(false);
  const [saveStatus, setSaveStatus] = useState('idle');

  // محاكاة جلب بيانات الملف الشخصي
  useEffect(() => {
    const fetchProfile = async () => {
      // سيتم استبدال هذا ب API حقيقي
      setProfile({
        username: 'ahmedhawas',
        email: 'ahmed@example.com',
        avatar: '',
        bio: 'مطور ويب شغوف بتقنية Web3 ومشاريع البلوكشين',
        website: 'https://ahmedhawas.com',
        twitter: 'ahmedhawas',
        github: 'ahmedhawas7',
        walletAddress: '0x742d35Cc6634C0532925a3b8D...'
      });
    };
    
    fetchProfile();
  }, []);

  const handleInputChange = (field, value) => {
    setProfile(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      // محاكاة حفظ البيانات في الخلفية
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // هنا سيتم إرسال البيانات إلى API
      console.log('بيانات الملف الشخصي المحفوظة:', profile);
      
      setSaveStatus('success');
      setTimeout(() => setSaveStatus('idle'), 3000);
    } catch (error) {
      setSaveStatus('error');
      setTimeout(() => setSaveStatus('idle'), 3000);
    } finally {
      setIsLoading(false);
    }
  };

  const handleImageUpload = (event) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        handleInputChange('avatar', e.target?.result);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="modern-card p-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">الملف الشخصي</h2>
        <p className="text-gray-600 mb-6">إدارة معلومات حسابك وتخصيص ظهورك في المنصة</p>
        
        <form onSubmit={handleSaveProfile}>
          {/* صورة الملف الشخصي */}
          <div className="flex flex-col items-center mb-8">
            <div className="relative group">
              <div className="w-32 h-32 rounded-full bg-gradient-to-r from-purple-400 to-blue-500 flex items-center justify-center text-white text-2xl font-bold overflow-hidden border-4 border-white shadow-lg">
                {profile.avatar ? (
                  <img 
                    src={profile.avatar} 
                    alt="Profile" 
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <User size={48} />
                )}
              </div>
              
              <label 
                htmlFor="avatar-upload"
                className="absolute bottom-2 right-2 bg-blue-500 text-white p-2 rounded-full cursor-pointer transform transition-all hover:scale-105 hover:bg-blue-600 shadow-lg"
              >
                <Camera size={16} />
                <input
                  id="avatar-upload"
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                />
              </label>
            </div>
            <p className="text-sm text-gray-500 mt-2">انقر على الأيقونة لتغيير الصورة</p>
          </div>

          {/* معلومات الأساسية */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                اسم المستخدم *
              </label>
              <div className="relative">
                <User className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="text"
                  value={profile.username}
                  onChange={(e) => handleInputChange('username', e.target.value)}
                  className="w-full pl-4 pr-10 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  placeholder="ادخل اسم المستخدم"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                البريد الإلكتروني *
              </label>
              <div className="relative">
                <Mail className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="email"
                  value={profile.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  className="w-full pl-4 pr-10 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  placeholder="ادخل بريدك الإلكتروني"
                  required
                />
              </div>
            </div>
          </div>

          {/* عنوان المحفظة */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              عنوان المحفظة (Web3)
            </label>
            <div className="relative">
              <input
                type="text"
                value={profile.walletAddress}
                readOnly
                className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-50 text-gray-500 cursor-not-allowed"
              />
              <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
                <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">متصل</span>
              </div>
            </div>
          </div>

          {/* السيرة الذاتية */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              السيرة الذاتية
            </label>
            <textarea
              value={profile.bio}
              onChange={(e) => handleInputChange('bio', e.target.value)}
              rows={3}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              placeholder="اخبرنا عن نفسك وخبراتك..."
            />
          </div>

          {/* حسابات التواصل الاجتماعي */}
          <div className="mb-8">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">حسابات التواصل الاجتماعي</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  الموقع الإلكتروني
                </label>
                <div className="relative">
                  <Globe className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                  <input
                    type="url"
                    value={profile.website}
                    onChange={(e) => handleInputChange('website', e.target.value)}
                    className="w-full pl-4 pr-10 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    placeholder="https://example.com"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Twitter
                  </label>
                  <div className="relative">
                    <Twitter className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                    <input
                      type="text"
                      value={profile.twitter}
                      onChange={(e) => handleInputChange('twitter', e.target.value)}
                      className="w-full pl-4 pr-10 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                      placeholder="اسم المستخدم"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    GitHub
                  </label>
                  <div className="relative">
                    <Github className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                    <input
                      type="text"
                      value={profile.github}
                      onChange={(e) => handleInputChange('github', e.target.value)}
                      className="w-full pl-4 pr-10 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                      placeholder="اسم المستخدم"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* أزرار الحفظ */}
          <div className="flex justify-end space-x-3 space-x-reverse">
            <button
              type="button"
              className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-all"
            >
              إلغاء
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className={`flex items-center space-x-2 space-x-reverse px-6 py-3 rounded-lg text-white font-medium transition-all ${
                isLoading 
                  ? 'bg-gray-400 cursor-not-allowed' 
                  : 'bg-blue-500 hover:bg-blue-600 transform hover:scale-105'
              }`}
            >
              <Save size={20} />
              <span>{isLoading ? 'جاري الحفظ...' : 'حفظ التغييرات'}</span>
            </button>
          </div>

          {/* رسالة الحالة */}
          {saveStatus === 'success' && (
            <div className="mt-4 p-3 bg-green-100 text-green-700 rounded-lg text-center border border-green-200">
              <span className="font-medium">✓ تم حفظ التغييرات بنجاح</span>
            </div>
          )}
          
          {saveStatus === 'error' && (
            <div className="mt-4 p-3 bg-red-100 text-red-700 rounded-lg text-center border border-red-200">
              <span className="font-medium">✗ حدث خطأ أثناء الحفظ، يرجى المحاولة مرة أخرى</span>
            </div>
          )}
        </form>
      </div>
    </div>
  );
};

export default UserProfile;
