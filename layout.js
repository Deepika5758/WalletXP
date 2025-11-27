import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { AuthProvider, useAuth } from '@/components/auth/AuthContext';
import { Home, Wallet, Target, Trophy, BookOpen, Gift, LogOut, User } from 'lucide-react';
import { motion } from 'framer-motion';

function NavBar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    window.location.href = createPageUrl('Home');
  };

  if (!user) return null;

  const navItems = [
    { icon: Home, label: 'Home', page: 'Home' },
    { icon: Wallet, label: 'Budget', page: 'Budget' },
    { icon: Target, label: 'Save', page: 'Savings' },
    { icon: Trophy, label: 'Challenges', page: 'Challenges' },
    { icon: BookOpen, label: 'Learn', page: 'Learn' },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 px-2 py-2 z-50">
      <div className="max-w-lg mx-auto flex items-center justify-around">
        {navItems.map((item, index) => (
          <Link
            key={index}
            to={createPageUrl(item.page)}
            className="flex flex-col items-center gap-1 px-3 py-2 rounded-xl hover:bg-gray-50 transition-colors"
          >
            <item.icon className="w-5 h-5 text-gray-500" />
            <span className="text-xs text-gray-600">{item.label}</span>
          </Link>
        ))}
        <button
          onClick={handleLogout}
          className="flex flex-col items-center gap-1 px-3 py-2 rounded-xl hover:bg-red-50 transition-colors"
        >
          <LogOut className="w-5 h-5 text-red-500" />
          <span className="text-xs text-red-600">Logout</span>
        </button>
      </div>
    </nav>
  );
}

function LayoutContent({ children, currentPageName }) {
  const { user, loading } = useAuth();
  const publicPages = [];
  const isPublicPage = publicPages.includes(currentPageName);

  useEffect(() => {
    if (!loading && !user && !isPublicPage) {
      // Redirect to login if not authenticated
    }
  }, [user, loading, isPublicPage]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-800">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="text-center"
        >
          <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Wallet className="w-8 h-8 text-indigo-600" />
          </div>
          <p className="text-white text-lg">Loading WalletXP...</p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {children}
      {!isPublicPage && <NavBar />}
    </div>
  );
}

export default function Layout({ children, currentPageName }) {
  return (
    <AuthProvider>
      <LayoutContent currentPageName={currentPageName}>
        {children}
      </LayoutContent>
    </AuthProvider>
  );
}
