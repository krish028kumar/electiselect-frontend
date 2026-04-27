import React, { createContext, useState, useContext, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { AlertTriangle, Clock, LogOut, Loader2 } from 'lucide-react';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const navigate = useNavigate();
  
  // 1. Core State
  const [user, setUser] = useState(() => {
    try {
      const session = sessionStorage.getItem('es_session');
      if (session) return JSON.parse(session);
      
      const stored = localStorage.getItem('currentUser');
      if (stored) return JSON.parse(stored);
      
      return null;
    } catch {
      return null;
    }
  });

  const [isLoggedIn, setIsLoggedIn] = useState(!!user);

  // Sync isLoggedIn when user changes
  useEffect(() => {
    setIsLoggedIn(!!user);
  }, [user]);

  const [currentToast, setCurrentToast] = useState(null);
  
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
      if (updatedUser.role === 'student') navigate('/dashboard');
      else if (updatedUser.role === 'staff') navigate('/open-elective/admin');
      else if (updatedUser.role === 'superadmin') navigate('/super-admin');
    }, 0);
  };

  const logout = () => {
    setUser(null);
    setIsLoggedIn(false);
    setShowTimeoutWarning(false);
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
