import { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import Navbar from '../components/Navbar';
import SubjectCard from '../components/SubjectCard';
import Modal from '../components/Modal';
import Loader from '../components/Loader';
import Toast from '../components/Toast';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Search, Filter } from 'lucide-react';

const OpenElective = () => {
  const { user, updateCurrentUser } = useAuth();
  const selectedElective = user?.openElectiveSelected;
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('All');
  
  const [modalOpen, setModalOpen] = useState(false);
  const [subjectToSelect, setSubjectToSelect] = useState(null);
  
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const fetchSubjects = async () => {
      try {
        const data = await api.getOpenElectives();
        setSubjects(data);
      } catch (error) {
        showToast("Failed to fetch subjects", "error");
      } finally {
        setLoading(false);
      }
    };
    fetchSubjects();
  }, []);

  const showToast = (message, type = 'success') => {
    setToast({ show: true, message, type });
  };

  const handleSelectClick = (subject) => {
    setSubjectToSelect(subject);
    setModalOpen(true);
  };

  const handleConfirmSelection = async () => {
    setIsSubmitting(true);
    setModalOpen(false);
    
    try {
      const result = await api.selectOpenElective(subjectToSelect.code);
      if (result.success) {
        // Save to persistent user object
        updateCurrentUser({
          openElectiveSelected: subjectToSelect
        });
        
        // Optimistically update seats
        setSubjects(prev => prev.map(s => 
          s.code === subjectToSelect.code 
            ? { ...s, filledSeats: s.filledSeats + 1 } 
            : s
        ));
        
        showToast(`You have selected: ${subjectToSelect.title}`);
      }
    } catch (error) {
      showToast("Failed to complete selection", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredSubjects = subjects.filter(s => {
    const matchesSearch = s.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          s.code.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesDept = departmentFilter === 'All' || s.department === departmentFilter;
    return matchesSearch && matchesDept;
  });

  const departments = ['All', ...new Set(subjects.map(s => s.department))];

  return (
    <div className="min-h-screen flex bg-background">
      <Sidebar user={user} />
      <div className="flex-1 md:ml-64 p-4 md:p-8 w-full max-w-7xl mx-auto">
        <Navbar user={user} />
        
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Open Elective Selection</h1>
          <p className="text-secondary mt-2">Choose one elective from the available subjects below</p>
        </div>

        {selectedElective && (
          <div className="bg-green-50 border border-green-200 rounded-2xl p-6 mb-8 flex items-center shadow-sm">
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center text-success mr-4 flex-shrink-0">
              ✓
            </div>
            <div>
              <h3 className="text-green-800 font-bold text-lg">Selection Confirmed!</h3>
              <p className="text-green-700">You have successfully registered for <span className="font-bold">{selectedElective.code} - {selectedElective.title}</span>. Selections are now locked.</p>
            </div>
          </div>
        )}

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
                isSelected={selectedElective?.code === subject.code}
                isDisabled={!!selectedElective || isSubmitting}
              />
            ))}
          </div>
        )}

        <Modal 
          isOpen={modalOpen} 
          onClose={() => setModalOpen(false)}
          onConfirm={handleConfirmSelection}
          title="Confirm Selection"
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
