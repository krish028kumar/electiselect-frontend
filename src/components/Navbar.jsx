import { useState, useRef, useEffect } from 'react';
import { Bell, User, Settings, LogOut, CheckCircle2, X } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import logo from '../logo.png';
import EditProfileModal from './EditProfileModal';
import SettingsModal from './SettingsModal';
import Avatar from './Avatar';

const Navbar = ({ user: propUser }) => {
  const authContext = useAuth() || {};
  const { user: authUser, logout = () => {}, notifications = [], unreadCount = 0, markAsRead = () => {}, markAllAsRead = () => {}, currentToast = null, setCurrentToast = () => {} } = authContext;
  
  const languageContext = useLanguage() || {};
  const { t = (k) => k, isRTL = false } = languageContext;

  const user = propUser || authUser;

  const getEmoji = (gender) => {
    const g = gender?.toLowerCase();
    if (g === 'male') return '👦';
    if (g === 'female') return '👧';
    return '👋';
  };
  const emoji = getEmoji(user?.gender);

  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isEditProfileOpen, setIsEditProfileOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  const notifRef = useRef(null);
  const profileRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (notifRef.current && !notifRef.current.contains(event.target)) {
        setIsNotifOpen(false);
      }
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setIsProfileOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  if (!user) return null;

  return (
    <>
      {currentToast && (
        <div className={`fixed top-6 ${isRTL ? 'left-6' : 'right-6'} z-[100] bg-white rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.12)] border border-gray-100 p-4 w-[340px] animate-in slide-in-from-top-4 fade-in duration-300 flex items-start gap-4`}>
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 text-white shadow-sm ${currentToast.type === 'blue' ? 'bg-blue-500' : currentToast.type === 'orange' ? 'bg-orange-500' : 'bg-green-500'}`}>
            <Bell size={20} />
          </div>
          <div className="flex-1 cursor-pointer" onClick={() => { setIsNotifOpen(true); setCurrentToast(null); }}>
            <h4 className="text-[13px] font-bold text-gray-900 leading-snug">{currentToast.title}</h4>
            <p className="text-[11px] font-medium text-gray-500 mt-1">ElectiSelect • Just now</p>
          </div>
          <button onClick={() => setCurrentToast(null)} className="text-gray-400 hover:text-gray-600 outline-none"><X size={16} /></button>
        </div>
      )}

      <div className="h-20 bg-transparent flex items-center justify-between px-4 md:px-8 mb-4 relative z-40">
        <div className="flex items-center gap-4">
          <img src={logo} alt="ElectiSelect Logo" className="w-8 h-8 rounded-xl md:hidden shadow-sm" />
          <div>
            <h2 className="text-lg sm:text-2xl font-bold text-primary">{t('welcomeBack')}, {user?.name || 'Student'} {emoji}</h2>
            <p className="text-xs sm:text-sm text-secondary mt-1 hidden sm:block">{t('academicJourney')}</p>
          </div>
        </div>

        <div className="flex items-center space-x-6 relative">
          {/* Notif Bell */}
          <div className="relative" ref={notifRef}>
            <div
              onClick={() => { setIsNotifOpen(!isNotifOpen); setIsProfileOpen(false); }}
              className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-sm cursor-pointer hover:bg-gray-50 outline outline-1 outline-gray-200 transition-colors"
            >
              <Bell className="w-5 h-5 text-gray-600" />
              {unreadCount > 0 && (
                <span className={`absolute top-0 ${isRTL ? 'left-0' : 'right-0'} w-4 h-4 bg-red-500 text-white text-[10px] font-bold flex items-center justify-center rounded-full outline outline-2 outline-white shadow-sm`}>
                  {unreadCount}
                </span>
              )}
            </div>

            {isNotifOpen && (
              <div className={`absolute ${isRTL ? 'left-0' : 'right-0'} mt-3 w-[360px] bg-white rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.08)] border border-gray-100 z-50 animate-in fade-in zoom-in-95 duration-200 overflow-hidden`}>
                <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                  <h3 className="font-bold text-gray-900">{t('notifications')}</h3>
                  {unreadCount > 0 && (
                    <button onClick={markAllAsRead} className="text-primary text-[12px] font-bold hover:underline outline-none">Mark all as read</button>
                  )}
                </div>
                <div className="max-h-[300px] overflow-y-auto">
                  {notifications.slice(0, 5).map(notif => (
                    <div key={notif.id} className={`p-4 border-b border-gray-50 hover:bg-gray-50 transition-colors flex gap-3 group relative ${notif.read ? 'opacity-60' : ''}`}>
                      {!notif.read ? (
                        <div className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 shadow-sm ${notif.type === 'blue' ? 'bg-blue-500' : notif.type === 'orange' ? 'bg-orange-500' : 'bg-green-500'}`}></div>
                      ) : (
                        <div className="w-2 h-2 rounded-full mt-1.5 flex-shrink-0 bg-transparent"></div>
                      )}
                      <div className={`flex-1 ${isRTL ? 'pl-6' : 'pr-6'}`}>
                        <p className={`text-[13px] leading-snug ${notif.read ? 'text-gray-500 font-medium' : 'text-gray-800 font-bold'}`}>{notif.title}</p>
                        <p className="text-[11px] text-gray-400 mt-1.5 font-medium">{notif.time}</p>
                      </div>
                      {!notif.read && (
                        <button
                          onClick={() => markAsRead(notif.id)}
                          className={`absolute ${isRTL ? 'left-3' : 'right-3'} top-4 opacity-0 group-hover:opacity-100 text-gray-400 hover:text-primary transition-all bg-white shadow-sm border border-gray-100 p-1 rounded-md`}
                          title="Mark as read"
                        >
                          <CheckCircle2 size={14} />
                        </button>
                      )}
                    </div>
                  ))}
                  {notifications.length === 0 && (
                    <div className="p-6 text-center text-gray-500 text-sm font-medium">No notifications yet</div>
                  )}
                </div>
                <div className="p-3 border-t border-gray-100 bg-gray-50/50 text-center">
                  <Link to="/notifications" onClick={() => setIsNotifOpen(false)} className="text-[12px] font-bold text-gray-600 hover:text-gray-900 transition-colors outline-none inline-block w-full">View all notifications</Link>
                </div>
              </div>
            )}
          </div>

          {/* Profile */}
          <div className={`flex items-center ${isRTL ? 'pr-6 border-r' : 'pl-6 border-l'} border-gray-200`} ref={profileRef}>
            <div className={`${isRTL ? 'text-left ml-3' : 'text-right mr-3'} hidden sm:block`}>
              <p className="text-sm font-bold text-gray-900">{user?.name || 'Student'}</p>
              <p className="text-xs text-secondary font-medium tracking-wide uppercase">
                {user?.role === 'student' ? (user?.usn || user?.USN || 'N/A') : (user?.staffId || user?.adminId || 'ID N/A')}
              </p>
            </div>

            <div className="relative">
              <div onClick={() => { setIsProfileOpen(!isProfileOpen); setIsNotifOpen(false); }}>
                <Avatar user={user} size={10} className="cursor-pointer hover:outline hover:outline-2 hover:outline-blue-200 transition-all" />
              </div>

              {isProfileOpen && (
                <div className={`absolute ${isRTL ? 'left-0' : 'right-0'} mt-3 w-[260px] bg-white rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.08)] border border-gray-100 z-50 animate-in fade-in zoom-in-95 slide-in-from-top-2 duration-200`}>

                  <div className="p-5 flex flex-col items-center border-b border-gray-100">
                    <Avatar user={user} size={16} className="text-2xl mb-3 shadow-inner border border-blue-200" />
                    <h3 className="font-bold text-gray-900 text-lg tracking-tight">{user.name}</h3>
                    <p className="text-[13px] text-gray-500 mb-2.5 font-medium">{user.email}</p>

                    <span className="bg-blue-50 text-primary px-3 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider mb-3 border border-blue-100">
                      {user.role}
                    </span>

                    {user?.role === 'student' && (
                      <div className="flex flex-col items-center text-[12.5px] text-gray-600 font-semibold">
                        <p>{user?.department || 'N/A'} • Semester {user?.semester || 'N/A'}</p>
                        <p className="mt-1 text-gray-800">{user?.usn || user?.USN || 'N/A'}</p>
                      </div>
                    )}
                  </div>

                  <div className="p-3 space-y-2">
                    <button onClick={() => { setIsProfileOpen(false); setIsEditProfileOpen(true); }} className="w-full flex items-center justify-center px-4 py-2.5 text-[13px] font-bold text-gray-700 border border-gray-200 hover:border-gray-300 hover:bg-gray-50 rounded-xl transition-all shadow-sm">
                      <User size={16} className={`${isRTL ? 'ml-2' : 'mr-2'} text-gray-500`} />
                      {t('editProfile')}
                    </button>
                    <button onClick={() => { setIsProfileOpen(false); setIsSettingsOpen(true); }} className="w-full flex items-center justify-center px-4 py-2.5 text-[13px] font-bold text-gray-700 border border-gray-200 hover:border-gray-300 hover:bg-gray-50 rounded-xl transition-all shadow-sm">
                      <Settings size={16} className={`${isRTL ? 'ml-2' : 'mr-2'} text-gray-500`} />
                      {t('settings')}
                    </button>
                  </div>

                  <div className="p-3 border-t border-gray-100">
                    <button
                      onClick={logout}
                      className="w-full flex items-center justify-center px-4 py-2.5 text-[13px] font-bold text-white bg-red-500 hover:bg-red-600 rounded-xl transition-all shadow-sm shadow-red-500/20 cursor-pointer"
                    >
                      <LogOut size={16} className={`${isRTL ? 'ml-2' : 'mr-2'}`} />
                      {t('logout')}
                    </button>
                  </div>

                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <EditProfileModal isOpen={isEditProfileOpen} onClose={() => setIsEditProfileOpen(false)} />
      <SettingsModal isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} />
    </>
  );
};

export default Navbar;
