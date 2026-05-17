import { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import Navbar from '../components/Navbar';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { Database, Plus, CheckCircle2, XCircle, Clock, Calendar, AlertCircle, X, Upload, FileSpreadsheet, Zap, ChevronRight, Eye, AlertTriangle } from 'lucide-react';
import { validateAcademicYear } from '../utils/validation';

const SuperAdminSettings = () => {
  const { user } = useAuth();
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [showModal, setShowModal] = useState(false);
  const [newSession, setNewSession] = useState({
    type: 'OPEN',
    semester: '',
    academicYear: '',
    startTime: '',
    endTime: ''
  });
  const [formError, setFormError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [actionModal, setActionModal] = useState({ type: null, session: null });
  const [actionError, setActionError] = useState(null);
  const [isActionSubmitting, setIsActionSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState(null);

  // ── Smart Upload state ─────────────────────────────────────────────────────
  const [smartUpload, setSmartUpload] = useState({
    show: false,
    session: null,
    file: null,
    step: 'select',   // 'select' | 'previewing' | 'preview' | 'confirming' | 'done'
    preview: null,    // SubjectUploadPreviewDTO
    error: null,
    result: null,     // SubjectUploadConfirmResultDTO
    showErrors: false,
  });

  const fetchSessions = async () => {
    setLoading(true);
    try {
      const data = await api.getAllSessions();
      setSessions(data || []);
      setError(null);
    } catch (err) {
      console.error('Failed to load sessions:', err);
      setError('Failed to load sessions from the server.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSessions();
  }, []);

  const showSuccess = (msg) => {
    setSuccessMessage(msg);
    setTimeout(() => setSuccessMessage(null), 4000);
  };

  const confirmAction = async () => {
    if (!actionModal.session) return;
    setIsActionSubmitting(true);
    setActionError(null);

    try {
      if (actionModal.type === 'ACTIVATE') {
        await api.activateSession(actionModal.session.id);
        showSuccess('Session activated successfully');
      } else {
        await api.deactivateSession(actionModal.session.id);
        showSuccess('Session deactivated successfully');
      }
      fetchSessions();
      setActionModal({ type: null, session: null });
    } catch (err) {
      const msg = err.response?.data?.error || `Failed to ${actionModal.type.toLowerCase()} session`;
      setActionError(msg);
    } finally {
      setIsActionSubmitting(false);
    }
  };

  const handleCreateSession = async (e) => {
    e.preventDefault();
    setFormError(null);

    if (!newSession.type || !newSession.semester || !newSession.academicYear || !newSession.startTime || !newSession.endTime) {
      setFormError('All fields are required.');
      return;
    }
    if (new Date(newSession.startTime) > new Date(newSession.endTime)) {
      setFormError('Start time cannot be after end time.');
      return;
    }

    const ayError = validateAcademicYear(newSession.academicYear);
    if (ayError) {
      setFormError(ayError);
      return;
    }

    setIsSubmitting(true);
    try {
      await api.createSession({
        ...newSession,
        semester: parseInt(newSession.semester, 10),
        isActive: false
      });
      setShowModal(false);
      setNewSession({ type: 'OPEN', semester: '', academicYear: '', startTime: '', endTime: '' });
      fetchSessions();
    } catch (err) {
      setFormError(err.response?.data?.message || err.response?.data?.error || 'Failed to create session.');
    } finally {
      setIsSubmitting(false);
    }
  };



  // ── Smart Upload handlers ──────────────────────────────────────────────────
  const openSmartUpload = (session) => {
    setSmartUpload({
      show: true,
      session,
      file: null,
      step: 'select',
      preview: null,
      error: null,
      result: null,
      showErrors: false,
    });
  };

  const closeSmartUpload = () => {
    setSmartUpload(prev => ({ ...prev, show: false }));
  };

  const handleSmartPreview = async () => {
    if (!smartUpload.session) {
      setSmartUpload(prev => ({ ...prev, error: 'Session context is missing.' }));
      return;
    }
    if (!smartUpload.file) {
      setSmartUpload(prev => ({ ...prev, error: 'Please select an Excel file.' }));
      return;
    }
    setSmartUpload(prev => ({ ...prev, step: 'previewing', error: null }));
    try {
      const preview = await api.previewSubjectUpload(smartUpload.session.id, smartUpload.file);
      setSmartUpload(prev => ({ ...prev, step: 'preview', preview, error: null }));
    } catch (err) {
      const msg = err.response?.data?.message || err.response?.data || err.message || 'Preview failed.';
      setSmartUpload(prev => ({
        ...prev,
        step: 'select',
        error: typeof msg === 'string' ? msg : 'Preview failed. Check the file and session.',
      }));
    }
  };

  const handleSmartConfirm = async () => {
    if (!smartUpload.preview?.validSubjects?.length) return;
    setSmartUpload(prev => ({ ...prev, step: 'confirming', error: null }));
    try {
      const result = await api.confirmSubjectUpload(
        smartUpload.session.id,
        smartUpload.preview.validSubjects
      );
      setSmartUpload(prev => ({ ...prev, step: 'done', result, error: null }));
      showSuccess(`${result.createdCount} subject(s) saved successfully!`);
      fetchSessions();
    } catch (err) {
      const msg = err.response?.data?.message || err.response?.data || err.message || 'Confirm failed.';
      setSmartUpload(prev => ({
        ...prev,
        step: 'preview',
        error: typeof msg === 'string' ? msg : 'Failed to save subjects.',
      }));
    }
  };

  return (
    <div className="min-h-screen flex bg-gray-50/50">
      <Sidebar user={user} role="SUPER_ADMIN" />
      <div className="flex-1 md:ml-64 p-4 md:p-8 w-full max-w-7xl mx-auto">
        <Navbar user={user} />

        <div className="mb-8 flex justify-between items-end">
          <div>
            <h1 className="text-3xl font-black text-gray-900 tracking-tight">System Settings</h1>
            <p className="text-secondary mt-2 font-medium">Manage elective registration sessions and configuration.</p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowModal(true)}
              className="flex items-center gap-2 bg-primary text-white px-5 py-2.5 rounded-xl font-semibold hover:bg-primary/90 transition-colors shadow-sm"
            >
              <Plus className="w-5 h-5" />
              Create Session
            </button>
          </div>
        </div>

        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl flex items-center gap-3 shadow-sm">
            <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
            <p className="font-medium text-sm">{error}</p>
          </div>
        )}

        {successMessage && (
          <div className="mb-6 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-xl flex items-center gap-3 shadow-sm animate-in fade-in slide-in-from-top-2 duration-300">
            <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0" />
            <p className="font-medium text-sm">{successMessage}</p>
          </div>
        )}

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-6 border-b border-gray-100 bg-gray-50/50">
            <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
              <Database className="w-5 h-5 text-primary" />
              All Sessions
            </h2>
          </div>

          {loading ? (
            <div className="p-12 text-center text-gray-500 font-medium">Loading sessions...</div>
          ) : sessions.length === 0 ? (
            <div className="p-12 text-center flex flex-col items-center justify-center">
              <Database className="w-12 h-12 text-gray-200 mb-4" />
              <p className="text-gray-500 font-medium">No sessions created yet.</p>
            </div>
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
                    <th className="p-4 text-xs font-bold text-gray-500 uppercase tracking-wider text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {sessions.map((session) => (
                    <tr key={session.id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="p-4">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold ${session.type === 'OPEN' ? 'bg-blue-50 text-blue-700' : 'bg-purple-50 text-purple-700'
                          }`}>
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
                        {session.subjectCount > 0 ? (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-bold">
                            {session.subjectCount} Subjects Uploaded
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-gray-100 text-gray-600 text-xs font-bold">
                            No Upload Yet
                          </span>
                        )}
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
                      <td className="p-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          {!session.active && (
                            <button
                              onClick={() => openSmartUpload(session)}
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white border border-blue-200 text-blue-600 hover:bg-blue-50 hover:border-blue-300 rounded-lg text-xs font-bold transition-colors shadow-sm"
                            >
                              <Upload className="w-4 h-4" /> {session.subjectCount > 0 ? 'Re-upload' : 'Upload'}
                            </button>
                          )}

                          {session.active ? (
                            <button
                              onClick={() => setActionModal({ type: 'DEACTIVATE', session })}
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white border border-red-200 text-red-600 hover:bg-red-50 hover:border-red-300 rounded-lg text-xs font-bold transition-colors shadow-sm"
                            >
                              <XCircle className="w-4 h-4" /> Deactivate
                            </button>
                          ) : (
                            <button
                              onClick={() => setActionModal({ type: 'ACTIVATE', session })}
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white border border-green-200 text-green-600 hover:bg-green-50 hover:border-green-300 rounded-lg text-xs font-bold transition-colors shadow-sm"
                            >
                              <CheckCircle2 className="w-4 h-4" /> Activate
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Create Session Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
              <h3 className="text-xl font-bold text-gray-900">Create New Session</h3>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600 transition-colors">
                <X className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleCreateSession} className="p-6">
              {formError && (
                <div className="mb-4 p-3 bg-red-50 text-red-700 text-sm font-medium rounded-xl border border-red-100 flex items-start gap-2">
                  <AlertCircle className="w-5 h-5 flex-shrink-0" />
                  {formError}
                </div>
              )}

              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1.5">Type</label>
                    <select
                      className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all text-sm font-medium"
                      value={newSession.type}
                      onChange={(e) => setNewSession({ ...newSession, type: e.target.value })}
                    >
                      <option value="OPEN">Open Elective</option>
                      <option value="DEPARTMENT">Department Elective</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1.5">Semester</label>
                    <input
                      type="number"
                      min="1"
                      max="8"
                      placeholder="e.g. 5"
                      className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all text-sm"
                      value={newSession.semester}
                      onChange={(e) => setNewSession({ ...newSession, semester: e.target.value })}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1.5">Academic Year</label>
                  <input
                    type="text"
                    placeholder="e.g. 2024-2025"
                    className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all text-sm"
                    value={newSession.academicYear}
                    onChange={(e) => setNewSession({ ...newSession, academicYear: e.target.value })}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1.5">Start Time</label>
                    <input
                      type="datetime-local"
                      className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all text-sm"
                      value={newSession.startTime}
                      onChange={(e) => setNewSession({ ...newSession, startTime: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1.5">End Time</label>
                    <input
                      type="datetime-local"
                      className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all text-sm"
                      value={newSession.endTime}
                      onChange={(e) => setNewSession({ ...newSession, endTime: e.target.value })}
                    />
                  </div>
                </div>
              </div>

              <div className="mt-8 flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 px-4 py-2.5 border border-gray-200 text-gray-700 rounded-xl font-bold hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 px-4 py-2.5 bg-primary text-white rounded-xl font-bold hover:bg-primary/90 transition-colors disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? 'Creating...' : 'Create Session'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}


      {/* Action Confirmation Modal */}
      {actionModal.type && actionModal.session && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className={`p-6 border-b border-gray-100 flex justify-between items-center ${actionModal.type === 'ACTIVATE' ? 'bg-green-50/50' : 'bg-red-50/50'
              }`}>
              <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                {actionModal.type === 'ACTIVATE' ? <CheckCircle2 className="w-5 h-5 text-green-600" /> : <AlertCircle className="w-5 h-5 text-red-600" />}
                Confirm {actionModal.type === 'ACTIVATE' ? 'Activation' : 'Deactivation'}
              </h3>
              <button onClick={() => setActionModal({ type: null, session: null })} className="text-gray-400 hover:text-gray-600 transition-colors">
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="p-6">
              {actionError && (
                <div className="mb-6 p-3 bg-red-50 text-red-700 text-sm font-medium rounded-xl border border-red-100 flex items-start gap-2">
                  <AlertCircle className="w-5 h-5 flex-shrink-0" />
                  {actionError}
                </div>
              )}

              <p className="text-gray-600 mb-6 font-medium">
                {actionModal.type === 'ACTIVATE'
                  ? 'Students matching this session will gain access to elective registration. Please ensure subjects have been uploaded before activating.'
                  : 'Eligible students may lose access to elective registration.'}
              </p>

              <div className="bg-gray-50 rounded-xl p-4 border border-gray-100 space-y-3 mb-8">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500 font-medium">Type</span>
                  <span className="font-bold text-gray-900">{actionModal.session.type}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500 font-medium">Semester</span>
                  <span className="font-bold text-gray-900">{actionModal.session.semester}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500 font-medium">Academic Year</span>
                  <span className="font-bold text-gray-900">{actionModal.session.academicYear}</span>
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setActionModal({ type: null, session: null })}
                  className="flex-1 px-4 py-2.5 border border-gray-200 text-gray-700 rounded-xl font-bold hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmAction}
                  disabled={isActionSubmitting}
                  className={`flex-1 px-4 py-2.5 text-white rounded-xl font-bold transition-colors disabled:opacity-70 disabled:cursor-not-allowed ${actionModal.type === 'ACTIVATE'
                      ? 'bg-green-600 hover:bg-green-700'
                      : 'bg-red-600 hover:bg-red-700'
                    }`}
                >
                  {isActionSubmitting ? 'Processing...' : `Confirm ${actionModal.type === 'ACTIVATE' ? 'Activation' : 'Deactivation'}`}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Smart Subject Upload Modal ────────────────────────────────────────── */}
      {smartUpload.show && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">

            {/* Header */}
            <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gradient-to-r from-indigo-50 to-blue-50">
              <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                <Zap className="w-5 h-5 text-indigo-600" />
                Smart Subject Upload
              </h3>
              <button onClick={closeSmartUpload} className="text-gray-400 hover:text-gray-600 transition-colors">
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Progress steps */}
            <div className="px-6 pt-4 pb-0">
              <div className="flex items-center gap-2 text-xs font-bold mb-4">
                <span className={`px-2.5 py-1 rounded-full ${smartUpload.step === 'select' ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-500'
                  }`}>1 Select</span>
                <ChevronRight className="w-4 h-4 text-gray-300" />
                <span className={`px-2.5 py-1 rounded-full ${smartUpload.step === 'preview' ? 'bg-indigo-600 text-white' :
                    smartUpload.step === 'previewing' ? 'bg-indigo-200 text-indigo-700 animate-pulse' : 'bg-gray-100 text-gray-500'
                  }`}>2 Preview</span>
                <ChevronRight className="w-4 h-4 text-gray-300" />
                <span className={`px-2.5 py-1 rounded-full ${smartUpload.step === 'done' ? 'bg-green-600 text-white' :
                    smartUpload.step === 'confirming' ? 'bg-green-200 text-green-700 animate-pulse' : 'bg-gray-100 text-gray-500'
                  }`}>3 Confirm</span>
              </div>
            </div>

            {/* Body */}
            <div className="p-6 max-h-[70vh] overflow-y-auto">

              {/* Error banner */}
              {smartUpload.error && (
                <div className="mb-5 p-4 bg-red-50 border border-red-200 text-red-700 text-sm font-medium rounded-xl flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                  <p>{smartUpload.error}</p>
                </div>
              )}

              {/* STEP: select */}
              {(smartUpload.step === 'select' || smartUpload.step === 'previewing') && smartUpload.session && (
                <div className="space-y-5">
                  <div className="bg-gray-50 rounded-xl p-4 border border-gray-100 space-y-3">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500 font-medium">Target Session</span>
                      <span className="font-bold text-gray-900">{smartUpload.session.type} - Sem {smartUpload.session.semester}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500 font-medium">Existing Subjects</span>
                      <span className="font-bold text-gray-900">{smartUpload.session.subjectCount || 0}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500 font-medium">Academic Year</span>
                      <span className="font-bold text-gray-900">{smartUpload.session.academicYear}</span>
                    </div>
                  </div>

                  {smartUpload.session.subjectCount > 0 && (
                    <div className="p-4 bg-amber-50 text-amber-800 text-sm font-semibold rounded-xl border border-amber-100 flex items-start gap-3">
                      <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5 text-amber-600" />
                      <p className="leading-relaxed">
                        This session already has <span className="font-black">{smartUpload.session.subjectCount}</span> uploaded subjects.
                        Uploading another file may create duplicates.
                      </p>
                    </div>
                  )}

                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">Excel File (.xlsx)</label>
                    <div className="border-2 border-dashed border-indigo-200 rounded-xl p-4 bg-indigo-50/30 hover:bg-indigo-50/60 transition-colors">
                      <input
                        type="file"
                        accept=".xlsx,.xls"
                        id="smart-upload-file"
                        className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-indigo-600 file:text-white hover:file:bg-indigo-700 transition-colors"
                        disabled={smartUpload.step === 'previewing' || smartUpload.session.subjectCount > 0}
                        onChange={e => setSmartUpload(prev => ({ ...prev, file: e.target.files[0] ?? null }))}
                      />
                      {smartUpload.file && (
                        <p className="mt-2 text-xs text-indigo-700 font-semibold flex items-center gap-1.5">
                          <FileSpreadsheet className="w-4 h-4" />
                          {smartUpload.file.name}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="bg-blue-50/60 border border-blue-100 rounded-xl p-4">
                    <h5 className="text-xs font-bold text-blue-900 mb-2 flex items-center gap-1.5">
                      <FileSpreadsheet className="w-3.5 h-3.5" /> Supported Format
                    </h5>
                    <p className="text-xs text-blue-800 leading-relaxed">
                      Real institutional DSCE sheets. Parser auto-detects header row and tolerates
                      merged title rows, logo rows, and empty rows. Required columns:
                      <span className="font-bold"> Course Code, Course Title, Max no. of students</span>.
                      Optional: Department Name, "Should not be offered to", Credits.
                    </p>
                  </div>
                </div>
              )}

              {/* STEP: preview */}
              {smartUpload.step === 'preview' && smartUpload.preview && (
                <div className="space-y-5">
                  {/* Summary cards */}
                  <div className="grid grid-cols-3 gap-3">
                    <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 text-center">
                      <p className="text-2xl font-black text-gray-900">{smartUpload.preview.totalRows}</p>
                      <p className="text-xs font-bold text-gray-500 mt-1">Total Rows</p>
                    </div>
                    <div className="bg-green-50 border border-green-200 rounded-xl p-4 text-center">
                      <p className="text-2xl font-black text-green-700">{smartUpload.preview.validRows}</p>
                      <p className="text-xs font-bold text-green-600 mt-1">Valid</p>
                    </div>
                    <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-center">
                      <p className="text-2xl font-black text-red-700">{smartUpload.preview.invalidRows}</p>
                      <p className="text-xs font-bold text-red-600 mt-1">Invalid / Skipped</p>
                    </div>
                  </div>

                  {/* Valid subjects preview */}
                  {smartUpload.preview.validSubjects?.length > 0 && (
                    <div>
                      <h4 className="text-sm font-bold text-gray-700 mb-2 flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-green-600" />
                        Ready to Import ({smartUpload.preview.validRows})
                      </h4>
                      <div className="max-h-44 overflow-y-auto border border-gray-200 rounded-xl">
                        <table className="w-full text-xs">
                          <thead className="bg-gray-50 sticky top-0">
                            <tr>
                              <th className="p-2.5 text-left font-bold text-gray-500">Code</th>
                              <th className="p-2.5 text-left font-bold text-gray-500">Title</th>
                              <th className="p-2.5 text-left font-bold text-gray-500">Dept</th>
                              <th className="p-2.5 text-right font-bold text-gray-500">Seats</th>
                              <th className="p-2.5 text-left font-bold text-gray-500">Excluded</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-100">
                            {smartUpload.preview.validSubjects.map((s, i) => (
                              <tr key={i} className="hover:bg-green-50/30">
                                <td className="p-2.5 font-bold text-indigo-700">{s.courseCode}</td>
                                <td className="p-2.5 text-gray-800">{s.title}</td>
                                <td className="p-2.5 text-gray-600">{s.department || '—'}</td>
                                <td className="p-2.5 text-right font-semibold text-gray-700">{s.maxSeats}</td>
                                <td className="p-2.5 text-gray-500">{s.restrictedDepts || '—'}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}

                  {/* Invalid / skipped rows */}
                  {smartUpload.preview.invalidSubjects?.length > 0 && (
                    <div>
                      <button
                        type="button"
                        onClick={() => setSmartUpload(prev => ({ ...prev, showErrors: !prev.showErrors }))}
                        className="w-full flex items-center justify-between text-sm font-bold text-red-700 bg-red-50 border border-red-200 rounded-xl px-4 py-2.5 hover:bg-red-100 transition-colors"
                      >
                        <span className="flex items-center gap-2">
                          <AlertTriangle className="w-4 h-4" />
                          {smartUpload.preview.invalidRows} Row(s) Skipped — View Details
                        </span>
                        <ChevronRight className={`w-4 h-4 transition-transform ${smartUpload.showErrors ? 'rotate-90' : ''}`} />
                      </button>
                      {smartUpload.showErrors && (
                        <div className="mt-2 max-h-40 overflow-y-auto border border-red-200 rounded-xl">
                          <table className="w-full text-xs">
                            <thead className="bg-red-50 sticky top-0">
                              <tr>
                                <th className="p-2.5 text-left font-bold text-red-600">Row</th>
                                <th className="p-2.5 text-left font-bold text-red-600">Code</th>
                                <th className="p-2.5 text-left font-bold text-red-600">Title</th>
                                <th className="p-2.5 text-left font-bold text-red-600">Reason</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-red-100">
                              {smartUpload.preview.invalidSubjects.map((e, i) => (
                                <tr key={i} className="bg-red-50/30">
                                  <td className="p-2.5 font-bold text-red-600">#{e.rowNumber}</td>
                                  <td className="p-2.5 text-gray-700">{e.courseCode || '—'}</td>
                                  <td className="p-2.5 text-gray-700">{e.title || '—'}</td>
                                  <td className="p-2.5 text-red-700 font-semibold">{e.reason}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      )}
                    </div>
                  )}

                  {smartUpload.preview.validRows === 0 && (
                    <div className="p-4 bg-amber-50 border border-amber-200 text-amber-800 text-sm font-semibold rounded-xl flex items-center gap-3">
                      <AlertCircle className="w-5 h-5 flex-shrink-0" />
                      No valid subjects found — nothing will be imported.
                    </div>
                  )}
                </div>
              )}

              {/* STEP: done */}
              {smartUpload.step === 'done' && smartUpload.result && (
                <div className="text-center py-6">
                  <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
                    <CheckCircle2 className="w-9 h-9 text-green-600" />
                  </div>
                  <h4 className="text-xl font-black text-gray-900 mb-1">Upload Complete</h4>
                  <p className="text-gray-600 font-medium mb-6">
                    <span className="font-black text-green-700">{smartUpload.result.createdCount}</span> subject(s) saved successfully.
                    {smartUpload.result.skippedCount > 0 && (
                      <span> <span className="font-black text-amber-600">{smartUpload.result.skippedCount}</span> duplicate(s) skipped.</span>
                    )}
                  </p>
                </div>
              )}

            </div>{/* /body */}

            {/* Footer actions */}
            <div className="px-6 pb-6 pt-2 flex gap-3">
              {smartUpload.step === 'select' && (
                <>
                  <button
                    type="button"
                    onClick={closeSmartUpload}
                    className="flex-1 px-4 py-2.5 border border-gray-200 text-gray-700 rounded-xl font-bold hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleSmartPreview}
                    disabled={!smartUpload.file || !smartUpload.session || smartUpload.session.subjectCount > 0}
                    className="flex-1 px-4 py-2.5 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition-colors disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    <Eye className="w-4 h-4" /> Preview
                  </button>
                </>
              )}

              {smartUpload.step === 'previewing' && (
                <div className="flex-1 text-center py-2 text-sm font-semibold text-indigo-600 flex items-center justify-center gap-2">
                  <span className="w-4 h-4 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />
                  Parsing Excel file…
                </div>
              )}

              {smartUpload.step === 'preview' && (
                <>
                  <button
                    type="button"
                    onClick={() => setSmartUpload(prev => ({ ...prev, step: 'select', preview: null, error: null, showErrors: false }))}
                    className="flex-1 px-4 py-2.5 border border-gray-200 text-gray-700 rounded-xl font-bold hover:bg-gray-50 transition-colors"
                  >
                    ← Back
                  </button>
                  <button
                    type="button"
                    onClick={handleSmartConfirm}
                    disabled={!smartUpload.preview?.validRows}
                    className="flex-1 px-4 py-2.5 bg-green-600 text-white rounded-xl font-bold hover:bg-green-700 transition-colors disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    Confirm &amp; Save {smartUpload.preview?.validRows > 0 ? `(${smartUpload.preview.validRows})` : ''}
                  </button>
                </>
              )}

              {smartUpload.step === 'confirming' && (
                <div className="flex-1 text-center py-2 text-sm font-semibold text-green-600 flex items-center justify-center gap-2">
                  <span className="w-4 h-4 border-2 border-green-600 border-t-transparent rounded-full animate-spin" />
                  Saving subjects…
                </div>
              )}

              {smartUpload.step === 'done' && (
                <button
                  type="button"
                  onClick={closeSmartUpload}
                  className="flex-1 px-4 py-2.5 bg-primary text-white rounded-xl font-bold hover:bg-primary/90 transition-colors"
                >
                  Done
                </button>
              )}
            </div>

          </div>
        </div>
      )}
    </div>
  );
};

export default SuperAdminSettings;
