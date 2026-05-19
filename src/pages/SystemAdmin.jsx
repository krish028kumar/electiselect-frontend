import { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import Navbar from '../components/Navbar';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { AlertCircle, BarChart3, TrendingUp, Filter, Users, UserCheck, Activity, BookOpen, Layers, Percent } from 'lucide-react';
import { AnalyticsCharts } from '../components/AnalyticsCharts';

const SystemAdmin = () => {
  const { user } = useAuth();
  const [analytics, setAnalytics] = useState(null);
  const [analyticsLoading, setAnalyticsLoading] = useState(false);
  const [analyticsError, setAnalyticsError] = useState(null);
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

  const fetchAnalytics = async () => {
    setAnalyticsLoading(true);
    setAnalyticsError(null);
    try {
      const data = await api.getAdminAnalytics({
        limit: 1000,
        type: filterType || undefined,
        semester: filterSemester || undefined,
        academicYear: filterAcademicYear || undefined,
        sessionId: filterSessionId || undefined
      });
      setAnalytics(data || null);
    } catch (err) {
      console.error('Failed to load analytics:', err);
      setAnalyticsError('Failed to load admin analytics.');
    } finally {
      setAnalyticsLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filterType, filterSemester, filterAcademicYear, filterSessionId]);

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

  const activeSessionsCount = filteredSessions.filter(s => s.active).length;
  const totalSubjectsCount = filteredSessions.reduce((acc, curr) => acc + (curr.subjectCount || 0), 0);
  const totalRegistrations = (analytics?.openElectiveParticipants ?? 0) + (analytics?.deptElectiveParticipants ?? 0);
  
  // Seat Utilization Calculation
  const openElectives = analytics?.openElectivePopular || [];
  const deptElectives = analytics?.deptElectivePopular || [];
  const allElectives = [...openElectives, ...deptElectives];
  const totalMaxSeats = allElectives.reduce((acc, curr) => acc + (curr.maxSeats || 0), 0);
  const totalFilledSeats = allElectives.reduce((acc, curr) => acc + (curr.filledSeats || 0), 0);
  
  const seatUtilizationRaw = totalMaxSeats > 0 ? (totalFilledSeats / totalMaxSeats) * 100 : 0;
  let seatUtilizationFormatted = '0%';
  if (seatUtilizationRaw > 0 && seatUtilizationRaw < 10) {
    seatUtilizationFormatted = `${seatUtilizationRaw.toFixed(1)}%`;
  } else if (seatUtilizationRaw >= 10) {
    seatUtilizationFormatted = `${Math.round(seatUtilizationRaw)}%`;
  }

  const analyticsCards = [
    { label: 'Total Students', value: analytics?.totalStudents ?? 0, icon: Users },
    { label: 'Eligible Students', value: analytics?.eligibleStudents ?? 0, icon: UserCheck },
    { label: 'Active Sessions', value: activeSessionsCount, icon: Activity },
    { label: 'Total Subjects', value: totalSubjectsCount, icon: BookOpen },
    { label: 'Total Registrations', value: totalRegistrations, icon: Layers },
    { label: 'Seat Utilization', value: seatUtilizationFormatted, icon: Percent },
  ];

  // Pre-computed derived fields are above

  return (
    <div className="min-h-screen flex bg-gray-50/50">
      <Sidebar user={user} role="SUPER_ADMIN" />
      <div className="flex-1 md:ml-64 p-4 md:p-8 w-full max-w-7xl mx-auto">
        <Navbar user={user} />

        <div className="mb-8">
          <h1 className="text-3xl font-black text-gray-900 tracking-tight">System Analytics</h1>
          <p className="text-secondary mt-2 font-medium">Read-only monitoring for student analytics and participation.</p>
        </div>

        {analyticsError && (
          <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl flex items-center gap-3 shadow-sm">
            <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
            <p className="font-medium text-sm">{analyticsError}</p>
          </div>
        )}

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
          <div className="p-6 border-b border-gray-100 bg-gray-50/50 flex items-center justify-between gap-4">
            <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-primary" />
              Admin Analytics
            </h2>
            <button
              onClick={fetchAnalytics}
              className="px-4 py-2 bg-primary/10 text-primary rounded-xl text-sm font-bold hover:bg-primary/20 transition-colors"
            >
              Refresh Analytics
            </button>
          </div>

          {analyticsLoading ? (
            <div className="p-8 text-center text-gray-500 font-medium">Loading analytics...</div>
          ) : (
            <div className="p-6 space-y-6">
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-6">
                {analyticsCards.map((card) => {
                  const Icon = card.icon;
                  return (
                    <div key={card.label} className="p-4 rounded-xl border border-gray-100 bg-gray-50/40">
                      <div className="flex items-center gap-2 text-gray-500 mb-2">
                        <Icon className="w-4 h-4" />
                        <p className="text-xs font-bold uppercase tracking-wide">{card.label}</p>
                      </div>
                      <p className="text-2xl font-black text-gray-900">{card.value}</p>
                    </div>
                  );
                })}
              </div>

              {/* Data Visualization Charts */}
              <AnalyticsCharts analytics={analytics} isIseStaff={true} />

              <div className="grid gap-6 md:grid-cols-2">
                <div className="p-4 rounded-xl border border-gray-100">
                  <h3 className="text-sm font-bold text-gray-900 mb-3">Department Distribution</h3>
                  <div className="space-y-2">
                    {(analytics?.departmentCounts || []).length === 0 ? (
                      <p className="text-sm text-gray-500">No department data available.</p>
                    ) : (
                      analytics.departmentCounts.map((row) => (
                        <div key={row.department || 'NA'} className="flex items-center justify-between text-sm font-medium text-gray-700">
                          <span>{row.department || '—'}</span>
                          <span className="font-bold text-gray-900">{row.count}</span>
                        </div>
                      ))
                    )}
                  </div>
                </div>
                <div className="p-4 rounded-xl border border-gray-100">
                  <h3 className="text-sm font-bold text-gray-900 mb-3">Semester Distribution</h3>
                  <div className="space-y-2">
                    {(analytics?.semesterCounts || []).length === 0 ? (
                      <p className="text-sm text-gray-500">No semester data available.</p>
                    ) : (
                      analytics.semesterCounts.map((row) => (
                        <div key={row.semester} className="flex items-center justify-between text-sm font-medium text-gray-700">
                          <span>Semester {row.semester || '—'}</span>
                          <span className="font-bold text-gray-900">{row.count}</span>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>

              {/* Removed redundant text lists since charts now handle it gracefully */}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SystemAdmin;
