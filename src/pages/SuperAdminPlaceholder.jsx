import Sidebar from '../components/Sidebar';
import Navbar from '../components/Navbar';
import { useAuth } from '../context/AuthContext';

const SuperAdminPlaceholder = ({ title }) => {
  const { user } = useAuth();
  
  return (
    <div className="min-h-screen flex bg-background">
      <Sidebar user={user} />
      <div className="flex-1 md:ml-64 p-4 md:p-8 w-full max-w-7xl mx-auto">
        <Navbar user={user} />
        
        <div className="mb-8">
          <h1 className="text-3xl font-black text-gray-900 tracking-tight">{title}</h1>
          <p className="text-secondary mt-2 font-medium">This module is currently under development.</p>
        </div>

        <div className="bg-white p-12 rounded-[24px] shadow-sm border border-gray-100 flex flex-col items-center justify-center text-center h-64">
           <div className="w-16 h-16 bg-gray-50 rounded-2xl flex items-center justify-center mb-4">
             <span className="text-gray-300 text-2xl font-black">⚙️</span>
           </div>
           <p className="text-gray-400 font-bold uppercase tracking-widest text-sm">Feature Not Available Yet</p>
           <p className="text-gray-400 text-xs mt-2 font-medium">The {title} interface will be implemented in a future update.</p>
        </div>

      </div>
    </div>
  );
};

export default SuperAdminPlaceholder;
