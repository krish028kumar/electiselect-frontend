import { useState, useEffect, useMemo } from 'react';
import Sidebar from '../components/Sidebar';
import Navbar from '../components/Navbar';
import Table from '../components/Table';
import Loader from '../components/Loader';
import DeptSelector from '../components/DeptSelector';
import Modal from '../components/Modal';
import api from '../services/api';
import { 
  Users, 
  CheckCircle, 
  AlertTriangle, 
  TrendingUp, 
  Download, 
  Search, 
  Filter, 
  BarChart2, 
  ArrowRight,
  TrendingDown,
  X,
  FileText,
  MousePointer2
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const OpenElectiveAdmin = () => {
  const { user } = useAuth();
  const [subjects, setSubjects] = useState([]);
  const [allStudents, setAllStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDept, setSelectedDept] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Modal States
  const [isSubjectModalOpen, setIsSubjectModalOpen] = useState(false);
  const [selectedSubjectsForExport, setSelectedSubjectsForExport] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [subjectsData, studentsData] = await Promise.all([
          api.getOpenElectives(),
          api.getMockStudents()
        ]);
        setSubjects(subjectsData);
        setAllStudents(studentsData);
      } catch (error) {
        console.error("Failed to fetch admin data", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // Filtering Logic
  const filteredSubjects = useMemo(() => {
    return subjects.filter(sub => {
      const matchesDept = selectedDept === 'ALL' || sub.department === selectedDept;
      const matchesSearch = sub.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          sub.code.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesDept && matchesSearch;
    });
  }, [subjects, selectedDept, searchQuery]);

  const filteredStudents = useMemo(() => {
    return allStudents.filter(stu => {
      return selectedDept === 'ALL' || stu.department === selectedDept;
    });
  }, [allStudents, selectedDept]);

  // Stats Calculation
  const stats = useMemo(() => {
    const total = filteredStudents.length;
    const selected = filteredStudents.filter(s => s.status === 'Confirmed').length;
    const notSelected = total - selected;
    const seatsFilledPercent = total > 0 ? Math.round((selected / total) * 100) : 0;

    return { totalStudents: total, selected, notSelected, seatsFilledPercent };
  }, [filteredStudents]);

  // CSV Export Utility
  const downloadCSV = (data, filename) => {
    const headers = Object.keys(data[0]);
    const csvContent = [
      headers.join(','),
      ...data.map(row => headers.map(header => `"${row[header]}"`).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleDownloadAll = () => {
    const exportData = filteredStudents.map(s => ({
      USN: s.usn,
      "Student Name": s.name,
      Department: s.department,
      Semester: s.semester,
      "Selected Subject": s.selectedSubject,
      "Subject Code": s.subjectCode,
      "Selection Date": s.selectionDate,
      Status: s.status
    }));
    downloadCSV(exportData, `electiselect-all-data-${selectedDept.toLowerCase()}.csv`);
  };

  const handleDownloadSubjectWise = () => {
    const selectedCodes = selectedSubjectsForExport;
    const exportData = allStudents
      .filter(s => selectedCodes.includes(s.subjectCode))
      .map(s => ({
        USN: s.usn,
        "Student Name": s.name,
        Department: s.department,
        "Selected Subject": s.selectedSubject,
        "Subject Code": s.subjectCode,
        Status: s.status
      }));

    if (exportData.length === 0) {
      alert("No students found for the selected subjects.");
      return;
    }
    
    downloadCSV(exportData, `subject-wise-enrollment.csv`);
    setIsSubjectModalOpen(false);
  };

  const toggleSubjectSelect = (code) => {
    setSelectedSubjectsForExport(prev => 
      prev.includes(code) ? prev.filter(c => c !== code) : [...prev, code]
    );
  };

  const selectAllSubjects = () => {
    if (selectedSubjectsForExport.length === subjects.length) {
      setSelectedSubjectsForExport([]);
    } else {
      setSelectedSubjectsForExport(subjects.map(s => s.code));
    }
  };

  const columns = [
    { header: 'Subject', accessor: 'subject', render: (row) => (
      <div>
        <div className="font-bold text-gray-900 leading-tight">{row.title}</div>
        <div className="text-[10px] font-black uppercase text-primary tracking-widest mt-0.5">{row.code}</div>
      </div>
    )},
    { header: 'Dept', accessor: 'department', render: (row) => (
      <span className="px-2 py-1 bg-gray-50 border border-gray-100 rounded text-[10px] font-bold text-secondary uppercase">
        {row.department}
      </span>
    )},
    { header: 'Max', accessor: 'maxSeats', render: (row) => <span className="font-medium text-gray-600">{row.maxSeats}</span> },
    { header: 'Filled', accessor: 'filledSeats', render: (row) => (
      <div className="flex items-center">
        <span className="text-secondary font-bold mr-2 text-sm">{row.filledSeats}</span>
        <div className="w-12 bg-gray-100 rounded-full h-1.5 overflow-hidden">
          <div className={`h-full rounded-full ${row.filledSeats >= row.maxSeats ? 'bg-error' : 'bg-primary'}`} style={{ width: `${(row.filledSeats/row.maxSeats)*100}%` }}></div>
        </div>
      </div>
    )},
    { header: 'Status', accessor: 'status', render: (row) => {
      const isFull = row.filledSeats >= row.maxSeats;
      return (
        <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${
          isFull ? 'bg-red-50 text-error border border-red-100' : 'bg-green-50 text-success border border-green-100'
        }`}>
          {isFull ? 'Full' : 'Active'}
        </span>
      );
    }}
  ];

  return (
    <div className="min-h-screen flex bg-slate-50">
      <Sidebar user={user} />
      <div className="flex-1 md:ml-64 p-4 md:p-8 w-full max-w-7xl mx-auto">
        <Navbar user={user} />
        
        {/* Header Section */}
        <div className="mb-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-4xl font-black text-gray-900 tracking-tight">Open Elective Monitor</h1>
            <p className="text-secondary mt-2 font-medium">Real-time enrollment tracking and student data management.</p>
          </div>
          <div className="px-5 py-3 bg-white rounded-2xl shadow-sm border border-gray-100 flex items-center">
            <div className="w-2.5 h-2.5 bg-green-500 rounded-full animate-pulse mr-3"></div>
            <span className="text-xs font-black uppercase tracking-widest text-primary">Live Dashboard Active</span>
          </div>
        </div>

        {loading ? (
          <div className="py-20 flex flex-col items-center">
            <Loader />
            <p className="mt-4 text-secondary font-black uppercase tracking-widest text-xs animate-pulse text-center">Syncing Database...</p>
          </div>
        ) : (
          <>
            {/* Top Selector Card Row */}
            <DeptSelector selectedDept={selectedDept} onSelect={setSelectedDept} />

            <div className="grid grid-cols-1 xl:grid-cols-4 gap-8">
              {/* Left Column: Summary Stats */}
              <div className="xl:col-span-1 space-y-4">
                <h2 className="text-sm font-black text-gray-400 uppercase tracking-[0.2em] mb-4 flex items-center">
                  <BarChart2 className="w-4 h-4 mr-2" /> Quick Metrics
                </h2>
                
                <div className="bg-white p-6 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 group transition-all hover:shadow-xl hover:shadow-primary/5">
                  <div className="flex justify-between items-start mb-4">
                    <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center text-primary">
                      <Users size={24} />
                    </div>
                    {selectedDept !== 'ALL' && <span className="text-[9px] font-black text-primary px-2 py-1 bg-blue-50 rounded-lg">{selectedDept}</span>}
                  </div>
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Total Students</p>
                  <h3 className="text-4xl font-black text-gray-900 group-hover:text-primary transition-colors">{stats.totalStudents}</h3>
                </div>

                <div className="bg-white p-6 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 group transition-all hover:shadow-xl hover:shadow-success/5">
                  <div className="flex justify-between items-start mb-4">
                    <div className="w-12 h-12 bg-green-50 rounded-2xl flex items-center justify-center text-success">
                      <CheckCircle size={24} />
                    </div>
                    <span className="text-[9px] font-black text-success px-2 py-1 bg-green-50 rounded-lg">LIVE</span>
                  </div>
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Selections Made</p>
                  <h3 className="text-4xl font-black text-gray-900 group-hover:text-success transition-colors">{stats.selected}</h3>
                </div>

                <div className="bg-white p-6 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 group transition-all hover:shadow-xl hover:shadow-error/5">
                  <div className="flex justify-between items-start mb-4">
                    <div className="w-12 h-12 bg-red-50 rounded-2xl flex items-center justify-center text-error">
                      <AlertTriangle size={24} />
                    </div>
                    <span className="text-[9px] font-black text-error px-2 py-1 bg-red-50 rounded-lg">PENDING</span>
                  </div>
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Not Selected</p>
                  <h3 className="text-4xl font-black text-gray-900 group-hover:text-error transition-colors">{stats.notSelected}</h3>
                </div>

                <div className="bg-gray-900 p-6 rounded-3xl shadow-xl shadow-gray-900/20 relative overflow-hidden group">
                  <div className="absolute top-0 right-0 w-24 h-24 bg-primary/20 rounded-full -translate-y-12 translate-x-12"></div>
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Overall Fill Rate</p>
                  <div className="flex items-end gap-3 mb-4">
                    <h3 className="text-4xl font-black text-white">{stats.seatsFilledPercent}%</h3>
                    <TrendingUp className="text-primary mb-1.5" size={20} />
                  </div>
                  <div className="w-full bg-white/10 rounded-full h-2 overflow-hidden">
                    <motion.div 
                      initial={{ width: 0 }} 
                      animate={{ width: `${stats.seatsFilledPercent}%` }} 
                      className="bg-primary h-full rounded-full"
                    ></motion.div>
                  </div>
                </div>
              </div>

              {/* Center Column: Table */}
              <div className="xl:col-span-2 space-y-6">
                <div className="bg-white rounded-[32px] p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100">
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
                    <h2 className="text-xl font-bold text-gray-900">Elective Performance</h2>
                    
                    <div className="relative w-full sm:w-64">
                      <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                      <input 
                        type="text" 
                        placeholder="Search subjects..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-11 pr-4 py-2.5 bg-gray-50 border border-gray-100 rounded-xl outline-none focus:ring-4 focus:ring-primary/10 transition-all text-sm font-medium"
                      />
                    </div>
                  </div>

                  <div className="overflow-hidden border border-gray-100 rounded-2xl">
                    <Table columns={columns} data={filteredSubjects} />
                  </div>
                </div>
              </div>

              {/* Right Column: Insights */}
              <div className="xl:col-span-1 space-y-6">
                <h2 className="text-sm font-black text-gray-400 uppercase tracking-[0.2em] flex items-center">
                  <TrendingUp className="w-4 h-4 mr-2" /> Real-time Insights
                </h2>
                
                <div className="bg-white p-6 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border-r-4 border-r-success">
                  <p className="text-[10px] font-black text-success uppercase tracking-widest mb-4 flex items-center">
                    <TrendingUp className="w-4 h-4 mr-2" /> Most Popular
                  </p>
                  {filteredSubjects.length > 0 ? (() => {
                    const top = [...filteredSubjects].sort((a,b) => b.filledSeats - a.filledSeats)[0];
                    return (
                      <>
                        <h4 className="font-extrabold text-gray-900 text-lg leading-tight mb-2">{top.title}</h4>
                        <p className="text-xs font-bold text-secondary flex items-center gap-2 mb-4">
                          {top.code} <ArrowRight size={10} /> {Math.round((top.filledSeats/top.maxSeats)*100)}% Capacity
                        </p>
                        <div className="flex justify-between items-center text-sm font-black">
                          <span className="text-success">{top.filledSeats} Enrolled</span>
                          <span className="text-gray-300">/ {top.maxSeats}</span>
                        </div>
                      </>
                    )
                  })() : <p className="text-xs text-gray-400 italic">No data available for filters</p>}
                </div>

                <div className="bg-white p-6 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border-r-4 border-r-error">
                  <p className="text-[10px] font-black text-error uppercase tracking-widest mb-4 flex items-center">
                    <TrendingDown className="w-4 h-4 mr-2" /> Low Enrollment
                  </p>
                  {filteredSubjects.length > 0 ? (() => {
                    const bottom = [...filteredSubjects].sort((a,b) => a.filledSeats - b.filledSeats)[0];
                    return (
                      <>
                        <h4 className="font-extrabold text-gray-900 text-lg leading-tight mb-2">{bottom.title}</h4>
                        <p className="text-xs font-bold text-secondary flex items-center gap-2 mb-4">
                          {bottom.code} <ArrowRight size={10} /> Action Suggested
                        </p>
                        <div className="flex justify-between items-center text-sm font-black">
                          <span className="text-error">{bottom.filledSeats} Enrolled</span>
                          <span className="text-gray-300">/ {bottom.maxSeats}</span>
                        </div>
                      </>
                    )
                  })() : <p className="text-xs text-gray-400 italic">No data available for filters</p>}
                </div>

                <div className="p-6 bg-primary rounded-3xl shadow-xl shadow-primary/20 text-white relative overflow-hidden">
                   <div className="absolute top-0 right-0 w-24 h-24 bg-white/10 rounded-full translate-x-12 -translate-y-12"></div>
                   <h4 className="font-black text-sm uppercase tracking-widest mb-3">System Advice</h4>
                   <p className="text-xs font-bold leading-relaxed opacity-90 mb-6">
                     Based on {selectedDept} statistics, {stats.notSelected} students are yet to finalize their choice. Send automated reminder?
                   </p>
                   <button className="w-full py-3 bg-white text-primary rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-blue-50 transition-all flex items-center justify-center gap-2">
                     Notify Pending Students <MousePointer2 size={12} />
                   </button>
                </div>
              </div>
            </div>

            {/* Bottom Export Section */}
            <div className="mt-12 bg-white rounded-[32px] p-8 border border-gray-100 flex flex-col md:flex-row justify-between items-center gap-6">
               <div className="flex items-center gap-5">
                 <div className="w-14 h-14 bg-gray-50 rounded-2xl flex items-center justify-center text-gray-400 border border-gray-100">
                    <FileText size={24} />
                 </div>
                 <div>
                    <h3 className="font-extrabold text-lg text-gray-900">Data Management & Export</h3>
                    <p className="text-xs font-medium text-secondary">Export structured student data for administrative records.</p>
                 </div>
               </div>

               <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
                 <button 
                  onClick={() => setIsSubjectModalOpen(true)}
                  className="px-6 py-4 bg-white border-2 border-gray-100 rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] text-gray-600 hover:border-primary hover:text-primary transition-all flex items-center justify-center gap-3"
                 >
                   <Filter size={16} /> Download Subject-wise
                 </button>
                 <button 
                  onClick={handleDownloadAll}
                  className="px-8 py-4 bg-primary text-white rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] shadow-xl shadow-primary/20 hover:bg-blue-600 transition-all flex items-center justify-center gap-3"
                 >
                   <Download size={16} /> Download All Data
                 </button>
               </div>
            </div>
          </>
        )}
      </div>

      {/* Subject-wise Modal */}
      <Modal 
        isOpen={isSubjectModalOpen} 
        onClose={() => setIsSubjectModalOpen(false)}
        title="Download Subject-wise Data"
        confirmText="Download Selected"
        onConfirm={handleDownloadSubjectWise}
      >
        <div className="space-y-4 py-4">
          <div className="flex justify-between items-center p-3 bg-gray-50 rounded-xl border border-gray-100 mb-2">
             <span className="text-xs font-black text-gray-500 uppercase tracking-widest">Select All Subjects</span>
             <button onClick={selectAllSubjects} className={`w-10 h-6 rounded-full relative transition-all ${selectedSubjectsForExport.length === subjects.length ? 'bg-primary' : 'bg-gray-300'}`}>
                <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${selectedSubjectsForExport.length === subjects.length ? 'left-5' : 'left-1'}`}></div>
             </button>
          </div>
          
          <div className="max-h-[300px] overflow-y-auto pr-2 space-y-2 custom-scrollbar">
            {subjects.map(sub => (
              <label 
                key={sub.id} 
                className={`flex items-center p-4 rounded-2xl border-2 transition-all cursor-pointer ${
                  selectedSubjectsForExport.includes(sub.code) ? 'border-primary bg-blue-50' : 'border-gray-50 hover:border-gray-200'
                }`}
              >
                <div className={`w-5 h-5 rounded border-2 flex items-center justify-center mr-4 transition-all ${
                  selectedSubjectsForExport.includes(sub.code) ? 'bg-primary border-primary' : 'border-gray-200 bg-white'
                }`}>
                  <input 
                    type="checkbox" 
                    className="hidden" 
                    checked={selectedSubjectsForExport.includes(sub.code)}
                    onChange={() => toggleSubjectSelect(sub.code)}
                  />
                  {selectedSubjectsForExport.includes(sub.code) && <CheckCircle className="text-white w-3 h-3" />}
                </div>
                <div>
                  <p className="text-xs font-black text-gray-900 leading-none">{sub.title}</p>
                  <p className="text-[10px] text-gray-400 mt-1 font-bold uppercase tracking-widest">{sub.code} • {sub.department}</p>
                </div>
              </label>
            ))}
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default OpenElectiveAdmin;
