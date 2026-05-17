import { useEffect, useState } from 'react';
import Sidebar from '../components/Sidebar';
import Navbar from '../components/Navbar';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { BarChart3, Users, UserCheck, UserX, BookCheck, Layers3, Filter } from 'lucide-react';

const SuperAdmin = () => {
  const { user } = useAuth();
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [sessions, setSessions] = useState([]);

  // Filters
  const [filterType, setFilterType] = useState('');
  const [filterSemester, setFilterSemester] = useState('');
  const [filterAcademicYear, setFilterAcademicYear] = useState('');
  const [filterSessionId, setFilterSessionId] = useState('');

  // Fetch all sessions for the dropdown options
  useEffect(() => {
    api.getAllSessions()
      .then(res => setSessions(res || []))
      .catch(err => console.error("Failed to load sessions:", err));
  }, []);

  // Fetch analytics when filters change
  useEffect(() => {
    const fetchAnalytics = async () => {
      setLoading(true);
      try {
        const data = await api.getAdminAnalytics({
          limit: 5,
          type: filterType || undefined,
          semester: filterSemester || undefined,
          academicYear: filterAcademicYear || undefined,
          sessionId: filterSessionId || undefined
        });
        setAnalytics(data || null);
      } catch (err) {
        console.error('Failed to load analytics:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, [filterType, filterSemester, filterAcademicYear, filterSessionId]);

  const cards = [
    { label: 'Total Students', value: analytics?.totalStudents ?? 0, icon: Users },
    { label: 'Eligible Students', value: analytics?.eligibleStudents ?? 0, icon: UserCheck },
    { label: 'Ineligible Students', value: analytics?.ineligibleStudents ?? 0, icon: UserX },
    { label: 'Open Elective Participants', value: analytics?.openElectiveParticipants ?? 0, icon: BookCheck },
    { label: 'Dept Elective Participants', value: analytics?.deptElectiveParticipants ?? 0, icon: Layers3 },
  ];

  // Compute unique dropdown options from loaded sessions
  const uniqueAcademicYears = [...new Set(sessions.map(s => s.academicYear))].filter(Boolean);
  const uniqueSemesters = [...new Set(sessions.map(s => s.semester))].filter(Boolean).sort((a,b) => a-b);

  // Narrow down the specific sessions based on other filters
  const filteredSessions = sessions.filter(s => {
    if (filterType && s.type !== filterType) return false;
    if (filterSemester && s.semester !== parseInt(filterSemester)) return false;
    if (filterAcademicYear && s.academicYear !== filterAcademicYear) return false;
    return true;
  });

  return (
    <div className="min-h-screen flex bg-gray-50/50">
      <Sidebar user={user} />
      <div className="flex-1 md:ml-64 p-4 md:p-8 w-full max-w-7xl mx-auto">
        <Navbar user={user} />

        <div className="mb-8">
          <h1 className="text-3xl font-black text-gray-900 tracking-tight">Admin Dashboard</h1>
          <p className="text-secondary mt-2 font-medium">Quick overview of student participation and eligibility.</p>
        </div>

        {/* Filters Section */}
        <div className="mb-6 bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-2 text-gray-700 font-bold mr-2">
            <Filter className="w-5 h-5 text-primary" />
            Filters
          </div>
          
          <select 
            className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary/20"
            value={filterType}
            onChange={(e) => { setFilterType(e.target.value); setFilterSessionId(''); }}
          >
            <option value="">All Session Types</option>
            <option value="OPEN">Open Elective</option>
            <option value="DEPARTMENT">Department Elective</option>
          </select>

          <select 
            className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary/20"
            value={filterSemester}
            onChange={(e) => { setFilterSemester(e.target.value); setFilterSessionId(''); }}
          >
            <option value="">All Semesters</option>
            {uniqueSemesters.map(sem => <option key={sem} value={sem}>Semester {sem}</option>)}
          </select>

          <select 
            className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary/20"
            value={filterAcademicYear}
            onChange={(e) => { setFilterAcademicYear(e.target.value); setFilterSessionId(''); }}
          >
            <option value="">All Academic Years</option>
            {uniqueAcademicYears.map(ay => <option key={ay} value={ay}>{ay}</option>)}
          </select>

          <select 
            className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary/20 flex-1 min-w-[200px]"
            value={filterSessionId}
            onChange={(e) => setFilterSessionId(e.target.value)}
          >
            <option value="">-- All Specific Sessions --</option>
            {filteredSessions.map(s => (
              <option key={s.id} value={s.id}>
                {s.type} | Sem {s.semester} | {s.academicYear} | {s.active ? 'ACTIVE' : 'INACTIVE'}
              </option>
            ))}
          </select>
          
          {(filterType || filterSemester || filterAcademicYear || filterSessionId) && (
            <button 
              onClick={() => { setFilterType(''); setFilterSemester(''); setFilterAcademicYear(''); setFilterSessionId(''); }}
              className="px-3 py-2 text-sm font-bold text-red-600 hover:bg-red-50 rounded-lg transition-colors"
            >
              Clear
            </button>
          )}
        </div>

        <div className="mb-8 bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-6 border-b border-gray-100 bg-gray-50/50 flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-primary" />
            <h2 className="text-lg font-bold text-gray-900">Quick Summary</h2>
          </div>
          {loading ? (
            <div className="p-8 text-center text-gray-500 font-medium">Loading summary...</div>
          ) : (
            <div className="p-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
              {cards.map((card) => {
                const Icon = card.icon;
                return (
                  <div key={card.label} className="p-4 rounded-xl border border-gray-100 bg-gray-50/40">
                    <div className="flex items-center gap-2 text-gray-500">
                      <Icon className="w-4 h-4" />
                      <p className="text-xs font-bold uppercase tracking-wide">{card.label}</p>
                    </div>
                    <p className="mt-2 text-2xl font-black text-gray-900">{card.value}</p>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SuperAdmin;
