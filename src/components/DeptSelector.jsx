import { motion } from 'framer-motion';
import { LayoutGrid, Cpu, Code, Zap, Settings, HardHat, Briefcase, Activity } from 'lucide-react';

const DeptSelector = ({ selectedDept, onSelect }) => {
  const departments = [
    { id: 'ALL', name: 'All Departments', icon: LayoutGrid, color: 'text-primary bg-blue-50' },
    { id: 'CSE', name: 'CSE', icon: Cpu, color: 'text-purple-600 bg-purple-50' },
    { id: 'ISE', name: 'ISE', icon: Code, color: 'text-emerald-600 bg-emerald-50' },
    { id: 'ECE', name: 'ECE', icon: Zap, color: 'text-amber-600 bg-amber-50' },
    { id: 'MECH', name: 'MECH', icon: Settings, color: 'text-rose-600 bg-rose-50' },
    { id: 'CIVIL', name: 'CIVIL', icon: HardHat, color: 'text-orange-600 bg-orange-50' },
    { id: 'MBA', name: 'MBA', icon: Briefcase, color: 'text-indigo-600 bg-indigo-50' },
    { id: 'EEE', name: 'EEE', icon: Activity, color: 'text-cyan-600 bg-cyan-50' }
  ];

  return (
    <div className="mb-10">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-sm font-black text-gray-400 uppercase tracking-[0.2em] mb-1">Live Filter</h2>
          <h3 className="text-xl font-bold text-gray-900 tracking-tight">Select Department to Monitor</h3>
        </div>
        <div className="hidden md:flex bg-blue-50 px-4 py-2 rounded-full border border-blue-100 items-center">
          <div className="w-2 h-2 bg-primary rounded-full animate-pulse mr-2"></div>
          <span className="text-[10px] font-black text-primary uppercase tracking-widest">Global Sync Enabled</span>
        </div>
      </div>
      
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3 md:gap-4">
        {departments.map((dept) => {
          const isActive = selectedDept === dept.id;
          const Icon = dept.icon;
          
          return (
            <motion.button
              key={dept.id}
              whileHover={{ y: -4, shadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1)" }}
              whileTap={{ scale: 0.95 }}
              onClick={() => onSelect(dept.id)}
              className={`flex flex-col items-center justify-center p-4 rounded-2xl border-2 transition-all duration-300 ${
                isActive 
                  ? 'border-primary bg-primary text-white shadow-xl shadow-primary/20' 
                  : 'border-white bg-white text-gray-600 hover:border-gray-200 shadow-sm'
              }`}
            >
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 transition-colors ${
                isActive ? 'bg-white/20 text-white' : dept.color
              }`}>
                <Icon className="w-5 h-5" />
              </div>
              <span className={`text-[11px] font-black uppercase tracking-wider ${isActive ? 'text-white' : 'text-gray-900'}`}>
                {dept.name}
              </span>
            </motion.button>
          );
        })}
      </div>
    </div>
  );
};

export default DeptSelector;
