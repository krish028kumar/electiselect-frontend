import { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import Navbar from '../components/Navbar';
import CategorySection from '../components/CategorySection';
import Loader from '../components/Loader';
import Toast from '../components/Toast';
import Modal from '../components/Modal';
import ScheduleModal from '../components/ScheduleModal';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Calendar, Clock, Lock, CheckCircle, Info, ChevronRight, AlertTriangle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const DeptElective = () => {
  const { user, updateCurrentUser } = useAuth();
  const selectedDeptElectives = user?.deptElectiveTheory ? { theory: user.deptElectiveTheory, lab: user.deptElectiveLab } : null;
  
  const [electives, setElectives] = useState({ theory: [], lab: [] });
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });

  const [selections, setSelections] = useState({
    theory: null,
    lab: null
  });

  useEffect(() => {
    if (selectedDeptElectives) {
      setSelections({
        theory: selectedDeptElectives.theory,
        lab: selectedDeptElectives.lab
      });
    }

    const fetchElectives = async () => {
      try {
        const data = await api.getDeptElectives();
        setElectives(data);
      } catch (error) {
        showToast("Failed to fetch department electives", "error");
      } finally {
        setLoading(false);
      }
    };
    fetchElectives();
  }, [selectedDeptElectives]);

  const showToast = (message, type = 'success') => {
    setToast({ show: true, message, type });
  };

  const handleSelect = (category, subject) => {
    if (selectedDeptElectives) return;
    setSelections(prev => ({ ...prev, [category]: subject }));
  };

  const handleConfirmSubmit = async () => {
    setIsModalOpen(false);
    setIsSubmitting(true);
    
    // Simulate API delay
    try {
      // Simulate API delay
      setTimeout(() => {
        updateCurrentUser({
          deptElectiveTheory: selections.theory,
          deptElectiveLab: selections.lab
        });
        showToast("Selections submitted successfully 🎉");
        setIsSubmitting(false);
      }, 1500);
    } catch (error) {
      showToast("Submission failed", "error");
      setIsSubmitting(false);
    }
  };

  const isFormComplete = selections.theory && selections.lab;

  const importantDates = [
    { label: "Selection Start", date: "10 Aug 2026", icon: CheckCircle, color: "text-green-500" },
    { label: "Selection Deadline", date: "15 Aug 2026", icon: Clock, color: "text-orange-500" },
    { label: "Lock Date", date: "16 Aug 2026", icon: Lock, color: "text-red-500" },
    { label: "Results Announcement", date: "18 Aug 2026", icon: Calendar, color: "text-blue-500" }
  ];

  return (
    <div className="min-h-screen flex bg-slate-50">
      <Sidebar user={user} />
      <div className="flex-1 md:ml-64 p-4 md:p-8 w-full max-w-7xl mx-auto">
        <Navbar user={user} />
        
        <div className="mb-10">
          <h1 className="text-4xl font-black text-gray-900 tracking-tight">Department Elective Selection</h1>
          <p className="text-secondary mt-2 font-medium">Customize your academic path by selecting core theory and lab electives.</p>
        </div>

        <AnimatePresence>
          {selectedDeptElectives && (
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
              <CategorySection 
                title="Theory Elective"
                icon="📘"
                colorTheme="blue"
                subjects={electives.theory}
                selectedId={selections.theory?.id}
                onSelect={(subject) => handleSelect('theory', subject)}
                disabled={!!selectedDeptElectives || isSubmitting}
              />
              
              <CategorySection 
                title="Lab Elective"
                icon="💻"
                colorTheme="purple"
                subjects={electives.lab}
                selectedId={selections.lab?.id}
                onSelect={(subject) => handleSelect('lab', subject)}
                disabled={!!selectedDeptElectives || isSubmitting}
              />
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
                    <div className="group">
                      <p className="text-[10px] text-gray-400 font-extrabold uppercase tracking-[0.2em] mb-2">Selected Theory</p>
                      {selections.theory ? (
                        <div className="p-4 bg-blue-50/50 rounded-2xl border border-blue-100 transition-all hover:border-primary">
                          <p className="text-xs font-black text-primary uppercase mb-1">{selections.theory.code}</p>
                          <p className="text-sm font-bold text-gray-800 leading-snug">{selections.theory.title}</p>
                        </div>
                      ) : (
                        <div className="p-4 bg-red-50/50 rounded-2xl border border-dashed border-red-200">
                           <p className="text-sm text-red-500 font-bold italic flex items-center">
                             Not selected
                           </p>
                        </div>
                      )}
                    </div>

                    <div>
                      <p className="text-[10px] text-gray-400 font-extrabold uppercase tracking-[0.2em] mb-2">Selected Lab</p>
                      {selections.lab ? (
                        <div className="p-4 bg-purple-50/50 rounded-2xl border border-purple-100 transition-all hover:border-purple-400">
                          <p className="text-xs font-black text-purple-600 uppercase mb-1">{selections.lab.code}</p>
                          <p className="text-sm font-bold text-gray-800 leading-snug">{selections.lab.title}</p>
                        </div>
                      ) : (
                        <div className="p-4 bg-red-50/50 rounded-2xl border border-dashed border-red-200">
                           <p className="text-sm text-red-500 font-bold italic">Not selected</p>
                        </div>
                      )}
                    </div>
                  </div>

                  {!selectedDeptElectives && (
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
                  
                  {selectedDeptElectives && (
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
                  
                  <div className="space-y-5 mb-8 relative z-10">
                    {importantDates.map((item, idx) => (
                      <div key={idx} className="flex items-center justify-between border-b border-white/5 pb-3">
                        <div className="flex items-center">
                          <item.icon className={`w-4 h-4 mr-3 ${item.color}`} />
                          <span className="text-xs font-bold text-gray-400">{item.label}</span>
                        </div>
                        <span className="text-xs font-black tracking-tight">{item.date}</span>
                      </div>
                    ))}
                  </div>

                  <button 
                    onClick={() => setIsScheduleModalOpen(true)}
                    className="w-full py-3 bg-white/10 hover:bg-white/15 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] transition-all flex items-center justify-center border border-white/10"
                  >
                    View Full Schedule <ChevronRight className="w-3 h-3 ml-2" />
                  </button>
                  
                  <div className="mt-6 p-3 bg-white/5 rounded-xl flex items-start border border-white/10">
                    <Info className="w-4 h-4 text-primary mr-3 flex-shrink-0 mt-0.5" />
                    <p className="text-[10px] font-bold text-gray-400 leading-relaxed italic">
                      Selections cannot be modified after the deadline has passed.
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
          onClose={() => setIsModalOpen(false)}
          onConfirm={handleConfirmSubmit}
          title="Finalize Selections?"
        >
          <div className="space-y-5 py-2">
            <div className="bg-amber-50 border border-amber-200 p-4 rounded-2xl flex items-start">
              <AlertTriangle className="text-amber-500 w-5 h-5 mr-3 shrink-0 mt-0.5" />
              <p className="text-xs font-bold text-amber-900 leading-relaxed">
                Are you sure you want to finalize your selections? Once confirmed, your electives will be locked and cannot be changed.
              </p>
            </div>
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200">
               <div className="mb-2">
                 <p className="text-[10px] font-black uppercase text-gray-400 tracking-widest">Theory Choice</p>
                 <p className="font-bold text-gray-800">{selections.theory?.title}</p>
               </div>
               <div>
                 <p className="text-[10px] font-black uppercase text-gray-400 tracking-widest">Lab Choice</p>
                 <p className="font-bold text-gray-800">{selections.lab?.title}</p>
               </div>
            </div>
          </div>
        </Modal>

        {/* Full Schedule Modal */}
        <ScheduleModal 
          isOpen={isScheduleModalOpen} 
          onClose={() => setIsScheduleModalOpen(false)} 
        />

        {isSubmitting && <Loader fullScreen />}
        {toast.show && <Toast message={toast.message} type={toast.type} onClose={() => setToast({ show: false, message: '' })} />}
      </div>
    </div>
  );
};

export default DeptElective;
