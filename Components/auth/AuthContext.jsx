import React, { createContext, useContext, useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';

const AuthContext = createContext(null);

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedUser = localStorage.getItem('walletxp_user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);

  const login = async (username, password) => {
    const users = await base44.entities.UserProfile.filter({ username });
    if (users.length === 0) {
      throw new Error('User not found');
    }
    const foundUser = users[0];
    if (foundUser.password !== password) {
      throw new Error('Invalid password');
    }
    setUser(foundUser);
    localStorage.setItem('walletxp_user', JSON.stringify(foundUser));
    return foundUser;
  };

  const signup = async (username, password) => {
    const existingUsers = await base44.entities.UserProfile.filter({ username });
    if (existingUsers.length > 0) {
      throw new Error('Username already exists');
    }
    const newUser = await base44.entities.UserProfile.create({
      username,
      password,
      monthly_income: 0,
      xp_points: 0,
      level: 1,
      current_streak: 0,
      longest_streak: 0,
      badges: ['Beginner'],
      completed_lessons: [],
      is_creator: false
    });
    setUser(newUser);
    localStorage.setItem('walletxp_user', JSON.stringify(newUser));
    return newUser;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('walletxp_user');
  };

  const updateUser = async (data) => {
    const updated = await base44.entities.UserProfile.update(user.id, data);
    const newUser = { ...user, ...data };
    setUser(newUser);
    localStorage.setItem('walletxp_user', JSON.stringify(newUser));
    return newUser;
  };

  const refreshUser = async () => {
    if (user?.id) {
      const users = await base44.entities.UserProfile.filter({ id: user.id });
      if (users.length > 0) {
        setUser(users[0]);
        localStorage.setItem('walletxp_user', JSON.stringify(users[0]));
      }
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, signup, logout, updateUser, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
};
