import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

const DEPARTMENTS = ['ISE', 'CSE', 'ECE', 'EEE', 'ME', 'CV', 'CH', 'TE', 'BT'];
const SEMESTERS = [1, 2, 3, 4, 5, 6, 7, 8];

const CompleteProfile = () => {
  const navigate = useNavigate();
  const [me, setMe] = useState(null);
  const [form, setForm] = useState({ name: '', phone: '', department: '', semester: '' });
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    api.getMe()
      .then(data => {
        if (data.profileCompleted || data.role === 'SUPER_ADMIN') {
          navigate('/dashboard', { replace: true });
          return;
        }
        setMe(data);
        setForm(f => ({ ...f, name: data.name || '' }));
        setLoading(false);
      })
      .catch(() => {
        navigate('/login', { replace: true });
      });
  }, [navigate]);

  const role = me?.role?.toUpperCase();

  const isValid = () => {
    if (!form.name.trim() || !form.phone.trim() || !form.department) return false;
    if (role === 'STUDENT' && !form.semester) return false;
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isValid()) return;
    setSubmitting(true);
    setError('');
    try {
      await api.completeProfile({
        name: form.name.trim(),
        phone: form.phone.trim(),
        department: form.department,
        semester: role === 'STUDENT' ? parseInt(form.semester) : null,
      });
      // Re-fetch me to update context state and redirect
      const updated = await api.getMe();
      if (updated.role?.toUpperCase() === 'SUPER_ADMIN') {
        navigate('/super-admin', { replace: true });
      } else {
        navigate('/dashboard', { replace: true });
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Something went wrong. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <p className="text-gray-500 font-medium animate-pulse">Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="bg-white rounded-3xl shadow-xl border border-gray-100 w-full max-w-md p-8">
        {/* Header */}
        <div className="mb-8 text-center">
          <div className="w-14 h-14 bg-blue-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <span className="text-3xl">👤</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Complete Your Profile</h1>
          <p className="text-sm text-gray-500 mt-1">
            This is required before you can access the platform.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Full Name */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Full Name</label>
            <input
              type="text"
              value={form.name}
              onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
              placeholder="Enter your full name"
              required
              className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-gray-50 transition-all"
            />
          </div>

          {/* Phone */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Phone Number</label>
            <input
              type="tel"
              value={form.phone}
              onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
              placeholder="+91 XXXXXXXXXX"
              required
              className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-gray-50 transition-all"
            />
          </div>

          {/* Department */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Department</label>
            <select
              value={form.department}
              onChange={e => setForm(f => ({ ...f, department: e.target.value }))}
              required
              className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-gray-50 transition-all appearance-none"
            >
              <option value="">Select Department</option>
              {DEPARTMENTS.map(d => (
                <option key={d} value={d}>{d}</option>
              ))}
            </select>
          </div>

          {/* Semester — only for STUDENT */}
          {role === 'STUDENT' && (
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Current Semester</label>
              <select
                value={form.semester}
                onChange={e => setForm(f => ({ ...f, semester: e.target.value }))}
                required
                className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-gray-50 transition-all appearance-none"
              >
                <option value="">Select Semester</option>
                {SEMESTERS.map(s => (
                  <option key={s} value={s}>Semester {s}</option>
                ))}
              </select>
            </div>
          )}

          {/* Error */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-sm text-red-700 font-medium">
              {error}
            </div>
          )}

          {/* Submit */}
          <button
            type="submit"
            disabled={!isValid() || submitting}
            className={`w-full py-3.5 rounded-xl font-bold text-sm transition-all ${
              isValid() && !submitting
                ? 'bg-blue-600 text-white hover:bg-blue-700 shadow-lg shadow-blue-500/20'
                : 'bg-gray-100 text-gray-400 cursor-not-allowed'
            }`}
          >
            {submitting ? 'Saving...' : 'Complete Profile'}
          </button>
        </form>

        <p className="text-xs text-center text-gray-400 mt-6">
          Logged in as <span className="font-semibold">{me?.email}</span>
        </p>
      </div>
    </div>
  );
};

export default CompleteProfile;
