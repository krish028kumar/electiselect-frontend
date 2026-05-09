import { useState, useMemo, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import Navbar from '../components/Navbar';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { 
  UploadCloud, Settings, Database, Server, Info, Search, 
  Users, BookCheck, ClipboardCheck, BarChart3, Filter, PieChart
} from 'lucide-react';

const SuperAdmin = () => {
  const { user } = useAuth();
  const [sessionActive, setSessionActive] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [deptFilter, setDeptFilter] = useState('All');
  const [semFilter, setSemFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');

  const [students, setStudents] = useState([]);
  const [stats, setStats] = useState({ total: 0, openSelected: 0, deptSelected: 0, bothSelected: 0 });
  const [popularElectives, setPopularElectives] = useState([]);
  const [loading, setLoading] = useState(true);

  // Load backend data
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [statsData, studentsData, popularData] = await Promise.all([
          api.getAdminDashboardStats(),
          api.getAdminDashboardStudents(),
          api.getPopularElectives()
        ]);
        
        // Map backend stats to our UI state
        setStats({
          total: statsData.registeredStudents || 0,
          openSelected: statsData.openElectiveTaken || 0,
          deptSelected: statsData.deptElectiveTaken || 0,
          bothSelected: statsData.fullyCompleted || 0
        });

        setStudents(studentsData || []);
        setPopularElectives(popularData || []);
      } catch (err) {
        console.error("Failed to load dashboard data:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  // Filtered Data for Table
  const filteredStudents = useMemo(() => {
    return students.filter(s => {
      const matchesSearch = (s.name || '').toLowerCase().includes(searchQuery.toLowerCase()) || 
                           (s.usn || s.USN || '').toLowerCase().includes(searchQuery.toLowerCase());
      const matchesDept = deptFilter === 'All' || s.department === deptFilter;
      const matchesSem = semFilter === 'All' || s.semester?.toString() === semFilter;
      
      let matchesStatus = true;
      if (statusFilter === 'Selected') {
        matchesStatus = s.openElectiveSelected || s.deptElectiveCompleted;
      } else if (statusFilter === 'Not Selected') {
        matchesStatus = !s.openElectiveSelected && !s.deptElectiveCompleted;
      }

      return matchesSearch && matchesDept && matchesSem && matchesStatus;
    });
  }, [students, searchQuery, deptFilter, semFilter, statusFilter]);

  const studentColumns = [
    { header: 'USN', accessor: 'usn', render: (row) => <span className="font-bold text-gray-700">{row.usn || '—'}</span> },
    { header: 'Student Name', accessor: 'name', render: (row) => <span className="font-semibold text-gray-900">{row.name || '—'}</span> },
    { header: 'Dept', accessor: 'department', render: (row) => <span className="text-xs font-bold px-2 py-0.5 bg-gray-100 rounded-md">{row.department || '—'}</span> },
    { header: 'Sem', accessor: 'semester' },
    { 
      header: 'Open Elective', 
      accessor: 'openSelected',
      render: (row) => row.openElectiveSelected ? (
        <span className="text-[10px] font-bold text-blue-600 bg-blue-50 px-2 py-1 rounded-md border border-blue-100">Selected</span>
      ) : (
        <span className="text-[10px] font-bold text-gray-400 bg-gray-50 px-2 py-1 rounded-md border border-gray-100">None</span>
      )
    },
    { 
      header: 'Dept Elective', 
      accessor: 'deptCompleted',
      render: (row) => row.deptElectiveCompleted ? (
        <span className="text-[10px] font-bold text-purple-600 bg-purple-50 px-2 py-1 rounded-md border border-purple-100">Completed</span>
      ) : (
        <span className="text-[10px] font-bold text-gray-400 bg-gray-50 px-2 py-1 rounded-md border border-gray-100">Pending</span>
      )
    },
    {
      header: 'Status',
      accessor: 'status',
      render: (row) => {
        const isComplete = row.openElectiveSelected && row.deptElectiveCompleted;
        return (
          <span className={`text-[10px] font-black uppercase tracking-widest ${isComplete ? 'text-green-500' : 'text-amber-500'}`}>
            {isComplete ? 'Complete' : 'Pending'}
          </span>
        );
      }
    }
  ];

  return (
    <div className="min-h-screen flex bg-background">
      <Sidebar user={user} />
      <div className="flex-1 md:ml-64 p-4 md:p-8 w-full max-w-7xl mx-auto">
        <Navbar user={user} />
        
        <div className="mb-8 flex justify-between items-end">
          <div>
            <h1 className="text-3xl font-black text-gray-900 tracking-tight">Super Admin Overview</h1>
            <p className="text-secondary mt-2 font-medium">Real-time enrollment monitoring and student management</p>
          </div>
          <div className="hidden md:flex items-center bg-white px-4 py-2 rounded-xl shadow-sm border border-gray-100 h-fit">
            <div className="w-2 h-2 rounded-full bg-success mr-2 animate-pulse"></div>
            <span className="text-xs font-bold text-gray-700 tracking-tight">System Status: LIVE</span>
          </div>
        </div>

        {/* Real-Time Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
          <div className="bg-white p-6 rounded-[24px] shadow-sm border border-gray-100 flex items-center">
            <div className="bg-blue-50 p-3 rounded-2xl text-primary mr-4 shadow-sm"><Users size={24} /></div>
            <div>
              <p className="text-[10px] text-gray-400 font-extrabold uppercase tracking-widest">Registered Students</p>
              <h3 className="text-2xl font-black text-gray-900">{stats.total}</h3>
            </div>
          </div>
          <div className="bg-white p-6 rounded-[24px] shadow-sm border border-gray-100 flex items-center">
            <div className="bg-orange-50 p-3 rounded-2xl text-orange-500 mr-4 shadow-sm"><BookCheck size={24} /></div>
            <div>
              <p className="text-[10px] text-gray-400 font-extrabold uppercase tracking-widest">Open Elective Taken</p>
              <h3 className="text-2xl font-black text-gray-900">{stats.openSelected}</h3>
            </div>
          </div>
          <div className="bg-white p-6 rounded-[24px] shadow-sm border border-gray-100 flex items-center">
            <div className="bg-purple-50 p-3 rounded-2xl text-purple-500 mr-4 shadow-sm"><ClipboardCheck size={24} /></div>
            <div>
              <p className="text-[10px] text-gray-400 font-extrabold uppercase tracking-widest">Dept Elective Taken</p>
              <h3 className="text-2xl font-black text-gray-900">{stats.deptSelected}</h3>
            </div>
          </div>
          <div className="bg-white p-6 rounded-[24px] shadow-sm border border-gray-100 flex items-center">
            <div className="bg-green-50 p-3 rounded-2xl text-green-500 mr-4 shadow-sm"><PieChart size={24} /></div>
            <div>
              <p className="text-[10px] text-gray-400 font-extrabold uppercase tracking-widest">Fully Completed</p>
              <h3 className="text-2xl font-black text-gray-900">{stats.bothSelected}</h3>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-10">
          {/* Main Enrolled Students Table */}
          <div className="lg:col-span-2 bg-white rounded-[32px] shadow-sm border border-gray-100 flex flex-col overflow-hidden h-fit">
            <div className="p-6 border-b border-gray-50 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <h2 className="text-xl font-black text-gray-900 flex items-center">
                Enrolled Students
                <span className="ml-3 bg-blue-50 text-primary text-[10px] font-black px-2 py-0.5 rounded-md border border-blue-100 tracking-widest uppercase">
                  {filteredStudents.length} Students
                </span>
              </h2>
              
              <div className="flex flex-wrap gap-2 w-full md:w-auto">
                <div className="relative flex-1 md:w-48">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400"><Search size={14} /></div>
                  <input
                    type="text"
                    placeholder="Search USN/Name"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary/10 outline-none text-xs font-bold transition-all"
                  />
                </div>
                <select 
                  value={deptFilter} 
                  onChange={(e) => setDeptFilter(e.target.value)}
                  className="bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-xs font-bold text-gray-600 outline-none"
                >
                  <option value="All">All Depts</option>
                  <option value="ISE">ISE</option>
                  <option value="CSE">CSE</option>
                  <option value="ECE">ECE</option>
                  <option value="ME">ME</option>
                  <option value="CV">CV</option>
                </select>
                <select 
                  value={statusFilter} 
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-xs font-bold text-gray-600 outline-none"
                >
                  <option value="All">All Status</option>
                  <option value="Selected">Selected</option>
                  <option value="Not Selected">Not Selected</option>
                </select>
              </div>
            </div>

            <div className="overflow-x-auto">
              {filteredStudents.length === 0 ? (
                <div className="py-20 text-center">
                  <p className="text-gray-400 font-bold italic">No students match the criteria.</p>
                </div>
              ) : (
                <table className="w-full text-sm text-left">
                  <thead>
                    <tr className="border-b border-gray-100 bg-gray-50/60">
                      {studentColumns.map((col) => (
                        <th key={col.accessor} className="px-4 py-3 text-[10px] font-extrabold text-gray-400 uppercase tracking-widest whitespace-nowrap">
                          {col.header}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {filteredStudents.map((row, idx) => (
                      <tr key={idx} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                        {studentColumns.map((col) => (
                          <td key={col.accessor} className="px-4 py-3">
                            {col.render ? col.render(row) : row[col.accessor] ?? '—'}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>

          {/* Side Panel: Popular Courses & Actions */}
          <div className="space-y-8 h-fit">
            <div className="bg-gray-900 text-white rounded-[32px] p-8 shadow-2xl relative overflow-hidden group">
               <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -translate-y-16 translate-x-16 group-hover:scale-110 transition-transform duration-700"></div>
               <h3 className="font-extrabold text-lg mb-6 flex items-center"><BarChart3 size={20} className="mr-3 text-primary" /> Popular Electives</h3>
               
               <div className="space-y-5 mb-8 relative z-10">
                 {loading ? (
                   <p className="text-center text-gray-500 py-6 italic font-bold">Loading...</p>
                 ) : popularElectives.length > 0 ? popularElectives.map((course, idx) => (
                   <div key={idx} className="flex items-center justify-between">
                     <div className="flex flex-col">
                       <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">RANK #{idx+1}</span>
                       <span className="text-sm font-bold truncate max-w-[180px]">{course.title}</span>
                     </div>
                     <div className="text-right">
                        <span className="text-lg font-black text-primary">{course.selectionCount}</span>
                        <p className="text-[10px] text-gray-500 font-bold uppercase">Students</p>
                     </div>
                   </div>
                 )) : (
                   <p className="text-center text-gray-500 py-6 italic font-bold">No selections recorded yet.</p>
                 )}
               </div>
               
               <button className="w-full py-3 bg-white/10 hover:bg-white/15 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] transition-all flex items-center justify-center border border-white/10">
                 Full Analytics Report <ArrowRight size={14} className="ml-2" />
               </button>
            </div>

            <div className="bg-white rounded-[32px] p-6 shadow-sm border border-gray-100 flex flex-col">
              <div className="flex items-center mb-6">
                <div className="bg-blue-50 p-2 rounded-lg text-primary mr-3"><Settings size={18} /></div>
                <p className="text-[10px] font-extrabold text-gray-400 uppercase tracking-widest">Session Control</p>
              </div>
              <div className="space-y-4">
                 <div className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl border border-gray-100">
                    <div>
                      <p className="font-bold text-gray-900 text-sm">System Access</p>
                      <p className="text-[10px] text-gray-500 font-medium">Main login toggle</p>
                    </div>
                    <button 
                      onClick={() => setSessionActive(!sessionActive)}
                      className={`relative w-11 h-6 rounded-full transition-colors ${sessionActive ? 'bg-primary' : 'bg-gray-300'}`}
                    >
                      <span className={`absolute top-1 w-4 h-4 rounded-full bg-white shadow-sm transition-transform ${sessionActive ? 'left-6' : 'left-1'}`}></span>
                    </button>
                 </div>
                 <button className="w-full py-4 bg-primary text-white font-black text-xs uppercase tracking-widest rounded-2xl shadow-lg shadow-primary/20 hover:bg-blue-700 transition-all">
                   Manage Deadlines
                 </button>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

const ArrowRight = ({ size, className }) => (
  <svg 
    width={size} 
    height={size} 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2.5" 
    strokeLinecap="round" 
    strokeLinejoin="round" 
    className={className}
  >
    <path d="M5 12h14" />
    <path d="m12 5 7 7-7 7" />
  </svg>
);

export default SuperAdmin;
