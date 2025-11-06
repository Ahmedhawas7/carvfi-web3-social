class StorageService {
  static getKey(walletAddress, key) {
    return `carvfi_${walletAddress}_${key}`;
  }

  static saveUser(user) {
    if (!user || !user.walletAddress) return;
    localStorage.setItem(this.getKey(user.walletAddress, 'user'), JSON.stringify(user));
    localStorage.setItem('carvfi_current_user', user.walletAddress);
    
    // إضافة علامة تسجيل الدخول
    localStorage.setItem('carvfi_is_logged_in', 'true');
  }

  static getUser(walletAddress) {
    const data = localStorage.getItem(this.getKey(walletAddress, 'user'));
    return data ? JSON.parse(data) : null;
  }

  static getCurrentUser() {
    const wallet = localStorage.getItem('carvfi_current_user');
    if (!wallet) return null;
    return this.getUser(wallet);
  }

  static saveActivity(walletAddress, activity) {
    const key = this.getKey(walletAddress, 'activities');
    const activities = this.getActivities(walletAddress);
    activities.push({
      ...activity,
      date: new Date().toISOString()
    });
    localStorage.setItem(key, JSON.stringify(activities));
  }

  static getActivities(walletAddress) {
    const data = localStorage.getItem(this.getKey(walletAddress, 'activities'));
    return data ? JSON.parse(data) : [];
  }

  static updatePoints(walletAddress, amount = 0) {
    const user = this.getUser(walletAddress);
    if (!user) return;
    user.points = (user.points || 0) + amount;
    this.saveUser(user);
  }

  static getPoints(walletAddress) {
    const user = this.getUser(walletAddress);
    return user ? user.points || 0 : 0;
  }

  static updateStreak(walletAddress) {
    const key = this.getKey(walletAddress, 'streak');
    const lastLoginKey = this.getKey(walletAddress, 'last_login');
    const lastLogin = localStorage.getItem(lastLoginKey);
    const today = new Date().toDateString();

    if (lastLogin === today) {
      return parseInt(localStorage.getItem(key)) || 1;
    }

    let streak = parseInt(localStorage.getItem(key)) || 0;
    if (lastLogin) {
      const lastDate = new Date(lastLogin);
      const diffDays = Math.floor((new Date() - lastDate) / (1000 * 60 * 60 * 24));
      if (diffDays === 1) {
        streak += 1;
      } else if (diffDays > 1) {
        streak = 1;
      }
    } else {
      streak = 1;
    }

    localStorage.setItem(lastLoginKey, today);
    localStorage.setItem(key, streak);
    return streak;
  }

  // ===== الدوال الجديدة المطلوبة =====

  // دالة جديدة لحفظ بيانات المستخدم من إنشاء الحساب
  static saveUserData(userData) {
    try {
      const user = {
        walletAddress: userData.address,
        username: userData.username,
        firstName: userData.firstName,
        lastName: userData.lastName,
        email: userData.email,
        carvPlayUsername: userData.carvPlayUsername,
        carvUID: userData.carvUID,
        twitter: userData.twitter,
        telegram: userData.telegram,
        avatar: userData.avatar,
        points: 50, // نقاط بداية
        streak: 1,
        level: 1,
        achievements: [
          {
            id: 1,
            name: "CARV Pioneer",
            description: "Joined CARV SVM Testnet",
            icon: "🚀",
            points: 50,
            earnedAt: new Date().toISOString(),
            category: "onboarding"
          }
        ],
        totalAchievements: 1,
        loginCount: 1,
        lastLogin: new Date().toISOString(),
        createdAt: new Date().toISOString(),
        lastUpdated: new Date().toISOString(),
        type: userData.type || 'solana'
      };

      this.saveUser(user);
      return { success: true, user };
    } catch (error) {
      console.error('StorageService: Failed to save user data', error);
      return { success: false, error: error.message };
    }
  }

  // دالة للتحقق من تسجيل الدخول
  static isUserLoggedIn() {
    return localStorage.getItem('carvfi_is_logged_in') === 'true';
  }

  // دالة للحصول على بيانات المستخدم الحالي
  static getCurrentUserData() {
    return this.getCurrentUser();
  }

  // دالة لتسجيل الخروج
  static logout() {
    localStorage.removeItem('carvfi_is_logged_in');
    localStorage.removeItem('carvfi_current_user');
  }

  // دالة للتحقق من وجود مستخدم بواسطة العنوان
  static userExists(walletAddress) {
    return !!this.getUser(walletAddress);
  }

  // دالة لجلب جميع بيانات المستخدم
  static getAllUserData(walletAddress) {
    const user = this.getUser(walletAddress);
    if (!user) return null;

    const activities = this.getActivities(walletAddress);
    const streak = this.updateStreak(walletAddress);
    const points = this.getPoints(walletAddress);

    return {
      ...user,
      activities,
      streak,
      points,
      totalActivities: activities.length
    };
  }

  // دالة جديدة لإضافة إنجاز
  static addAchievement(walletAddress, achievement) {
    const user = this.getUser(walletAddress);
    if (!user) return false;

    if (!user.achievements) {
      user.achievements = [];
    }

    const newAchievement = {
      id: Date.now(),
      ...achievement,
      earnedAt: new Date().toISOString()
    };

    user.achievements.push(newAchievement);
    user.totalAchievements = user.achievements.length;
    
    // إضافة النقاط
    if (achievement.points) {
      user.points = (user.points || 0) + achievement.points;
    }

    this.saveUser(user);
    return true;
  }
}

export default StorageService;