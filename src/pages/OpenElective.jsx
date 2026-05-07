import { useState, useEffect, useMemo, useCallback } from 'react';
import Sidebar from '../components/Sidebar';
import Navbar from '../components/Navbar';
import SubjectCard from '../components/SubjectCard';
import Modal from '../components/Modal';
import Loader from '../components/Loader';
import Toast from '../components/Toast';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Search, Filter, AlertTriangle, RefreshCw } from 'lucide-react';

const OpenElective = () => {
  const { user } = useAuth();
  const [selectedSubjectId, setSelectedSubjectId] = useState(null);
  const [sessionState, setSessionState] = useState('ACTIVE');
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('All');
  
  const [modalOpen, setModalOpen] = useState(false);
  const [subjectToSelect, setSubjectToSelect] = useState(null);
  
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const fetchSubjects = useCallback(async (showLoading = false) => {
    try {
      if (showLoading) setLoading(true);
      setError(null);
      const data = await api.getOpenElectives();
      setSubjects(data);
    } catch (err) {
      setError("Failed to fetch subjects. Please try again.");
    } finally {
      if (showLoading) setLoading(false);
    }
  }, []);

  useEffect(() => {
    const initData = async () => {
      try {
        setLoading(true);
        const profile = await api.getProfile();
        
        const activeSession = profile?.activeSession;
        if (!activeSession) {
          setSessionState('NO_SESSION');
        } else if (profile?.isEligible === false) {
          setSessionState('NOT_ELIGIBLE');
        } else {
          const now = new Date();
          const start = new Date(activeSession.start_time);
          const end = new Date(activeSession.end_time);
          
          if (now < start) {
            setSessionState('NOT_STARTED');
          } else if (now > end) {
            setSessionState('CLOSED');
          } else {
            setSessionState('ACTIVE');
          }
        }
        
        // Fetch user's current selection
        try {
          const res = await api.getMySelection();
          if (res) {
            setSelectedSubjectId(res); // assuming backend returns just the ID, or handle accordingly if object
          } else {
            setSelectedSubjectId(null);
          }
        } catch (err) {
          setSelectedSubjectId(null);
        }
        
        await fetchSubjects(false);
      } catch (err) {
        setError("Failed to fetch data from the server.");
      } finally {
        setLoading(false);
      }
    };
    initData();
  }, [fetchSubjects]);

  // Task 3: Stop polling after selection or during submission to prevent race conditions
  useEffect(() => {
    if (selectedSubjectId || isSubmitting) return; // Stop polling if already selected or currently submitting
    
    const intervalId = setInterval(() => {
      fetchSubjects(false); // Background fetch, no loading state
    }, 10000);
    return () => clearInterval(intervalId);
  }, [selectedSubjectId, isSubmitting, fetchSubjects]);

  const showToast = (message, type = 'success') => {
    setToast({ show: true, message, type });
  };

  const handleSelectClick = (subject) => {
    setSubjectToSelect(subject);
    setModalOpen(true);
  };

  // Task 5: Clean modal close logic
  const handleModalClose = () => {
    if (!isSubmitting) {
      setModalOpen(false);
    }
  };

  const handleConfirmSelection = async () => {
    // Task 3: Prevent double clicks
    if (isSubmitting) return;
    
    setIsSubmitting(true);
    
    try {
      await api.selectOpenElective(subjectToSelect.id);
      
      // Task 1: Fetch profile after selection to set UI state ONLY from backend
      try {
        const res = await api.getMySelection();
        if (res) setSelectedSubjectId(res);
        else setSelectedSubjectId(subjectToSelect.id); // fallback if api format differs
      } catch (err) {
        setSelectedSubjectId(subjectToSelect.id);
      }
      
      showToast(`Elective locked successfully. No further changes allowed.`);
      setModalOpen(false);
    } catch (error) {
      // Task 4: Improve error handling
      const errorCode = error.response?.data?.code;
      if (errorCode === 'ALREADY_SELECTED') {
        showToast("You have already selected an elective.", "success");
      } else if (errorCode === 'NO_SEATS_AVAILABLE') {
        showToast("Sorry, seats just filled!", "error");
      } else if (errorCode === 'DEPARTMENT_RESTRICTED') {
        showToast("Your department is restricted.", "error");
      } else if (errorCode === 'SESSION_INVALID') {
        showToast("Session is closed or invalid.", "error");
        setSessionState('CLOSED');
      } else if (errorCode === 'NOT_ELIGIBLE') {
        showToast("You are not eligible for this session.", "error");
      } else if (errorCode === 'VALIDATION_FAILED') {
        showToast(error.response?.data?.message || "Validation failed.", "error");
      } else {
        showToast(error.response?.data?.message || error?.message || "Failed to complete selection", "error");
      }
      setModalOpen(false);
    } finally {
      setIsSubmitting(false);
      // Task 4: After ANY error or success: call fetchSubjects()
      fetchSubjects(false);
    }
  };

  const filteredSubjects = useMemo(() => {
    return subjects.filter(s => {
      const matchesSearch = s.title?.toLowerCase().includes(searchQuery.toLowerCase()) || 
                            s.courseCode?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            s.code?.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesDept = departmentFilter === 'All' || s.department === departmentFilter;
      return matchesSearch && matchesDept;
    });
  }, [subjects, searchQuery, departmentFilter]);

  const departments = useMemo(() => {
    return ['All', ...new Set(subjects.map(s => s.department).filter(Boolean))];
  }, [subjects]);

  return (
    <div className="min-h-screen flex bg-background">
      <Sidebar user={user} />
      <div className="flex-1 md:ml-64 p-4 md:p-8 w-full max-w-7xl mx-auto">
        <Navbar user={user} />
        
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Open Elective Selection</h1>
          <p className="text-secondary mt-2">Choose one elective from the available subjects below</p>
        </div>

        {sessionState === 'NO_SESSION' ? (
          <div className="bg-white p-12 rounded-[32px] shadow-sm border border-gray-100 text-center mb-8">
            <div className="text-gray-300 mb-4 text-6xl">🕒</div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">No Active Session</h3>
            <p className="text-secondary">There is no active open elective session at the moment.</p>
          </div>
        ) : sessionState === 'NOT_STARTED' ? (
          <div className="bg-white p-12 rounded-[32px] shadow-sm border border-gray-100 text-center mb-8">
            <div className="text-gray-300 mb-4 text-6xl">⏳</div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Session Not Started</h3>
            <p className="text-secondary">The elective selection window has not opened yet.</p>
          </div>
        ) : sessionState === 'NOT_ELIGIBLE' ? (
          <div className="bg-white p-12 rounded-[32px] shadow-sm border border-gray-100 text-center mb-8">
            <div className="text-red-300 mb-4 text-6xl">🚫</div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Not Eligible</h3>
            <p className="text-secondary">You are not eligible to participate in the current session.</p>
          </div>
        ) : sessionState === 'CLOSED' ? (
          <div className="bg-white p-12 rounded-[32px] shadow-sm border border-gray-100 text-center mb-8">
            <div className="text-gray-300 mb-4 text-6xl">🔒</div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Session Closed</h3>
            <p className="text-secondary">The window for elective selection has closed.</p>
          </div>
        ) : (
          <>
            <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 mb-8 flex flex-col md:flex-row gap-4 items-center justify-between pointer-events-auto">
              <div className="relative w-full md:w-96 rounded-xl overflow-hidden shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  placeholder="Search by subject name or code"
                  className="block w-full pl-10 pr-3 py-3 border border-gray-200 rounded-xl leading-5 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all sm:text-sm"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  disabled={loading || isSubmitting}
                />
              </div>

              <div className="flex items-center w-full md:w-auto space-x-4">
                <div className="relative w-full md:w-auto">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Filter className="h-4 w-4 text-gray-400" />
                  </div>
                  <select
                    className="block w-full pl-10 pr-10 py-3 border border-gray-200 rounded-xl leading-5 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary sm:text-sm appearance-none font-semibold text-gray-700"
                    value={departmentFilter}
                    onChange={(e) => setDepartmentFilter(e.target.value)}
                    disabled={loading || isSubmitting}
                  >
                    {departments.map(d => (
                      <option key={d} value={d}>{d === 'All' ? 'All Departments' : d}</option>
                    ))}
                  </select>
                </div>
                <div className="hidden md:block text-xs font-bold text-secondary uppercase tracking-wider whitespace-nowrap bg-gray-100 px-3 py-2 rounded-lg">
                  Showing {filteredSubjects.length} subjects
                </div>
              </div>
            </div>

            {loading ? (
              <div className="py-20 flex flex-col items-center">
                 <Loader />
                 <p className="mt-4 text-secondary font-medium animate-pulse">Loading available subjects...</p>
              </div>
            ) : error ? (
              <div className="bg-red-50 p-12 rounded-2xl shadow-sm border border-red-100 text-center flex flex-col items-center">
                <AlertTriangle className="h-12 w-12 text-red-400 mb-4" />
                <h3 className="text-xl font-bold text-red-900 mb-2">Connection Error</h3>
                <p className="text-red-700 mb-6">{error}</p>
                <button 
                  onClick={() => fetchSubjects(true)}
                  className="flex items-center bg-white text-red-600 font-bold px-6 py-2 rounded-xl border border-red-200 hover:bg-red-50 transition-colors"
                >
                  <RefreshCw className="w-4 h-4 mr-2" /> Retry
                </button>
              </div>
            ) : filteredSubjects.length === 0 ? (
              <div className="bg-white p-12 rounded-2xl shadow-sm border border-gray-100 text-center">
                <div className="text-gray-300 mb-4 text-6xl">📚</div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">No subjects found</h3>
                <p className="text-secondary">Try adjusting your search or filters.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredSubjects.map((subject) => (
                  <SubjectCard 
                    key={subject.id} 
                    subject={subject} 
                    onSelect={handleSelectClick}
                    selectedSubjectId={selectedSubjectId}
                    isDisabled={isSubmitting}
                  />
                ))}
              </div>
            )}
          </>
        )}

        <Modal 
          isOpen={modalOpen} 
          onClose={handleModalClose}
          onConfirm={handleConfirmSelection}
          title="Confirm Selection"
          confirmDisabled={isSubmitting}
        >
          {subjectToSelect && (
            <div className="space-y-4">
              <div className="p-4 bg-gray-50 rounded-xl border border-gray-200">
                <span className="text-primary font-bold tracking-widest text-xs uppercase block mb-1">{subjectToSelect.code}</span>
                <span className="font-bold text-gray-900 text-lg">{subjectToSelect.title}</span>
              </div>
              <div className="bg-orange-50 border border-orange-200 p-4 rounded-xl flex items-start">
                <span className="text-warning mr-3 mt-0.5 text-lg">⚠️</span>
                <p className="text-sm text-balance text-orange-900 font-medium">
                  This action cannot be undone. Once confirmed, you will be automatically registered for the course and all other selections will be locked.
                </p>
              </div>
            </div>
          )}
        </Modal>

        {isSubmitting && <Loader fullScreen />}
        {toast.show && <Toast message={toast.message} type={toast.type} onClose={() => setToast({ show: false, message: '' })} />}
      </div>
    </div>
  );
};

export default OpenElective;
