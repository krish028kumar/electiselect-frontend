import { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import Navbar from '../components/Navbar';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { Database, Plus, CheckCircle2, XCircle, Clock, Calendar, AlertCircle, X, Upload, FileSpreadsheet } from 'lucide-react';

const SystemAdmin = () => {
  const { user } = useAuth();
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Modal State
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

  // Action Modal State
  const [actionModal, setActionModal] = useState({ type: null, session: null });
  const [actionError, setActionError] = useState(null);
  const [isActionSubmitting, setIsActionSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState(null);

  // Upload Modal State
  const [uploadModal, setUploadModal] = useState({ show: false, session: null });
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploadError, setUploadError] = useState(null);
  const [isUploading, setIsUploading] = useState(false);

  const fetchSessions = async () => {
    setLoading(true);
    try {
      const data = await api.getAllSessions();
      setSessions(data || []);
      setError(null);
    } catch (err) {
      console.error("Failed to load sessions:", err);
      setError("Failed to load sessions from the server.");
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
        showSuccess("Session activated successfully");
      } else {
        await api.deactivateSession(actionModal.session.id);
        showSuccess("Session deactivated successfully");
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
    
    // Minimal Frontend UX Validation
    if (!newSession.type || !newSession.semester || !newSession.academicYear || !newSession.startTime || !newSession.endTime) {
      setFormError("All fields are required.");
      return;
    }
    if (new Date(newSession.startTime) > new Date(newSession.endTime)) {
      setFormError("Start time cannot be after end time.");
      return;
    }

    setIsSubmitting(true);
    try {
      await api.createSession({
        ...newSession,
        semester: parseInt(newSession.semester, 10),
        isActive: false // Always start false
      });
      setShowModal(false);
      setNewSession({ type: 'OPEN', semester: '', academicYear: '', startTime: '', endTime: '' });
      fetchSessions();
    } catch (err) {
      setFormError(err.response?.data?.message || err.response?.data?.error || "Failed to create session.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFileUpload = async (e) => {
    e.preventDefault();
    if (!selectedFile) {
      setUploadError("Please select an Excel file to upload.");
      return;
    }
    
    setIsUploading(true);
    setUploadError(null);
    try {
      await api.uploadSubjects(uploadModal.session.id, selectedFile);
      showSuccess("Subjects uploaded successfully");
      setUploadModal({ show: false, session: null });
      setSelectedFile(null);
      fetchSessions();
    } catch (err) {
      const serverError = err.response?.data?.error || err.response?.data;
      setUploadError(typeof serverError === 'string' ? serverError : err.message || "Failed to upload subjects.");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-gray-50/50">
      <Sidebar user={user} role="SUPER_ADMIN" />
      <div className="flex-1 md:ml-64 p-4 md:p-8 w-full max-w-7xl mx-auto">
        <Navbar user={user} />
        
        <div className="mb-8 flex justify-between items-end">
          <div>
            <h1 className="text-3xl font-black text-gray-900 tracking-tight">System Configuration</h1>
            <p className="text-secondary mt-2 font-medium">Manage elective registration sessions and global availability.</p>
          </div>
          <button 
            onClick={() => setShowModal(true)}
            className="flex items-center gap-2 bg-primary text-white px-5 py-2.5 rounded-xl font-semibold hover:bg-primary/90 transition-colors shadow-sm"
          >
            <Plus className="w-5 h-5" />
            Create Session
          </button>
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
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold ${
                          session.type === 'OPEN' ? 'bg-blue-50 text-blue-700' : 'bg-purple-50 text-purple-700'
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
                          <span className="flex items-center gap-1.5"><Clock className="w-3.5 h-3.5 text-green-500"/> {new Date(session.startTime).toLocaleString()}</span>
                          <span className="flex items-center gap-1.5"><Clock className="w-3.5 h-3.5 text-red-500"/> {new Date(session.endTime).toLocaleString()}</span>
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
                        {session.isActive ? (
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
                          {!session.isActive && (
                            <button 
                              onClick={() => {
                                setUploadModal({ show: true, session });
                                setSelectedFile(null);
                                setUploadError(null);
                              }}
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white border border-blue-200 text-blue-600 hover:bg-blue-50 hover:border-blue-300 rounded-lg text-xs font-bold transition-colors shadow-sm"
                            >
                              <Upload className="w-4 h-4" /> {session.subjectCount > 0 ? 'Re-upload' : 'Upload'}
                            </button>
                          )}
                          
                          {session.isActive ? (
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
                      onChange={(e) => setNewSession({...newSession, type: e.target.value})}
                    >
                      <option value="OPEN">Open Elective</option>
                      <option value="DEPARTMENT">Department Elective</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1.5">Semester</label>
                    <input 
                      type="number" 
                      min="1" max="8"
                      placeholder="e.g. 5"
                      className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all text-sm"
                      value={newSession.semester}
                      onChange={(e) => setNewSession({...newSession, semester: e.target.value})}
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
                    onChange={(e) => setNewSession({...newSession, academicYear: e.target.value})}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1.5">Start Time</label>
                    <input 
                      type="datetime-local" 
                      className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all text-sm"
                      value={newSession.startTime}
                      onChange={(e) => setNewSession({...newSession, startTime: e.target.value})}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1.5">End Time</label>
                    <input 
                      type="datetime-local" 
                      className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all text-sm"
                      value={newSession.endTime}
                      onChange={(e) => setNewSession({...newSession, endTime: e.target.value})}
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

      {/* Upload Modal */}
      {uploadModal.show && uploadModal.session && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
              <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                <Upload className="w-5 h-5 text-primary" /> Upload Subjects
              </h3>
              <button onClick={() => setUploadModal({ show: false, session: null })} className="text-gray-400 hover:text-gray-600 transition-colors">
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <form onSubmit={handleFileUpload} className="p-6">
              {uploadModal.session.subjectCount > 0 && (
                <div className="mb-6 p-4 bg-amber-50 text-amber-800 text-sm font-semibold rounded-xl border border-amber-100 flex items-start gap-3">
                   <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5 text-amber-600" />
                   <p className="leading-relaxed">
                     This session already has <span className="font-black">{uploadModal.session.subjectCount}</span> uploaded subjects.
                     Uploading another file may create duplicates.
                   </p>
                </div>
              )}
              {uploadError && (
                <div className="mb-6 p-4 bg-red-50 text-red-700 text-sm font-medium rounded-xl border border-red-100 flex items-start gap-3">
                   <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                   <p className="leading-relaxed">{uploadError}</p>
                </div>
              )}

              <div className="bg-gray-50 rounded-xl p-4 border border-gray-100 space-y-3 mb-6">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500 font-medium">Target Session</span>
                  <span className="font-bold text-gray-900">{uploadModal.session.type} - Sem {uploadModal.session.semester}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500 font-medium">Existing Subjects</span>
                  <span className="font-bold text-gray-900">{uploadModal.session.subjectCount}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500 font-medium">Academic Year</span>
                  <span className="font-bold text-gray-900">{uploadModal.session.academicYear}</span>
                </div>
              </div>

              <div className="mb-6 p-4 bg-blue-50/50 border border-blue-100 rounded-xl">
                <h4 className="text-sm font-bold text-blue-900 mb-2 flex items-center gap-1.5">
                   <FileSpreadsheet className="w-4 h-4 text-blue-600" />
                   Expected Excel Format
                </h4>
                <ul className="text-xs font-medium text-blue-800 space-y-1.5 mb-3 list-disc list-inside ml-1">
                  <li>Col 0 → Course Code (String)</li>
                  <li>Col 1 → Title (String)</li>
                  <li>Col 2 → Department (String)</li>
                  <li>Col 3 → Max Seats (Number)</li>
                  <li>Col 4 → Restricted Departments (Comma-separated, optional)</li>
                  <li>Col 5 → Credits (Number, mandatory)</li>
                  <li>Col 6 → Category Name (String, see rule below)</li>
                </ul>
                <div className="text-xs bg-white/60 p-2.5 rounded-lg border border-blue-200/60 font-semibold text-blue-900">
                  <p>• <span className="font-bold">OPEN sessions:</span> Category Name is optional/ignored.</p>
                  <p>• <span className="font-bold">DEPARTMENT sessions:</span> Category Name is strictly required.</p>
                </div>
              </div>

              <div className="mb-8">
                <label className="block text-sm font-bold text-gray-700 mb-2">Select Excel File (.xlsx)</label>
                <input 
                  type="file" 
                  accept=".xlsx, .xls"
                  className="w-full text-sm text-gray-500 file:mr-4 file:py-2.5 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-semibold file:bg-primary/10 file:text-primary hover:file:bg-primary/20 transition-colors border border-gray-200 rounded-xl p-2"
                  onChange={(e) => setSelectedFile(e.target.files[0])}
                />
              </div>

              <div className="flex gap-3">
                <button 
                  type="button"
                  onClick={() => setUploadModal({ show: false, session: null })}
                  className="flex-1 px-4 py-2.5 border border-gray-200 text-gray-700 rounded-xl font-bold hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  disabled={isUploading || !selectedFile}
                  className="flex-1 px-4 py-2.5 bg-primary text-white rounded-xl font-bold hover:bg-primary/90 transition-colors disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {isUploading ? 'Uploading...' : 'Upload Data'}
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
            <div className={`p-6 border-b border-gray-100 flex justify-between items-center ${
              actionModal.type === 'ACTIVATE' ? 'bg-green-50/50' : 'bg-red-50/50'
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
                  ? "Students matching this session will gain access to elective registration. Please ensure subjects have been uploaded before activating." 
                  : "Eligible students may lose access to elective registration."}
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
                  className={`flex-1 px-4 py-2.5 text-white rounded-xl font-bold transition-colors disabled:opacity-70 disabled:cursor-not-allowed ${
                    actionModal.type === 'ACTIVATE' 
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
    </div>
  );
};

export default SystemAdmin;
