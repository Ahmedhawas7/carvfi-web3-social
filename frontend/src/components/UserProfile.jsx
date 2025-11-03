import React, { useState, useEffect } from 'react';

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

  useEffect(() => {
    const fetchProfile = async () => {
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
      await new Promise(resolve => setTimeout(resolve, 1000));
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
    <div className="main-content">
      <div className="card">
        <h2 style={{ marginBottom: '0.5rem', color: 'var(--text-primary)' }}>الملف الشخصي</h2>
        <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem' }}>
          إدارة معلومات حسابك وتخصيص ظهورك في المنصة
        </p>
        
        <form onSubmit={handleSaveProfile}>
          {/* صورة الملف الشخصي */}
          <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
            <div style={{ position: 'relative', display: 'inline-block' }}>
              <div className="avatar" style={{ 
                width: '100px', 
                height: '100px',
                background: profile.avatar ? 'transparent' : 'var(--primary)',
                fontSize: '2.5rem',
                marginBottom: '1rem'
              }}>
                {profile.avatar ? (
                  <img 
                    src={profile.avatar} 
                    alt="Profile" 
                    style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }}
                  />
                ) : (
                  '👤'
                )}
              </div>
              
              <label 
                htmlFor="avatar-upload"
                style={{
                  position: 'absolute',
                  bottom: '10px',
                  right: '10px',
                  background: 'var(--primary)',
                  color: 'white',
                  padding: '0.5rem',
                  borderRadius: '50%',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease'
                }}
              >
                📷
                <input
                  id="avatar-upload"
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  style={{ display: 'none' }}
                />
              </label>
            </div>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
              انقر على الأيقونة لتغيير الصورة
            </p>
          </div>

          {/* معلومات الأساسية */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-secondary)', fontSize: '0.8rem' }}>
                اسم المستخدم *
              </label>
              <input
                type="text"
                value={profile.username}
                onChange={(e) => handleInputChange('username', e.target.value)}
                placeholder="ادخل اسم المستخدم"
                required
                style={{ width: '100%' }}
              />
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-secondary)', fontSize: '0.8rem' }}>
                البريد الإلكتروني *
              </label>
              <input
                type="email"
                value={profile.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                placeholder="ادخل بريدك الإلكتروني"
                required
                style={{ width: '100%' }}
              />
            </div>
          </div>

          {/* عنوان المحفظة */}
          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-secondary)', fontSize: '0.8rem' }}>
              عنوان المحفظة (Web3)
            </label>
            <div style={{ position: 'relative' }}>
              <input
                type="text"
                value={profile.walletAddress}
                readOnly
                style={{ 
                  width: '100%', 
                  backgroundColor: 'var(--glass)',
                  color: 'var(--text-secondary)',
                  cursor: 'not-allowed'
                }}
              />
              <div style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)' }}>
                <span style={{ 
                  fontSize: '0.7rem', 
                  background: 'var(--success)', 
                  color: 'white', 
                  padding: '0.2rem 0.5rem', 
                  borderRadius: '6px' 
                }}>
                  متصل
                </span>
              </div>
            </div>
          </div>

          {/* السيرة الذاتية */}
          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-secondary)', fontSize: '0.8rem' }}>
              السيرة الذاتية
            </label>
            <textarea
              value={profile.bio}
              onChange={(e) => handleInputChange('bio', e.target.value)}
              rows={3}
              placeholder="اخبرنا عن نفسك وخبراتك..."
              style={{ width: '100%', resize: 'vertical' }}
            />
          </div>

          {/* حسابات التواصل الاجتماعي */}
          <div style={{ marginBottom: '2rem' }}>
            <h3 style={{ color: 'var(--text-primary)', marginBottom: '1rem', fontSize: '1rem' }}>
              حسابات التواصل الاجتماعي
            </h3>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-secondary)', fontSize: '0.8rem' }}>
                  الموقع الإلكتروني
                </label>
                <input
                  type="url"
                  value={profile.website}
                  onChange={(e) => handleInputChange('website', e.target.value)}
                  placeholder="https://example.com"
                  style={{ width: '100%' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-secondary)', fontSize: '0.8rem' }}>
                    Twitter
                  </label>
                  <input
                    type="text"
                    value={profile.twitter}
                    onChange={(e) => handleInputChange('twitter', e.target.value)}
                    placeholder="اسم المستخدم"
                    style={{ width: '100%' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-secondary)', fontSize: '0.8rem' }}>
                    GitHub
                  </label>
                  <input
                    type="text"
                    value={profile.github}
                    onChange={(e) => handleInputChange('github', e.target.value)}
                    placeholder="اسم المستخدم"
                    style={{ width: '100%' }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* أزرار الحفظ */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
            <button
              type="button"
              className="btn"
              style={{ background: 'transparent' }}
            >
              إلغاء
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="btn"
              style={{ 
                background: isLoading ? 'var(--text-secondary)' : 'var(--primary)',
                minWidth: '120px'
              }}
            >
              {isLoading ? 'جاري الحفظ...' : 'حفظ التغييرات'}
            </button>
          </div>

          {/* رسالة الحالة */}
          {saveStatus === 'success' && (
            <div style={{
              marginTop: '1rem',
              padding: '0.8rem',
              background: 'rgba(16, 185, 129, 0.1)',
              border: '1px solid var(--success)',
              color: 'var(--success)',
              borderRadius: '8px',
              textAlign: 'center',
              fontSize: '0.8rem'
            }}>
              ✓ تم حفظ التغييرات بنجاح
            </div>
          )}
          
          {saveStatus === 'error' && (
            <div style={{
              marginTop: '1rem',
              padding: '0.8rem',
              background: 'rgba(239, 68, 68, 0.1)',
              border: '1px solid var(--error)',
              color: 'var(--error)',
              borderRadius: '8px',
              textAlign: 'center',
              fontSize: '0.8rem'
            }}>
              ✗ حدث خطأ أثناء الحفظ، يرجى المحاولة مرة أخرى
            </div>
          )}
        </form>
      </div>
    </div>
  );
};

export default UserProfile;
