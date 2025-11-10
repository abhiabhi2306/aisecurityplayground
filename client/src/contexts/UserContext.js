import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const UserContext = createContext();

export const useUser = () => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};

export const UserProvider = ({ children, userId }) => {
  const [userStats, setUserStats] = useState(null);
  const [progress, setProgress] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (userId) {
      initializeUser();
    }
  }, [userId]);

  const initializeUser = async () => {
    try {
      setLoading(true);
      
      // Initialize user on server
      await axios.post('/api/progress/user', { userId });
      
      // Fetch user stats and progress
      await Promise.all([
        fetchUserStats(),
        fetchProgress()
      ]);
    } catch (error) {
      console.error('Failed to initialize user:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchUserStats = async () => {
    try {
      const response = await axios.get(`/api/progress/user/${userId}/stats`);
      setUserStats(response.data);
    } catch (error) {
      console.error('Failed to fetch user stats:', error);
    }
  };

  const fetchProgress = async () => {
    try {
      const response = await axios.get(`/api/challenges/progress/${userId}`);
      setProgress(response.data);
    } catch (error) {
      console.error('Failed to fetch progress:', error);
    }
  };

  const updateProgress = async (challengeId, completed, successfulPayload = null) => {
    try {
      await axios.post(`/api/challenges/progress/${userId}/${challengeId}`, {
        completed,
        successfulPayload
      });
      
      // Refresh stats and progress
      await Promise.all([
        fetchUserStats(),
        fetchProgress()
      ]);
    } catch (error) {
      console.error('Failed to update progress:', error);
    }
  };

  const value = {
    userId,
    userStats,
    progress,
    loading,
    updateProgress,
    refreshStats: fetchUserStats,
    refreshProgress: fetchProgress
  };

  return (
    <UserContext.Provider value={value}>
      {children}
    </UserContext.Provider>
  );
};
