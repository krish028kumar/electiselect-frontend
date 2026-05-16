import { useEffect, useState } from 'react';
import Sidebar from '../components/Sidebar';
import Navbar from '../components/Navbar';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { BarChart3, Users, UserCheck, UserX, BookCheck, Layers3 } from 'lucide-react';

const SuperAdmin = () => {
  const { user } = useAuth();
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const data = await api.getAdminAnalytics(5);
        setAnalytics(data || null);
      } catch (err) {
        console.error('Failed to load analytics:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, []);

  const cards = [
    { label: 'Total Students', value: analytics?.totalStudents ?? 0, icon: Users },
    { label: 'Eligible Students', value: analytics?.eligibleStudents ?? 0, icon: UserCheck },
    { label: 'Ineligible Students', value: analytics?.ineligibleStudents ?? 0, icon: UserX },
    { label: 'Open Elective Participants', value: analytics?.openElectiveParticipants ?? 0, icon: BookCheck },
    { label: 'Dept Elective Participants', value: analytics?.deptElectiveParticipants ?? 0, icon: Layers3 },
  ];

  return (
    <div className="min-h-screen flex bg-gray-50/50">
      <Sidebar user={user} />
      <div className="flex-1 md:ml-64 p-4 md:p-8 w-full max-w-7xl mx-auto">
        <Navbar user={user} />

        <div className="mb-8">
          <h1 className="text-3xl font-black text-gray-900 tracking-tight">Admin Dashboard</h1>
          <p className="text-secondary mt-2 font-medium">Quick overview of student participation and eligibility.</p>
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
