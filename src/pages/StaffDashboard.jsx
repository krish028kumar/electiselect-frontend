import { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import Navbar from '../components/Navbar';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { AlertCircle, BarChart3, TrendingUp, Filter, Database, Download, Calendar, Clock } from 'lucide-react';

const StaffDashboard = () => {
  const { user } = useAuth();
  const [sessions, setSessions] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [analyticsLoading, setAnalyticsLoading] = useState(false);
  const [error, setError] = useState(null);

  // Filters
  const [filterType, setFilterType] = useState('');
  const [filterSemester, setFilterSemester] = useState('');
  const [filterAcademicYear, setFilterAcademicYear] = useState('');
  const [filterSessionId, setFilterSessionId] = useState('');

  // Export state
  const [exportSessionId, setExportSessionId] = useState('');
  const [exportingOpen, setExportingOpen] = useState(false);
  const [exportingDept, setExportingDept] = useState(false);
  const [exportingOpenCsv, setExportingOpenCsv] = useState(false);
  const [exportingDeptCsv, setExportingDeptCsv] = useState(false);

  const isIseStaff = user?.role === 'SUPER_ADMIN' || user?.role === 'ISE_ADMIN' || user?.department?.toUpperCase() === 'ISE';

  useEffect(() => {
    fetchSessions();
  }, []);

  useEffect(() => {
    fetchAnalytics();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filterType, filterSemester, filterAcademicYear, filterSessionId]);

  const fetchSessions = async () => {
    setLoading(true);
    try {
      const data = await api.getStaffSessions();
      setSessions(data || []);
    } catch (err) {
      console.error('Failed to load sessions:', err);
      setError('Failed to load sessions.');
    } finally {
      setLoading(false);
    }
  };

  const fetchAnalytics = async () => {
    setAnalyticsLoading(true);
    try {
      const data = await api.getStaffAnalytics({
        limit: 5,
        type: filterType || undefined,
        semester: filterSemester || undefined,
        academicYear: filterAcademicYear || undefined,
        sessionId: filterSessionId || undefined
      });
      setAnalytics(data || null);
    } catch (err) {
      console.error('Failed to load analytics:', err);
      // Don't overwrite the main error, just silently fail or show toast. 
      // If it's a 403, we know they tried to access dept without ISE
    } finally {
      setAnalyticsLoading(false);
    }
  };

  const handleExportOpen = async () => {
    if (!exportSessionId) return;
    setExportingOpen(true);
    try {
      const blob = await api.exportStaffOpenRegistrations(exportSessionId);
      const url = window.URL.createObjectURL(new Blob([blob]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `open-registrations-session-${exportSessionId}.xlsx`);
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
    } catch (err) {
      console.error("Export failed", err);
      alert("Failed to export open registrations");
    } finally {
      setExportingOpen(false);
    }
  };

  const handleExportOpenCsv = async () => {
    if (!exportSessionId) return;
    setExportingOpenCsv(true);
    try {
      const blob = await api.exportStaffOpenRegistrationsCsv(exportSessionId);
      const url = window.URL.createObjectURL(new Blob([blob]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `open-registrations-session-${exportSessionId}.csv`);
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
    } catch (err) {
      console.error("Export failed", err);
      alert("Failed to export open registrations CSV");
    } finally {
      setExportingOpenCsv(false);
    }
  };

  const handleExportDept = async () => {
    if (!exportSessionId) return;
    setExportingDept(true);
    try {
      const blob = await api.exportStaffDeptRegistrations(exportSessionId);
      const url = window.URL.createObjectURL(new Blob([blob]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `dept-registrations-session-${exportSessionId}.xlsx`);
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
    } catch (err) {
      console.error("Export failed", err);
      alert("Failed to export dept registrations");
    } finally {
      setExportingDept(false);
    }
  };

  const handleExportDeptCsv = async () => {
    if (!exportSessionId) return;
    setExportingDeptCsv(true);
    try {
      const blob = await api.exportStaffDeptRegistrationsCsv(exportSessionId);
      const url = window.URL.createObjectURL(new Blob([blob]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `dept-registrations-session-${exportSessionId}.csv`);
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
    } catch (err) {
      console.error("Export failed", err);
      alert("Failed to export dept registrations CSV");
    } finally {
      setExportingDeptCsv(false);
    }
  };

  const uniqueAcademicYears = [...new Set(sessions.map(s => s.academicYear))].filter(Boolean);
  const uniqueSemesters = [...new Set(sessions.map(s => s.semester))].filter(Boolean).sort((a,b) => a-b);

  const filteredSessions = sessions.filter(s => {
    if (filterType && s.type !== filterType) return false;
    if (filterSemester && s.semester !== parseInt(filterSemester)) return false;
    if (filterAcademicYear && s.academicYear !== filterAcademicYear) return false;
    return true;
  });

  const activeSessionsCount = sessions.filter(s => s.active).length;

  return (
    <div className="min-h-screen flex bg-gray-50/50">
      <Sidebar user={user} role={user?.role} />
      <div className="flex-1 md:ml-64 p-4 md:p-8 w-full max-w-7xl mx-auto">
        <Navbar user={user} />

        <div className="mb-8">
          <h1 className="text-3xl font-black text-gray-900 tracking-tight">Staff Monitor</h1>
          <p className="text-secondary mt-2 font-medium">Read-only operational overview of academic sessions.</p>
        </div>

        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl flex items-center gap-3 shadow-sm">
            <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
            <p className="font-medium text-sm">{error}</p>
          </div>
        )}

        {/* Section 1: Active Sessions Panel */}
        <div className="mb-8 bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-6 border-b border-gray-100 bg-gray-50/50 flex items-center justify-between">
            <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
              <Database className="w-5 h-5 text-primary" />
              Sessions Overview
            </h2>
            <span className="text-xs font-bold bg-blue-100 text-blue-700 px-3 py-1 rounded-full">
              {activeSessionsCount} Active
            </span>
          </div>

          {loading ? (
            <div className="p-8 text-center text-gray-500 font-medium">Loading sessions...</div>
          ) : sessions.length === 0 ? (
            <div className="p-8 text-center text-gray-500 font-medium">No sessions available.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-100">
                    <th className="p-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Type</th>
                    <th className="p-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Semester</th>
                    <th className="p-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Academic Year</th>
                    <th className="p-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Window</th>
                    <th className="p-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Subjects</th>
                    <th className="p-4 text-xs font-bold text-gray-500 uppercase tracking-wider text-center">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {sessions.map((session) => (
                    <tr key={session.id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="p-4">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold ${session.type === 'OPEN' ? 'bg-blue-50 text-blue-700' : 'bg-purple-50 text-purple-700'}`}>
                          {session.type}
                        </span>
                      </td>
                      <td className="p-4 font-semibold text-gray-900">Sem {session.semester}</td>
                      <td className="p-4 text-gray-600 font-medium flex items-center gap-1.5">
                        <Calendar className="w-4 h-4 text-gray-400" />
                        {session.academicYear}
                      </td>
                      <td className="p-4">
                        <div className="text-xs text-gray-600 font-medium flex flex-col gap-1">
                          <span className="flex items-center gap-1.5"><Clock className="w-3.5 h-3.5 text-green-500" /> {new Date(session.startTime).toLocaleString()}</span>
                          <span className="flex items-center gap-1.5"><Clock className="w-3.5 h-3.5 text-red-500" /> {new Date(session.endTime).toLocaleString()}</span>
                        </div>
                      </td>
                      <td className="p-4">
                        <span className="text-sm font-bold text-gray-700">{session.subjectCount}</span>
                      </td>
                      <td className="p-4 text-center">
                        {session.active ? (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-green-50 text-green-700 text-xs font-bold">
                            <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></span>
                            ACTIVE
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-gray-100 text-gray-600 text-xs font-bold">
                            <span className="w-1.5 h-1.5 rounded-full bg-gray-400"></span>
                            INACTIVE
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Section 2: Analytics & Seat Monitoring */}
        <div className="mb-8">
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
              {isIseStaff && <option value="DEPARTMENT">Department Elective</option>}
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
                  {s.type} | Sem {s.semester} | {s.academicYear}
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

          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="p-6 border-b border-gray-100 bg-gray-50/50">
              <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-primary" />
                Participation Metrics
              </h2>
            </div>

            {analyticsLoading ? (
              <div className="p-8 text-center text-gray-500 font-medium">Loading analytics...</div>
            ) : (
              <div className="p-6 space-y-6">
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                  <div className="p-4 rounded-xl border border-gray-100 bg-gray-50/40">
                    <p className="text-xs font-bold text-gray-500 uppercase tracking-wide">Total Students</p>
                    <p className="mt-2 text-2xl font-black text-gray-900">{analytics?.totalStudents ?? 0}</p>
                  </div>
                  <div className="p-4 rounded-xl border border-gray-100 bg-gray-50/40">
                    <p className="text-xs font-bold text-gray-500 uppercase tracking-wide">Eligible</p>
                    <p className="mt-2 text-2xl font-black text-green-600">{analytics?.eligibleStudents ?? 0}</p>
                  </div>
                  <div className="p-4 rounded-xl border border-gray-100 bg-gray-50/40">
                    <p className="text-xs font-bold text-gray-500 uppercase tracking-wide">Open Participants</p>
                    <p className="mt-2 text-2xl font-black text-blue-600">{analytics?.openElectiveParticipants ?? 0}</p>
                  </div>
                  {isIseStaff && (
                    <div className="p-4 rounded-xl border border-gray-100 bg-gray-50/40">
                      <p className="text-xs font-bold text-gray-500 uppercase tracking-wide">Dept Participants</p>
                      <p className="mt-2 text-2xl font-black text-purple-600">{analytics?.deptElectiveParticipants ?? 0}</p>
                    </div>
                  )}
                </div>

                <div className="grid gap-6 md:grid-cols-2">
                  <div className="p-4 rounded-xl border border-gray-100">
                    <h3 className="text-sm font-bold text-gray-900 mb-3">Semester Distribution</h3>
                    <div className="space-y-2">
                      {(analytics?.semesterCounts || []).length === 0 ? (
                        <p className="text-sm text-gray-500">No data available.</p>
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
                  {isIseStaff && (
                    <div className="p-4 rounded-xl border border-gray-100">
                      <h3 className="text-sm font-bold text-gray-900 mb-3">Department Distribution</h3>
                      <div className="space-y-2">
                        {(analytics?.departmentCounts || []).length === 0 ? (
                          <p className="text-sm text-gray-500">No data available.</p>
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
                  )}
                </div>

                <div className="grid gap-6 md:grid-cols-2">
                  <div className="p-4 rounded-xl border border-gray-100">
                    <h3 className="text-sm font-bold text-gray-900 mb-3 flex items-center gap-2">
                      <TrendingUp className="w-4 h-4 text-primary" />
                      Popular Open Electives
                    </h3>
                    <div className="space-y-2">
                      {(analytics?.openElectivePopular || []).length === 0 ? (
                        <p className="text-sm text-gray-500">No open elective selections yet.</p>
                      ) : (
                        analytics.openElectivePopular.map((row) => (
                          <div key={row.subjectId} className="flex items-center justify-between text-sm font-medium text-gray-700">
                            <span className="truncate pr-4" title={row.title}>{row.title}</span>
                            <span className="font-bold text-gray-900 flex-shrink-0">{row.selectionCount} <span className="text-xs text-gray-400 ml-1">/ {row.maxSeats}</span></span>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                  {isIseStaff && (
                    <div className="p-4 rounded-xl border border-gray-100">
                      <h3 className="text-sm font-bold text-gray-900 mb-3 flex items-center gap-2">
                        <TrendingUp className="w-4 h-4 text-primary" />
                        Popular Dept Electives
                      </h3>
                      <div className="space-y-2">
                        {(analytics?.deptElectivePopular || []).length === 0 ? (
                          <p className="text-sm text-gray-500">No department elective selections yet.</p>
                        ) : (
                          analytics.deptElectivePopular.map((row) => (
                            <div key={row.subjectId} className="flex items-center justify-between text-sm font-medium text-gray-700">
                              <span className="truncate pr-4" title={row.title}>{row.title}</span>
                              <span className="font-bold text-gray-900 flex-shrink-0">{row.selectionCount} <span className="text-xs text-gray-400 ml-1">/ {row.maxSeats}</span></span>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Section 3: Exports Panel */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-6 border-b border-gray-100 bg-gray-50/50">
            <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
              <Download className="w-5 h-5 text-primary" />
              Data Exports
            </h2>
          </div>
          <div className="p-6">
            <div className="max-w-md space-y-4">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Select Session to Export</label>
                <select 
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary/20"
                  value={exportSessionId}
                  onChange={(e) => setExportSessionId(e.target.value)}
                >
                  <option value="">-- Choose a session --</option>
                  {sessions.map(s => (
                    // Only show department sessions if ISE staff
                    (s.type !== 'DEPARTMENT' || isIseStaff) && (
                      <option key={s.id} value={s.id}>
                        {s.type} | Sem {s.semester} | {s.academicYear}
                      </option>
                    )
                  ))}
                </select>
              </div>

              <div className="pt-2 flex flex-col gap-3">
                <button
                  onClick={handleExportOpen}
                  disabled={!exportSessionId || exportingOpen || exportingOpenCsv}
                  className="w-full px-4 py-3 bg-blue-50 text-blue-700 border border-blue-200 rounded-xl font-bold hover:bg-blue-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  <Download className="w-4 h-4" />
                  {exportingOpen ? 'Exporting...' : 'Export Open XLSX'}
                </button>

                <button
                  onClick={handleExportOpenCsv}
                  disabled={!exportSessionId || exportingOpen || exportingOpenCsv}
                  className="w-full px-4 py-3 bg-blue-50 text-blue-700 border border-blue-200 rounded-xl font-bold hover:bg-blue-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  <Download className="w-4 h-4" />
                  {exportingOpenCsv ? 'Exporting...' : 'Export Open CSV'}
                </button>

                {isIseStaff && (
                  <>
                    <button
                      onClick={handleExportDept}
                      disabled={!exportSessionId || exportingDept || exportingDeptCsv}
                      className="w-full px-4 py-3 mt-4 bg-purple-50 text-purple-700 border border-purple-200 rounded-xl font-bold hover:bg-purple-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                      <Download className="w-4 h-4" />
                      {exportingDept ? 'Exporting...' : 'Export Dept XLSX'}
                    </button>
                    <button
                      onClick={handleExportDeptCsv}
                      disabled={!exportSessionId || exportingDept || exportingDeptCsv}
                      className="w-full px-4 py-3 bg-purple-50 text-purple-700 border border-purple-200 rounded-xl font-bold hover:bg-purple-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                      <Download className="w-4 h-4" />
                      {exportingDeptCsv ? 'Exporting...' : 'Export Dept CSV'}
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default StaffDashboard;
