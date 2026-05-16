import { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import Navbar from '../components/Navbar';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { AlertCircle, BarChart3, TrendingUp } from 'lucide-react';

const SystemAdmin = () => {
  const { user } = useAuth();
  const [analytics, setAnalytics] = useState(null);
  const [analyticsLoading, setAnalyticsLoading] = useState(false);
  const [analyticsError, setAnalyticsError] = useState(null);

  const fetchAnalytics = async () => {
    setAnalyticsLoading(true);
    setAnalyticsError(null);
    try {
      const data = await api.getAdminAnalytics(5);
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
  }, []);

  const analyticsCards = [
    { label: 'Total Students', value: analytics?.totalStudents ?? 0 },
    { label: 'Eligible Students', value: analytics?.eligibleStudents ?? 0 },
    { label: 'Ineligible Students', value: analytics?.ineligibleStudents ?? 0 },
    { label: 'Open Elective Participants', value: analytics?.openElectiveParticipants ?? 0 },
    { label: 'Dept Elective Participants', value: analytics?.deptElectiveParticipants ?? 0 },
  ];

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
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
                {analyticsCards.map((card) => (
                  <div key={card.label} className="p-4 rounded-xl border border-gray-100 bg-gray-50/40">
                    <p className="text-xs font-bold text-gray-500 uppercase tracking-wide">{card.label}</p>
                    <p className="mt-2 text-2xl font-black text-gray-900">{card.value}</p>
                  </div>
                ))}
              </div>

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

              <div className="grid gap-6 md:grid-cols-2">
                <div className="p-4 rounded-xl border border-gray-100">
                  <h3 className="text-sm font-bold text-gray-900 mb-3 flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-primary" />
                    Open Elective Participation
                  </h3>
                  <div className="space-y-2">
                    {(analytics?.openElectivePopular || []).length === 0 ? (
                      <p className="text-sm text-gray-500">No open elective selections yet.</p>
                    ) : (
                      analytics.openElectivePopular.map((row) => (
                        <div key={row.subjectId} className="flex items-center justify-between text-sm font-medium text-gray-700">
                          <span>{row.title}</span>
                          <span className="font-bold text-gray-900">{row.selectionCount}</span>
                        </div>
                      ))
                    )}
                  </div>
                </div>
                <div className="p-4 rounded-xl border border-gray-100">
                  <h3 className="text-sm font-bold text-gray-900 mb-3 flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-primary" />
                    Dept Elective Participation
                  </h3>
                  <div className="space-y-2">
                    {(analytics?.deptElectivePopular || []).length === 0 ? (
                      <p className="text-sm text-gray-500">No department elective selections yet.</p>
                    ) : (
                      analytics.deptElectivePopular.map((row) => (
                        <div key={row.subjectId} className="flex items-center justify-between text-sm font-medium text-gray-700">
                          <span>{row.title}</span>
                          <span className="font-bold text-gray-900">{row.selectionCount}</span>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SystemAdmin;
