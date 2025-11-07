// Google Sheets Integration Service
const API_URL = 'https://script.google.com/macros/s/AKfycbxwqqYOry43uTlUkXRliqGEbB_7sC-OBvZ-FxGnwCqNx4jKiio7HGvbiMFGEnYoxa6z1A/exec';

class StorageService {
  // Register new user in Google Sheets
  static async registerUser(userData) {
    try {
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams(userData)
      });
      
      const result = await response.json();
      return result;
    } catch (error) {
      console.error('Registration error:', error);
      return { 
        success: false, 
        message: 'Connection error. Please try again.' 
      };
    }
  }

  // Check if user exists in Google Sheets
  static async checkUser(email) {
    try {
      const response = await fetch(`${API_URL}?email=${encodeURIComponent(email)}`);
      const result = await response.json();
      return result;
    } catch (error) {
      console.error('Check user error:', error);
      return { 
        success: false, 
        message: 'Connection error. Please try again.' 
      };
    }
  }

  // Save user data to localStorage
  static saveUserLocally(userData) {
    try {
      localStorage.setItem('carvfi_user', JSON.stringify(userData));
      localStorage.setItem('user_logged_in', 'true');
      return true;
    } catch (error) {
      console.error('Local storage error:', error);
      return false;
    }
  }

  // Get user data from localStorage
  static getLocalUser() {
    try {
      const userData = localStorage.getItem('carvfi_user');
      return userData ? JSON.parse(userData) : null;
    } catch (error) {
      console.error('Get local user error:', error);
      return null;
    }
  }

  // Check if user is logged in
  static isLoggedIn() {
    return localStorage.getItem('user_logged_in') === 'true';
  }

  // Logout user
  static logout() {
    try {
      localStorage.removeItem('carvfi_user');
      localStorage.removeItem('user_logged_in');
      return true;
    } catch (error) {
      console.error('Logout error:', error);
      return false;
    }
  }

  // Update user profile
  static async updateUserProfile(updatedData) {
    try {
      // In a real app, you would send this to your backend
      // For now, we'll just update localStorage
      const currentUser = this.getLocalUser();
      if (currentUser) {
        const updatedUser = { ...currentUser, ...updatedData };
        this.saveUserLocally(updatedUser);
        return { success: true, user: updatedUser };
      }
      return { success: false, message: 'User not found' };
    } catch (error) {
      console.error('Update profile error:', error);
      return { success: false, message: 'Update failed' };
    }
  }

  // Get user rewards (simulated)
  static async getUserRewards(userId) {
    try {
      // Simulate API call
      return new Promise((resolve) => {
        setTimeout(() => {
          resolve({
            success: true,
            rewards: [
              { id: 1, name: 'Welcome Points', points: 50, status: 'claimed' },
              { id: 2, name: 'Social Interaction', points: 25, status: 'available' },
              { id: 3, name: 'Community Contribution', points: 75, status: 'pending' }
            ]
          });
        }, 1000);
      });
    } catch (error) {
      console.error('Get rewards error:', error);
      return { success: false, rewards: [] };
    }
  }
}

export default StorageService;