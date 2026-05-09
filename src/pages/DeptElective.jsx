import { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import Navbar from '../components/Navbar';
import CategorySection from '../components/CategorySection';
import Loader from '../components/Loader';
import Toast from '../components/Toast';
import Modal from '../components/Modal';
import ScheduleModal from '../components/ScheduleModal';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Calendar, Clock, Lock, CheckCircle, Info, ChevronRight, AlertTriangle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const DeptElective = () => {
  const { user } = useAuth();
  
  const [categories, setCategories] = useState([]);
      const [lockedSelections, setLockedSelections] = useState(null);
      const [selections, setSelections] = useState({});
      const [sessionState, setSessionState] = useState('ACTIVE');
  const [fetchError, setFetchError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);
  const [deptStatus, setDeptStatus] = useState(null);
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });

  const fetchInitialData = async () => {
    try {
      setLoading(true);
          const [status, electivesData, mySelection] = await Promise.all([
            api.getDeptStatus(),
            api.getDeptElectives(),
            api.getDeptMySelection()
          ]);
          setDeptStatus(status || null);
      
      setCategories(electivesData || []);
      
      setFetchError(null);
          if (!status?.visible) {
            if (status && status.eligible === false) {
              setSessionState('NOT_ELIGIBLE');
            } else if (!status?.sessionId) {
              setSessionState('NO_SESSION');
            } else {
              setSessionState('CLOSED');
            }
          } else {
            setSessionState('ACTIVE');
          }
      
      if (mySelection?.submitted && Array.isArray(mySelection.selections) && mySelection.selections.length > 0) {
        setLockedSelections(mySelection.selections);
      } else {
        setLockedSelections(null);
      }
    } catch (error) {
      const errorMsg = error?.response?.data?.message || error?.message || "Failed to fetch department electives.";
      setFetchError(errorMsg);
      showToast(errorMsg, "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInitialData();
  }, []);

  const showToast = (message, type = 'success') => {
    setToast({ show: true, message, type });
  };

  const handleSelect = (categoryId, subject) => {
    if (lockedSelections) return;
    setSelections(prev => ({ ...prev, [categoryId]: subject }));
  };

  const isFormComplete = categories.length > 0 && Object.keys(selections).length === categories.filter(cat => Array.isArray(cat?.subjects) && cat.subjects.length > 0).length;

  const handleConfirmSubmit = async () => {
    setIsModalOpen(false);
    setIsSubmitting(true);
    
    try {
      const payload = Object.entries(selections).map(([categoryId, subject]) => ({
        categoryId: parseInt(categoryId),
        subjectId: subject.id
      }));

      await api.submitDeptElectives(payload);
      
      showToast("Selections submitted successfully 🎉");
      await fetchInitialData(); // Re-fetch to lock UI
    } catch (error) {
      const errorCode = error.response?.data?.code;
      if (errorCode === 'ALREADY_SELECTED') {
        showToast("Selections already submitted.", "success");
        await fetchInitialData();
      } else if (errorCode === 'SESSION_INVALID') {
        showToast("Session is closed or invalid.", "error");
        setSessionState('CLOSED');
        setSelections({}); // Clear selection state
      } else if (errorCode === 'NOT_ELIGIBLE') {
        showToast("You are not eligible for this session.", "error");
      } else if (errorCode === 'NO_SEATS_AVAILABLE') {
        showToast("Sorry, some seats just filled up!", "error");
      } else if (errorCode === 'DEPARTMENT_RESTRICTED') {
        showToast("Your department is restricted for some subjects.", "error");
      } else if (errorCode === 'VALIDATION_FAILED') {
        showToast(error.response?.data?.message || "Validation failed.", "error");
      } else {
        showToast(error?.response?.data?.message || error?.message || "Submission failed due to a server error.", "error");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatDate = (value) => value ? new Date(value).toLocaleString() : '—';

  const statusLabel = () => {
    if (!deptStatus?.sessionId) return 'INACTIVE';
    if (deptStatus?.visible) return 'ACTIVE';
    if (deptStatus?.sessionActive) {
      const now = new Date();
      const start = deptStatus?.startTime ? new Date(deptStatus.startTime) : null;
      const end = deptStatus?.endTime ? new Date(deptStatus.endTime) : null;
      if (start && now < start) return 'UPCOMING';
      if (end && now > end) return 'CLOSED';
    }
    return 'INACTIVE';
  };

  return (
    <div className="min-h-screen flex bg-slate-50">
      <Sidebar user={user} />
      <div className="flex-1 md:ml-64 p-4 md:p-8 w-full max-w-7xl mx-auto">
        <Navbar user={user} />
        
        <div className="mb-10">
          <h1 className="text-4xl font-black text-gray-900 tracking-tight">Department Elective Selection</h1>
          <p className="text-secondary mt-2 font-medium">Customize your academic path by selecting core electives.</p>
        </div>

        <AnimatePresence>
          {lockedSelections && (
            <motion.div 
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-green-600 text-white rounded-[24px] p-6 mb-10 shadow-lg shadow-green-600/20 flex items-center justify-between border border-green-500"
            >
              <div className="flex items-center">
                <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center mr-4">
                  <CheckCircle className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-bold text-lg">Your electives have been locked successfully</h3>
                  <p className="text-green-100 text-sm opacity-90">Selections are now finalized and cannot be modified.</p>
                </div>
              </div>
              <div className="hidden sm:block px-4 py-2 bg-white/10 rounded-xl border border-white/20 text-xs font-black uppercase tracking-widest">
                LOCKED
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {loading ? (
          <div className="py-20 flex flex-col items-center">
            <Loader />
            <p className="mt-4 text-secondary font-black uppercase tracking-widest text-xs animate-pulse">Initializing Electives...</p>
          </div>
        ) : (
          <div className="flex flex-col lg:flex-row gap-10">
            <div className="flex-1">
              {lockedSelections ? (
                <div className="bg-white p-8 rounded-[32px] shadow-sm border border-gray-100 flex flex-col items-center text-center justify-center min-h-[300px]">
                   <Lock className="w-16 h-16 text-gray-300 mb-4" />
                   <h2 className="text-2xl font-black text-gray-800">Selection Locked</h2>
                   <p className="text-gray-500 mt-2">Your department electives have been submitted. See summary panel for details.</p>
                </div>
              ) : fetchError ? (
                <div className="bg-white p-12 rounded-[32px] shadow-sm border border-red-100 text-center flex flex-col items-center">
                  <div className="text-red-300 mb-4 text-6xl">⚠️</div>
                  <h3 className="text-xl font-bold text-red-900 mb-2">Connection Error</h3>
                  <p className="text-red-700 mb-6">{fetchError}</p>
                  <button 
                    onClick={fetchInitialData}
                    className="inline-flex items-center bg-white text-red-600 font-bold px-6 py-2 rounded-xl border border-red-200 hover:bg-red-50 transition-colors"
                  >
                    Retry Connection
                  </button>
                </div>
              ) : sessionState === 'NO_SESSION' ? (
                <div className="bg-white p-12 rounded-[32px] shadow-sm border border-gray-100 text-center">
                  <div className="text-gray-300 mb-4 text-6xl">🕒</div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">No Active Session</h3>
                  <p className="text-secondary">There is no active department elective session at the moment.</p>
                </div>
              ) : sessionState === 'NOT_STARTED' ? (
                <div className="bg-white p-12 rounded-[32px] shadow-sm border border-gray-100 text-center">
                  <div className="text-gray-300 mb-4 text-6xl">⏳</div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">Session Not Started</h3>
                  <p className="text-secondary">The elective selection window has not opened yet.</p>
                </div>
              ) : sessionState === 'NOT_ELIGIBLE' ? (
                <div className="bg-white p-12 rounded-[32px] shadow-sm border border-gray-100 text-center">
                  <div className="text-red-300 mb-4 text-6xl">🚫</div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">Not Eligible</h3>
                  <p className="text-secondary">You are not eligible to participate in the current session.</p>
                </div>
              ) : sessionState === 'CLOSED' ? (
                <div className="bg-white p-12 rounded-[32px] shadow-sm border border-gray-100 text-center">
                  <div className="text-gray-300 mb-4 text-6xl">🔒</div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">Session Closed</h3>
                  <p className="text-secondary">The window for elective selection has closed.</p>
                </div>
              ) : Array.isArray(categories) && categories.filter(cat => cat?.categoryId && Array.isArray(cat?.subjects)).length > 0 ? (
                categories.filter(cat => cat?.categoryId && Array.isArray(cat?.subjects)).map((category, idx) => (
                  <CategorySection 
                    key={category.categoryId}
                    title={category.categoryName}
                    icon={idx % 2 === 0 ? "📘" : "💻"}
                    colorTheme={idx % 2 === 0 ? "blue" : "purple"}
                    subjects={category.subjects.map(s => ({ ...s, code: s.courseCode }))}
                    selectedId={selections[category.categoryId]?.id}
                    onSelect={(subject) => handleSelect(category.categoryId, subject)}
                    disabled={!!lockedSelections || isSubmitting}
                  />
                ))
              ) : sessionState === 'ACTIVE' ? (
                <div className="bg-white p-12 rounded-[32px] shadow-sm border border-gray-100 text-center">
                  <div className="text-gray-300 mb-4 text-6xl">📚</div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">No Categories Found</h3>
                  <p className="text-secondary">Categories have not been configured yet.</p>
                </div>
              ) : null}
            </div>

            <div className="lg:w-[360px] flex-shrink-0 relative">
              <div className="sticky top-8 space-y-8">
                {/* Selection Summary Panel */}
                <div className="bg-white rounded-[32px] shadow-[0_20px_50px_rgba(0,0,0,0.04)] border border-gray-100 p-8 overflow-hidden relative">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full -translate-y-16 translate-x-16"></div>
                  <h3 className="font-black text-xl mb-6 text-gray-900 flex items-center">
                    Selection Summary
                  </h3>
                  
                  <div className="space-y-6 mb-10 relative z-10">
                    {lockedSelections ? lockedSelections.map((sel, idx) => (
                      <div key={idx} className="group">
                        <p className="text-[10px] text-gray-400 font-extrabold uppercase tracking-[0.2em] mb-2">{sel.category?.categoryName || sel.category?.name || `Category ${sel.categoryId}`}</p>
                        <div className="p-4 bg-green-50/50 rounded-2xl border border-green-100">
                          <p className="text-xs font-black text-green-600 uppercase mb-1">{sel.subject?.courseCode || sel.subject?.code || ''}</p>
                          <p className="text-sm font-bold text-gray-800 leading-snug">{sel.subject?.title}</p>
                        </div>
                      </div>
                    )) : sessionState === 'ACTIVE' ? categories.map((cat) => (
                      <div key={cat.categoryId || cat.id} className="group">
                        <p className="text-[10px] text-gray-400 font-extrabold uppercase tracking-[0.2em] mb-2">{cat.categoryName || cat.name}</p>
                        {selections[cat.categoryId || cat.id] ? (
                          <div className="p-4 bg-blue-50/50 rounded-2xl border border-blue-100 transition-all hover:border-primary">
                            <p className="text-xs font-black text-primary uppercase mb-1">{selections[cat.categoryId || cat.id].courseCode || selections[cat.categoryId || cat.id].code}</p>
                            <p className="text-sm font-bold text-gray-800 leading-snug">{selections[cat.categoryId || cat.id].title}</p>
                          </div>
                        ) : (
                          <div className="p-4 bg-red-50/50 rounded-2xl border border-dashed border-red-200">
                             <p className="text-sm text-red-500 font-bold italic flex items-center">
                               Not selected
                             </p>
                          </div>
                        )}
                      </div>
                    )) : null}
                  </div>

                  {!lockedSelections && sessionState === 'ACTIVE' && (
                    <motion.button 
                      whileHover={isFormComplete ? { scale: 1.02 } : {}}
                      whileTap={isFormComplete ? { scale: 0.98 } : {}}
                      onClick={() => setIsModalOpen(true)}
                      disabled={!isFormComplete || isSubmitting}
                      className={`w-full py-4 rounded-2xl font-black text-sm uppercase tracking-widest transition-all shadow-xl ${
                        isFormComplete
                          ? 'bg-primary text-white shadow-primary/20 hover:bg-blue-700'
                          : 'bg-gray-100 text-gray-400 cursor-not-allowed shadow-none'
                      }`}
                    >
                      Submit Selections
                    </motion.button>
                  )}
                  
                  {lockedSelections && (
                    <div className="w-full py-4 bg-gray-50 rounded-2xl flex items-center justify-center text-gray-400 text-xs font-black uppercase tracking-widest border border-gray-100">
                      <Lock className="w-4 h-4 mr-2" /> All choices locked
                    </div>
                  )}
                </div>

                {/* Important Dates Calendar Section */}
                <div className="bg-gray-900 text-white rounded-[32px] shadow-2xl p-8 relative overflow-hidden group">
                  <div className="absolute top-0 right-0 w-48 h-48 bg-white/5 rounded-full -translate-y-24 translate-x-24 group-hover:scale-110 transition-transform duration-700"></div>
                  <h3 className="font-extrabold text-lg mb-6 flex items-center">
                    <Calendar className="w-5 h-5 mr-3 text-primary" /> Important Dates
                  </h3>

                  <div className="space-y-4 mb-6 relative z-10">
                    <div className="flex items-center justify-between border-b border-white/5 pb-3">
                      <span className="text-xs font-bold text-gray-400">Session Type</span>
                      <span className="text-xs font-black tracking-tight">{deptStatus?.sessionType || 'DEPARTMENT'}</span>
                    </div>
                    <div className="flex items-center justify-between border-b border-white/5 pb-3">
                      <span className="text-xs font-bold text-gray-400">Academic Year</span>
                      <span className="text-xs font-black tracking-tight">{deptStatus?.academicYear || '—'}</span>
                    </div>
                    <div className="flex items-center justify-between border-b border-white/5 pb-3">
                      <span className="text-xs font-bold text-gray-400">Selection Window Opens</span>
                      <span className="text-xs font-black tracking-tight">{formatDate(deptStatus?.startTime)}</span>
                    </div>
                    <div className="flex items-center justify-between border-b border-white/5 pb-3">
                      <span className="text-xs font-bold text-gray-400">Selection Window Closes</span>
                      <span className="text-xs font-black tracking-tight">{formatDate(deptStatus?.endTime)}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-gray-400">Status</span>
                      <span className="text-xs font-black tracking-tight">{statusLabel()}</span>
                    </div>
                  </div>

                  <div className="mt-4 p-3 bg-white/5 rounded-xl flex items-start border border-white/10">
                    <Info className="w-4 h-4 text-primary mr-3 flex-shrink-0 mt-0.5" />
                    <p className="text-[10px] font-bold text-gray-400 leading-relaxed italic">
                      Eligibility is determined by your current semester and session availability.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Confirmation Modal */}
        <Modal 
          isOpen={isModalOpen} 
          onClose={() => !isSubmitting && setIsModalOpen(false)}
          onConfirm={handleConfirmSubmit}
          title="Finalize Selections?"
          confirmDisabled={isSubmitting}
        >
          <div className="space-y-5 py-2">
            <div className="bg-amber-50 border border-amber-200 p-4 rounded-2xl flex items-start">
              <AlertTriangle className="text-amber-500 w-5 h-5 mr-3 shrink-0 mt-0.5" />
              <p className="text-xs font-bold text-amber-900 leading-relaxed">
                Are you sure you want to finalize your selections? Once confirmed, your electives will be locked and cannot be changed.
              </p>
            </div>
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-4">
               {categories.map(cat => (
                 <div key={cat.categoryId || cat.id}>
                   <p className="text-[10px] font-black uppercase text-gray-400 tracking-widest">{cat.categoryName || cat.name}</p>
                   <p className="font-bold text-gray-800">{selections[cat.categoryId || cat.id]?.title || 'Not Selected'}</p>
                 </div>
               ))}
            </div>
          </div>
        </Modal>

        {/* Full Schedule Modal */}
        <ScheduleModal 
          isOpen={isScheduleModalOpen} 
          onClose={() => setIsScheduleModalOpen(false)} 
          sessionInfo={{ ...deptStatus, status: statusLabel() }}
        />

        {isSubmitting && <Loader fullScreen />}
        {toast.show && <Toast message={toast.message} type={toast.type} onClose={() => setToast({ show: false, message: '' })} />}
      </div>
    </div>
  );
};

export default DeptElective;
