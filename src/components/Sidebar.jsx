import { Link, useNavigate, useLocation } from 'react-router-dom';
import { LayoutDashboard, BookOpen, Layers, LogOut, Settings, Users, Database } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import logo from '../logo.png';
import Avatar from './Avatar';

const Sidebar = ({ active, role: propRole, user: propUser }) => {
  const languageContext = useLanguage() || {};
  const { t = (k) => k, isRTL = false } = languageContext;
  
  const authContext = useAuth() || {};
  const { user: authUser, logout = () => {} } = authContext;
  
  const navigate = useNavigate();
  const location = useLocation();

  const user = propUser || authUser;
  const role = propRole || user?.role || 'student';

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const getMenuItems = () => {
    if (user?.role === 'student') {
      return [
        { name: t('dashboard'), icon: LayoutDashboard, path: '/dashboard' },
        { name: t('openElective'), icon: BookOpen, path: '/open-elective' },
        { name: t('deptElective'), icon: Layers, path: '/dept-elective' },
      ];
    }
    if (user?.role === 'staff') {
      return [
        { name: t('openElective'), icon: BookOpen, path: '/open-elective/admin' },
        { name: t('deptElective'), icon: Layers, path: '/dept-elective/admin' },
      ];
    }
    if (user?.role === 'superadmin') {
      return [
        { name: t('dashboard'), icon: LayoutDashboard, path: '/super-admin' },
        { name: t('settings'), icon: Settings, path: '/super-admin' },
        { name: 'Students', icon: Users, path: '/super-admin' },
        { name: 'System', icon: Database, path: '/super-admin' },
      ];
    }
    return [];
  };

  const menuItems = getMenuItems();

  return (
    <div className={`w-64 h-screen bg-white shadow-md fixed ${isRTL ? 'right-0 border-l' : 'left-0 border-r'} top-0 flex flex-col justify-between z-10 hidden md:flex`}>
      <div>
        <div className="p-6 flex items-center gap-3">
          <img src={logo} alt="ElectiSelect Logo" className="w-10 h-10 rounded-xl shadow-sm" />
          <div>
            <h1 className="text-xl font-bold text-primary">ElectiSelect</h1>
            <p className="text-[10px] text-secondary font-medium tracking-wide uppercase italic">Academic Curator</p>
          </div>
        </div>

        <nav className="mt-6">
          <ul className="space-y-2 px-4">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname.includes(item.path);

              return (
                <li key={item.name}>
                  <Link
                    to={item.path}
                    className={`flex items-center px-4 py-3 rounded-xl transition-colors ${isActive
                        ? 'bg-primary/10 text-primary font-semibold'
                        : 'text-secondary hover:bg-gray-50 hover:text-gray-900'
                      }`}
                  >
                    <Icon className={`w-5 h-5 ${isRTL ? 'ml-3' : 'mr-3'}`} />
                    <span>{item.name}</span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
      </div>

      <div className="p-4 border-t border-gray-100">
        <button
          onClick={handleLogout}
          className={`flex items-center w-full px-4 py-3 rounded-xl text-error hover:bg-red-50 transition-colors mb-4`}
        >
          <LogOut className={`w-5 h-5 ${isRTL ? 'ml-3' : 'mr-3'}`} />
          <span className="font-medium">{t('logout')}</span>
        </button>

        {user && (
          <div className="flex items-center px-4 py-2 bg-gray-50 rounded-xl">
            <Avatar user={user} size={10} className={`${isRTL ? 'ml-3' : 'mr-3'}`} />
            <div className="overflow-hidden">
              <p className="text-sm font-semibold text-gray-900 truncate">{user.name}</p>
              <p className="text-xs text-secondary truncate">{user.email}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Sidebar;
