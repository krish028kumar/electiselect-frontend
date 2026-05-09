import React, { createContext, useState, useContext, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { AlertTriangle, Clock, LogOut, Loader2 } from 'lucide-react';
import api from "../services/api";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const navigate = useNavigate();

  const [user, setUser] = useState(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState(null); // Explicit error state
  const hasProcessedLogin = useRef(false);

  useEffect(() => {
    // 1. Extract Token FIRST
    const params = new URLSearchParams(window.location.search);
    let tokenParam = params.get('token');
    
    // Check if token was accidentally appended to pathname instead of search params
    const pathname = window.location.pathname;
    if (!tokenParam && pathname.startsWith('/login-success') && pathname.length > '/login-success'.length) {
      tokenParam = pathname.substring('/login-success'.length);
      if (tokenParam.startsWith('?token=')) {
        tokenParam = tokenParam.substring(7);
      } else if (tokenParam.startsWith('=')) {
        tokenParam = tokenParam.substring(1);
      }
    }

    // Fallback to local storage if no token in URL
    const token = tokenParam || localStorage.getItem('jwt_token');

    // 2. Prevent Multiple Executions
    if (!hasProcessedLogin.current && token) {
      hasProcessedLogin.current = true;

      // Store immediately
      localStorage.setItem('jwt_token', token);

      // Clean URL if we had a token param
      if (tokenParam) {
        window.history.replaceState({}, document.title, window.location.pathname);
      }

      // 3. Ensure profile call uses new token
      api.getMe()
        .then(me => {
          setAuthError(null);
          setUser({ ...me, role: me.role ? me.role.toUpperCase() : 'STUDENT' });
          setIsLoggedIn(true);

          // 4. Navigate ONLY ONCE
          const currentPath = window.location.pathname;

          if (!me.profileCompleted && me.role !== 'SUPER_ADMIN') {
            navigate('/complete-profile', { replace: true });
            return;
          }

          if (currentPath.startsWith('/login-success') || currentPath === '/login') {
            const role = me.role?.toUpperCase();
            if (role === 'SUPER_ADMIN') navigate('/super-admin', { replace: true });
            else navigate('/dashboard', { replace: true });
          }
        })
        .catch((error) => {
          console.error('❌ Profile fetch failed:', error);
          
          // Show the error on screen instead of silent redirect!
          const errorMsg = error.response?.data?.message || error.message || 'Unknown error occurred';
          setAuthError(`Backend rejected the login (Profile fetch failed): ${errorMsg}. Please ensure the backend is running and you have restarted it after recent changes.`);
          
          localStorage.removeItem('jwt_token');
          setUser(null);
          setIsLoggedIn(false);
          // Do NOT automatically redirect, let the user see the error!
        })
        .finally(() => {
          setLoading(false);
        });
    } else if (!token) {
      setLoading(false);
      if (window.location.pathname !== '/login' && window.location.pathname !== '/register') {
        navigate('/login', { replace: true });
      }
    }
  }, [navigate]);

  useEffect(() => {
    setIsLoggedIn(!!user);
  }, [user]);

  const [currentToast, setCurrentToast] = useState(null);

  // If there is an auth error, render it directly over everything so the user sees it
  if (authError) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-red-50 p-6">
        <div className="bg-white p-8 rounded-2xl shadow-xl max-w-lg text-center border-2 border-red-200">
          <h2 className="text-2xl font-black text-red-600 mb-4">Authentication Error</h2>
          <p className="text-gray-700 font-medium mb-6 leading-relaxed">{authError}</p>
          <button 
            onClick={() => { setAuthError(null); navigate('/login', { replace: true }); }}
            className="px-6 py-3 bg-red-600 text-white rounded-xl font-bold hover:bg-red-700 transition-colors"
          >
            Return to Login
          </button>
        </div>
      </div>
    );
  }

  // 2. Inactivity Security
  const [showTimeoutWarning, setShowTimeoutWarning] = useState(false);
  const [remainingSeconds, setRemainingSeconds] = useState(300); // 5 minutes countdown
  const inactivityTimerRef = useRef(null);
  const warningTimerRef = useRef(null);
  const countdownIntervalRef = useRef(null);

  const resetTimers = () => {
    if (showTimeoutWarning) return; // Don't reset if already showing warning

    clearTimeout(inactivityTimerRef.current);
    clearTimeout(warningTimerRef.current);
    clearInterval(countdownIntervalRef.current);

    if (isLoggedIn) {
      // 25 minutes warning
      warningTimerRef.current = setTimeout(() => {
        setShowTimeoutWarning(true);
        setRemainingSeconds(300);
      }, 25 * 60 * 1000);

      // 30 minutes absolute timeout
      inactivityTimerRef.current = setTimeout(() => {
        logout();
      }, 30 * 60 * 1000);
    }
  };

  useEffect(() => {
    const events = ['mousedown', 'keydown', 'scroll', 'touchstart'];
    events.forEach(event => window.addEventListener(event, resetTimers));
    resetTimers();

    return () => {
      events.forEach(event => window.removeEventListener(event, resetTimers));
      clearTimeout(inactivityTimerRef.current);
      clearTimeout(warningTimerRef.current);
      clearInterval(countdownIntervalRef.current);
    };
  }, [isLoggedIn, showTimeoutWarning]);

  useEffect(() => {
    if (showTimeoutWarning && remainingSeconds > 0) {
      countdownIntervalRef.current = setInterval(() => {
        setRemainingSeconds(prev => prev - 1);
      }, 1000);
    } else if (remainingSeconds <= 0) {
      logout();
    }
    return () => clearInterval(countdownIntervalRef.current);
  }, [showTimeoutWarning, remainingSeconds]);

  // 3. Central Persistence Helper
  const updateCurrentUser = (updates) => {
    const users = JSON.parse(localStorage.getItem('es_users') || '[]');
    const current = JSON.parse(localStorage.getItem('currentUser') || '{}');

    // Create updated object
    const updated = { ...current, ...updates };

    // 1. Update in active state
    setUser(updated);

    // 2. Update in current session (localStorage)
    localStorage.setItem('currentUser', JSON.stringify(updated));

    // 3. Update in global users list
    const updatedUsers = users.map(u => u.id === updated.id ? updated : u);
    localStorage.setItem('es_users', JSON.stringify(updatedUsers));

    // Dispatch event for components that might be listening (like Avatar)
    window.dispatchEvent(new Event('profile-photo-updated'));
  };

  const login = (userData) => {
    const lastLogin = new Date().toLocaleString();
    const updatedUser = { ...userData, lastLogin };

    // Save to persistence
    localStorage.setItem('currentUser', JSON.stringify(updatedUser));
    sessionStorage.setItem('es_session_active', 'true');

    // Sync with main list (incase lastLogin changed)
    const users = JSON.parse(localStorage.getItem('es_users') || '[]');
    const updatedUsers = users.map(u => u.id === userData.id ? updatedUser : u);
    localStorage.setItem('es_users', JSON.stringify(updatedUsers));

    setUser(updatedUser);
    setIsLoggedIn(true);
    resetTimers();

    setTimeout(() => {
      if (updatedUser.role === 'STUDENT') navigate('/dashboard');
      else if (updatedUser.role === 'ISE_ADMIN') navigate('/open-elective/admin');
      else if (updatedUser.role === 'SUPER_ADMIN') navigate('/super-admin');
    }, 0);
  };

  const logout = () => {
    setUser(null);
    setIsLoggedIn(false);
    setShowTimeoutWarning(false);
    localStorage.removeItem('jwt_token');
    localStorage.removeItem('currentUser');
    sessionStorage.removeItem('es_session_active');
    navigate('/login');
  };

  const deleteAccount = () => {
    updateCurrentUser({ isDeleted: true });
    logout();
  };

  // Notification Helpers
  const markAsRead = (id) => {
    const updatedNotifs = user.notifications.map(n => n.id === id ? { ...n, read: true } : n);
    updateCurrentUser({ notifications: updatedNotifs });
  };

  const markAllAsRead = () => {
    const updatedNotifs = user.notifications.map(n => ({ ...n, read: true }));
    updateCurrentUser({ notifications: updatedNotifs });
  };

  const unreadCount = user?.notifications?.filter(n => !n.read).length || 0;

  return (
    <AuthContext.Provider value={{
      user,
      isLoggedIn,
      loading,
      notifications: user?.notifications || [],
      currentToast,
      unreadCount,
      setCurrentToast,
      markAsRead,
      markAllAsRead,
      login,
      logout,
      deleteAccount,
      updateCurrentUser
    }}>
      {children}

      {/* Inactivity Warning Modal */}
      {showTimeoutWarning && (
        <div className="fixed inset-0 z-[9999] bg-black/60 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-300">
          <div className="bg-white rounded-[32px] shadow-2xl border border-gray-100 w-full max-w-[400px] p-8 text-center animate-in zoom-in-95 duration-300">
            <div className="w-16 h-16 bg-orange-50 text-orange-500 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-inner relative">
              <Clock size={32} />
              <div className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full border-2 border-white animate-pulse"></div>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Session Expiring!</h2>
            <p className="text-sm text-gray-500 font-medium mb-8">
              Your session will expire in <span className="text-orange-600 font-bold">{Math.floor(remainingSeconds / 60)}:{(remainingSeconds % 60).toString().padStart(2, '0')}</span> due to inactivity.
            </p>
            <div className="space-y-3">
              <button
                onClick={() => { setShowTimeoutWarning(false); resetTimers(); }}
                className="w-full py-4 bg-primary text-white font-bold rounded-2xl shadow-lg shadow-primary/20 hover:bg-blue-700 transition-all flex items-center justify-center"
              >
                Stay Logged In
              </button>
              <button
                onClick={logout}
                className="w-full py-4 bg-gray-50 text-gray-700 font-bold rounded-2xl hover:bg-gray-100 transition-all flex items-center justify-center"
              >
                <LogOut size={18} className="mr-2" /> Logout Now
              </button>
            </div>
          </div>
        </div>
      )}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
