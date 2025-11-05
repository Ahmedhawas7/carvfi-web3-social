import React, { useState, useEffect } from 'react';

const RewardsDashboard = ({ user, storageService }) => {
  const [userData, setUserData] = useState({
    points: 0,
    streak: 0,
    level: 1,
    walletConnected: true
  });

  const [dailyTasks, setDailyTasks] = useState([
    {
      id: 1,
      title: "Daily Login",
      description: "Visit the platform daily",
      points: 50,
      completed: false,
      type: "login"
    },
    {
      id: 2,
      title: "Twitter Post",
      description: "Share about CarVFi on Twitter",
      points: 100,
      completed: false,
      type: "social"
    },
    {
      id: 3,
      title: "Follow Account",
      description: "Follow our official Twitter account",
      points: 75,
      completed: false,
      type: "social"
    },
    {
      id: 4,
      title: "Connect Wallet",
      description: "Connect your Web3 wallet",
      points: 200,
      completed: true,
      type: "wallet"
    },
    {
      id: 5,
      title: "Complete Profile",
      description: "Fill out your profile information",
      points: 150,
      completed: false,
      type: "profile"
    },
    {
      id: 6,
      title: "Invite Friends",
      description: "Invite 3 friends to join CarVFi",
      points: 300,
      completed: false,
      type: "social"
    }
  ]);

  const [userActivities, setUserActivities] = useState([]);
  const [walletTransactions, setWalletTransactions] = useState([
    {
      id: 1,
      type: "send",
      amount: "0.5 SVM",
      to: "0x742d...5a3b",
      status: "completed",
      timestamp: "2024-01-15 14:30"
    },
    {
      id: 2,
      type: "receive",
      amount: "1.2 SVM",
      from: "0x8f2c...9d1e",
      status: "completed",
      timestamp: "2024-01-15 11:20"
    },
    {
      id: 3,
      type: "swap",
      amount: "2.0 SVM",
      status: "pending",
      timestamp: "2024-01-15 10:15"
    }
  ]);

  // Calculate task statistics
  const completedTasks = dailyTasks.filter(task => task.completed).length;
  const totalTasks = dailyTasks.length;
  const pendingTasks = totalTasks - completedTasks;

  useEffect(() => {
    if (user) {
      loadUserData();
      loadActivities();
      checkDailyLogin();
    }
  }, [user]);

  const loadUserData = () => {
    const savedUser = storageService.getUser(user.walletAddress);
    if (savedUser) {
      setUserData({
        points: savedUser.points || 0,
        streak: savedUser.streak || 1,
        level: savedUser.level || 1,
        walletConnected: true
      });
    }
  };

  const loadActivities = () => {
    const activities = storageService.getActivities(user.walletAddress);
    setUserActivities(activities);
  };

  const checkDailyLogin = () => {
    const today = new Date().toDateString();
    const lastLogin = user.lastLogin ? new Date(user.lastLogin).toDateString() : null;
    
    if (lastLogin !== today) {
      completeTask(1);
    }
  };

  const completeTask = (taskId) => {
    const task = dailyTasks.find(t => t.id === taskId);
    if (task && user && !task.completed) {
      setDailyTasks(tasks =>
        tasks.map(t =>
          t.id === taskId ? { ...t, completed: true } : t
        )
      );

      const newPoints = storageService.updatePoints(user.walletAddress, task.points);
      
      storageService.saveActivity(user.walletAddress, {
        type: task.type,
        description: `Completed: ${task.title}`,
        points: task.points
      });

      setUserData(prev => ({
        ...prev,
        points: newPoints
      }));

      loadActivities();

      if (task.type === 'login') {
        const userStreak = storageService.updateStreak(user.walletAddress);
        if (userStreak % 7 === 0) {
          const bonusPoints = 100;
          storageService.updatePoints(user.walletAddress, bonusPoints);
          storageService.saveActivity(user.walletAddress, {
            type: 'bonus',
            description: `Weekly streak bonus! ${userStreak} days`,
            points: bonusPoints
          });
          
          setUserData(prev => ({
            ...prev,
            points: prev.points + bonusPoints,
            streak: userStreak
          }));
          loadActivities();
        }
      }
    }
  };

  const claimDailyLogin = () => {
    const loginTask = dailyTasks.find(task => task.type === 'login');
    if (loginTask && !loginTask.completed) {
      completeTask(loginTask.id);
    }
  };

  // Helper functions
  const getActivityColor = (type) => {
    switch (type) {
      case 'post': return '#7c3aed';
      case 'transaction': return '#8b5cf6';
      case 'login': return '#10b981';
      case 'follow': return '#f59e0b';
      case 'bonus': return '#ec4899';
      default: return '#6d28d9';
    }
  };

  const getActivityIcon = (type) => {
    switch (type) {
      case 'post': return '📝';
      case 'transaction': return '💸';
      case 'login': return '🔐';
      case 'follow': return '👥';
      case 'bonus': return '🎁';
      default: return '📌';
    }
  };

  const getTransactionColor = (type) => {
    switch (type) {
      case 'send': return '#ef4444';
      case 'receive': return '#10b981';
      case 'swap': return '#f59e0b';
      default: return '#6d28d9';
    }
  };

  const getTransactionIcon = (type) => {
    switch (type) {
      case 'send': return '⬆️';
      case 'receive': return '⬇️';
      case 'swap': return '🔄';
      default: return '📌';
    }
  };

  return (
    <div className="main-content">
      {/* Stats Overview */}
      <div className="grid" style={{ marginBottom: '2rem' }}>
        <div className="card">
          <div className="stats">
            <div className="stat">
              <div className="stat-value">{userData.points}</div>
              <div className="stat-label">Total Points</div>
            </div>
            <div className="stat">
              <div className="stat-value" style={{ color: '#10b981' }}>{userData.streak} days</div>
              <div className="stat-label">Login Streak</div>
            </div>
            <div className="stat">
              <div className="stat-value" style={{ color: '#8b5cf6' }}>Level {userData.level}</div>
              <div className="stat-label">User Level</div>
            </div>
            <div className="stat">
              <div className="stat-value" style={{ color: userData.walletConnected ? '#10b981' : '#ef4444' }}>
                {userData.walletConnected ? 'Connected' : 'Disconnected'}
              </div>
              <div className="stat-label">Wallet Status</div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '1.5rem' }}>
        
        {/* Daily Tasks Section - Enhanced */}
        <div className="card">
          <div className="task-header">
            <div>
              <h3 style={{ color: 'var(--text-primary)', marginBottom: '0.5rem', fontSize: '1.2rem', fontWeight: '600' }}>
                Daily Tasks
              </h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                Complete tasks to earn rewards
              </p>
            </div>
            <div style={{ position: 'relative' }}>
              <span className="task-badge">
                {completedTasks}/{totalTasks}
              </span>
              {pendingTasks > 0 && (
                <span className="task-counter" style={{ background: 'var(--error)' }}>
                  {pendingTasks}
                </span>
              )}
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', maxHeight: '500px', overflowY: 'auto' }}>
            {dailyTasks.map(task => (
              <div
                key={task.id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '1rem',
                  padding: '1.2rem',
                  background: task.completed ? 'rgba(16, 185, 129, 0.1)' : 'var(--glass)',
                  border: `1px solid ${task.completed ? 'rgba(16, 185, 129, 0.3)' : 'var(--glass-border)'}`,
                  borderRadius: '12px',
                  transition: 'all 0.3s ease',
                  position: 'relative'
                }}
              >
                <div style={{
                  width: '44px',
                  height: '44px',
                  background: task.completed ? '#10b981' : 'var(--primary)',
                  borderRadius: '12px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'white',
                  fontSize: '1.1rem',
                  fontWeight: '600',
                  flexShrink: 0
                }}>
                  {task.completed ? '✓' : '+'}
                </div>

                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    alignItems: 'flex-start',
                    marginBottom: '0.4rem',
                    gap: '1rem'
                  }}>
                    <h4 style={{ 
                      color: 'var(--text-primary)', 
                      fontSize: '0.95rem', 
                      fontWeight: '600',
                      margin: 0,
                      lineHeight: '1.4'
                    }}>
                      {task.title}
                    </h4>
                    <span style={{
                      background: 'var(--primary)',
                      color: 'white',
                      padding: '0.3rem 0.7rem',
                      borderRadius: '8px',
                      fontSize: '0.8rem',
                      fontWeight: '600',
                      flexShrink: 0
                    }}>
                      +{task.points}
                    </span>
                  </div>
                  <p style={{ 
                    color: 'var(--text-secondary)', 
                    fontSize: '0.8rem', 
                    margin: 0,
                    lineHeight: '1.4'
                  }}>
                    {task.description}
                  </p>
                </div>

                <button
                  onClick={() => completeTask(task.id)}
                  disabled={task.completed}
                  style={{
                    padding: '0.7rem 1.2rem',
                    background: task.completed ? 'var(--text-muted)' : 'var(--primary)',
                    color: 'white',
                    border: 'none',
                    borderRadius: '10px',
                    fontSize: '0.8rem',
                    fontWeight: '600',
                    cursor: task.completed ? 'not-allowed' : 'pointer',
                    transition: 'all 0.3s ease',
                    minWidth: '90px',
                    flexShrink: 0
                  }}
                  onMouseOver={(e) => !task.completed && (e.target.style.background = 'var(--primary-dark)')}
                  onMouseOut={(e) => !task.completed && (e.target.style.background = 'var(--primary)')}
                >
                  {task.completed ? 'Completed' : 'Claim'}
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Activities */}
        <div className="card">
          <h3 style={{ color: 'var(--text-primary)', marginBottom: '1rem', fontSize: '1.2rem', fontWeight: '600' }}>
            Recent Activities
          </h3>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem', fontSize: '0.9rem' }}>
            Your recent interactions and rewards
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', maxHeight: '400px', overflowY: 'auto' }}>
            {userActivities.map(activity => (
              <div
                key={activity.id}
                style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '1rem',
                  padding: '1rem',
                  background: 'var(--glass)',
                  border: '1px solid var(--glass-border)',
                  borderRadius: '12px',
                  transition: 'all 0.3s ease'
                }}
              >
                <div style={{
                  width: '36px',
                  height: '36px',
                  background: getActivityColor(activity.type),
                  borderRadius: '8px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'white',
                  fontSize: '0.8rem',
                  fontWeight: '600',
                  flexShrink: 0
                }}>
                  {getActivityIcon(activity.type)}
                </div>

                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    alignItems: 'flex-start',
                    marginBottom: '0.3rem',
                    gap: '1rem'
                  }}>
                    <div style={{ flex: 1 }}>
                      <h4 style={{ 
                        color: 'var(--text-primary)', 
                        fontSize: '0.9rem', 
                        fontWeight: '600',
                        margin: '0 0 0.2rem 0',
                        lineHeight: '1.4'
                      }}>
                        {activity.description}
                      </h4>
                      <p style={{ 
                        color: 'var(--text-muted)', 
                        fontSize: '0.75rem', 
                        margin: 0
                      }}>
                        {new Date(activity.timestamp).toLocaleString()}
                      </p>
                    </div>
                    <span style={{
                      background: '#10b981',
                      color: 'white',
                      padding: '0.2rem 0.5rem',
                      borderRadius: '6px',
                      fontSize: '0.75rem',
                      fontWeight: '600',
                      flexShrink: 0
                    }}>
                      +{activity.points}
                    </span>
                  </div>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    marginTop: '0.5rem'
                  }}>
                    <span style={{
                      background: 'var(--dark)',
                      color: 'var(--text-secondary)',
                      padding: '0.2rem 0.5rem',
                      borderRadius: '6px',
                      fontSize: '0.7rem',
                      fontWeight: '500'
                    }}>
                      {activity.type}
                    </span>
                  </div>
                </div>
              </div>
            ))}
            {userActivities.length === 0 && (
              <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
                No activities yet. Complete tasks to earn points!
              </div>
            )}
          </div>
        </div>

        {/* باقي المكونات بنفس النمط */}
      </div>
    </div>
  );
};

export default RewardsDashboard;
