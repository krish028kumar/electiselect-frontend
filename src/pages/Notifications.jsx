import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { CheckCircle2, BellRing, Bell, Trash2 } from 'lucide-react';
import Sidebar from '../components/Sidebar';
import Navbar from '../components/Navbar';

const Notifications = () => {
  const { user, notifications, markAsRead, markAllAsRead, unreadCount } = useAuth();
  const [activeTab, setActiveTab] = useState('All');

  const filteredNotifications = notifications.filter(notif => {
    if (activeTab === 'Unread') return !notif.read;
    if (activeTab === 'Read') return notif.read;
    return true;
  });

  return (
    <div className="min-h-screen flex bg-background font-sans">
      <Sidebar user={user} />
      <div className="flex-1 md:ml-64 p-4 md:p-8 w-full max-w-7xl mx-auto">
        <Navbar user={user} />

        <div className="mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Notifications</h1>
            <p className="text-sm text-gray-500 mt-1 font-medium">Stay updated on your academics</p>
          </div>
          {unreadCount > 0 && (
            <button 
              onClick={markAllAsRead}
              className="px-4 py-2 bg-blue-50 text-blue-600 font-bold rounded-xl hover:bg-blue-100 transition-colors flex items-center shadow-sm text-[13px]"
            >
              <CheckCircle2 size={16} className="mr-2" />
              Mark all as read
            </button>
          )}
        </div>

        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="flex border-b border-gray-100">
            {['All', 'Unread', 'Read'].map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`flex-1 py-4 text-[13px] font-bold transition-colors outline-none relative ${activeTab === tab ? 'text-primary' : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'}`}
              >
                {tab}
                {tab === 'Unread' && unreadCount > 0 && (
                  <span className="ml-2 px-2 py-0.5 bg-red-500 text-white text-[10px] rounded-full">{unreadCount}</span>
                )}
                {activeTab === tab && (
                  <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary animate-in fade-in zoom-in-95" />
                )}
              </button>
            ))}
          </div>

          <div className="p-2 sm:p-6 min-h-[400px]">
            {filteredNotifications.length > 0 ? (
              <div className="space-y-4">
                {filteredNotifications.map(notif => (
                  <div 
                    key={notif.id}
                    className={`p-4 sm:p-5 rounded-2xl border transition-all flex flex-col sm:flex-row sm:items-center gap-4 group relative ${notif.read ? 'bg-gray-50 border-transparent opacity-75' : 'bg-white border-blue-100 shadow-sm hover:border-blue-200'}`}
                  >
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0 text-white shadow-sm ${notif.type === 'blue' ? 'bg-blue-500' : notif.type === 'orange' ? 'bg-orange-500' : notif.type === 'green' ? 'bg-green-500' : 'bg-gray-400'}`}>
                      <Bell size={22} />
                    </div>
                    <div className="flex-1 pr-6 sm:pr-24">
                      <h4 className={`text-[14px] leading-snug mb-1 ${notif.read ? 'font-medium text-gray-700' : 'font-bold text-gray-900'}`}>{notif.title}</h4>
                      <p className="text-[12px] font-medium text-gray-500">{notif.time}</p>
                    </div>
                    {!notif.read && (
                      <button 
                        onClick={() => markAsRead(notif.id)}
                        className="absolute right-4 top-4 sm:static sm:opacity-0 group-hover:opacity-100 text-gray-400 hover:text-primary transition-all p-2 rounded-xl bg-white sm:bg-transparent border border-gray-100 sm:border-transparent outline-none flex items-center gap-2"
                        title="Mark as read"
                      >
                        <CheckCircle2 size={18} />
                        <span className="sm:hidden text-[11px] font-bold">Mark Read</span>
                      </button>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="h-full min-h-[300px] flex flex-col items-center justify-center text-center px-4 animate-in fade-in duration-500">
                <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mb-4 text-gray-300">
                  <BellRing size={32} />
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-1">You're all caught up!</h3>
                <p className="text-sm font-medium text-gray-500 max-w-sm">There are no {activeTab !== 'All' ? activeTab.toLowerCase() : ''} notifications to display right now.</p>
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};

export default Notifications;
