import { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import Navbar from '../components/Navbar';
import Table from '../components/Table';
import Loader from '../components/Loader';
import { api } from '../services/api';
import { Layers, Users, BookOpen, Plus, Edit2, Trash2, Download } from 'lucide-react';

const DeptElectiveAdmin = () => {
  const { user } = useAuth();
  const [electives, setElectives] = useState({ theory: [], lab: [] });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchElectives = async () => {
      try {
        const data = await api.getDeptElectives();
        setElectives(data);
      } catch (error) {
        console.error("Failed to fetch department electives", error);
      } finally {
        setLoading(false);
      }
    };
    fetchElectives();
  }, []);

  const allSubjects = [
    ...electives.theory.map(s => ({ ...s, category: 'Theory', color: 'blue' })),
    ...electives.lab.map(s => ({ ...s, category: 'Lab', color: 'purple' }))
  ];

  const subjectColumns = [
    { header: 'Code', accessor: 'code', render: (row) => <span className="font-bold text-gray-900">{row.code}</span> },
    { header: 'Subject Name', accessor: 'title' },
    { 
      header: 'Category', 
      accessor: 'category',
      render: (row) => (
        <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${row.color === 'blue' ? 'bg-blue-100 text-blue-700' : 'bg-purple-100 text-purple-700'}`}>
          {row.category}
        </span>
      )
    },
    { header: 'Credits', accessor: 'credits', render: (row) => <span className="text-gray-600 font-semibold">{row.credits}</span> },
    { 
      header: 'Actions', 
      accessor: 'actions',
      render: () => (
        <div className="flex space-x-2">
          <button className="p-1.5 text-gray-400 hover:text-primary transition-colors"><Edit2 size={16} /></button>
          <button className="p-1.5 text-gray-400 hover:text-error transition-colors"><Trash2 size={16} /></button>
        </div>
      )
    }
  ];

  const studentData = [
    { usn: '1MS21IS001', name: 'Alex Johnson', theory: 'CS602 - Cloud Computing', lab: 'CS612 - Cloud Lab', status: 'Submitted' },
    { usn: '1MS21IS024', name: 'Rahul Murthy', theory: 'CS601 - ML Applications', lab: 'CS611 - ML Lab', status: 'Submitted' },
    { usn: '1MS21IS045', name: 'Sophia Chen', theory: '-', lab: '-', status: 'Pending' },
    { usn: '1MS21IS056', name: 'Amit Kumar', theory: 'CS603 - NLP', lab: 'CS613 - NLP Lab', status: 'Submitted' },
  ];

  const studentColumns = [
    { header: 'USN', accessor: 'usn', render: (row) => <span className="font-bold text-gray-600">{row.usn}</span> },
    { header: 'Student Name', accessor: 'name', render: (row) => <span className="font-semibold text-gray-900">{row.name}</span> },
    { header: 'Theory Selected', accessor: 'theory', render: (row) => <span className="text-sm">{row.theory}</span> },
    { header: 'Lab Selected', accessor: 'lab', render: (row) => <span className="text-sm">{row.lab}</span> },
    { 
      header: 'Status', 
      accessor: 'status',
      render: (row) => (
        <span className={`flex items-center text-xs font-bold ${row.status === 'Submitted' ? 'text-success' : 'text-error'}`}>
          <div className={`w-2 h-2 rounded-full mr-2 ${row.status === 'Submitted' ? 'bg-success' : 'bg-error'}`}></div>
          {row.status}
        </span>
      )
    }
  ];

  return (
    <div className="min-h-screen flex bg-background">
      <Sidebar user={user} />
      <div className="flex-1 md:ml-64 p-4 md:p-8 w-full max-w-7xl mx-auto">
        <Navbar user={user} />
        
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Department Elective Admin</h1>
          <p className="text-secondary mt-2">Manage categories, subjects and monitor selections</p>
        </div>

        {loading ? (
          <div className="py-20 flex justify-center"><Loader /></div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-l-4 border-l-blue-500">
                <p className="text-xs font-bold text-secondary uppercase tracking-wider mb-1">Total Students</p>
                <h3 className="text-3xl font-bold text-gray-900">60</h3>
              </div>
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-l-4 border-l-success">
                <p className="text-xs font-bold text-secondary uppercase tracking-wider mb-1">Submitted</p>
                <h3 className="text-3xl font-bold text-success">45</h3>
              </div>
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-l-4 border-l-error">
                <p className="text-xs font-bold text-secondary uppercase tracking-wider mb-1">Pending</p>
                <h3 className="text-3xl font-bold text-error">15</h3>
              </div>
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-l-4 border-l-purple-500">
                <p className="text-xs font-bold text-secondary uppercase tracking-wider mb-1">Categories</p>
                <h3 className="text-3xl font-bold text-gray-900">2</h3>
              </div>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-3 gap-8 mb-8">
              <div className="xl:col-span-1 space-y-6">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-bold text-gray-900">Categories</h2>
                </div>

                <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center">
                      <div className="bg-blue-100 p-2 rounded-lg text-blue-600 mr-3"><BookOpen size={20} /></div>
                      <div>
                        <h3 className="font-bold text-gray-900">Theory Elective</h3>
                        <p className="text-xs text-secondary">{electives.theory.length} Subjects</p>
                      </div>
                    </div>
                    <div className="flex space-x-1">
                      <button className="p-1.5 text-gray-400 hover:text-primary"><Edit2 size={14} /></button>
                      <button className="p-1.5 text-gray-400 hover:text-error"><Trash2 size={14} /></button>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center">
                      <div className="bg-purple-100 p-2 rounded-lg text-purple-600 mr-3"><Layers size={20} /></div>
                      <div>
                        <h3 className="font-bold text-gray-900">Lab Elective</h3>
                        <p className="text-xs text-secondary">{electives.lab.length} Subjects</p>
                      </div>
                    </div>
                    <div className="flex space-x-1">
                      <button className="p-1.5 text-gray-400 hover:text-primary"><Edit2 size={14} /></button>
                      <button className="p-1.5 text-gray-400 hover:text-error"><Trash2 size={14} /></button>
                    </div>
                  </div>
                </div>

                <button className="w-full border-2 border-dashed border-gray-300 rounded-2xl p-4 text-secondary font-bold hover:border-primary hover:text-primary transition-colors flex items-center justify-center">
                  <Plus className="w-5 h-5 mr-2" /> Add New Category
                </button>
              </div>

              <div className="xl:col-span-2">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-xl font-bold text-gray-900">Subject Management</h2>
                  <button className="bg-primary hover:bg-blue-700 text-white px-4 py-2 rounded-xl font-semibold flex items-center transition-colors text-sm shadow-sm">
                    <Plus className="w-4 h-4 mr-2" /> Add New Subject
                  </button>
                </div>
                <Table columns={subjectColumns} data={allSubjects} />
              </div>
            </div>

            <div className="mb-8">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
                <h2 className="text-xl font-bold text-gray-900">Student Selection Dashboard</h2>
                <div className="w-full md:w-64">
                   <input
                    type="text"
                    placeholder="Search USN or Name"
                    className="w-full p-2.5 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary/20 outline-none text-sm shadow-sm"
                  />
                </div>
              </div>
              <Table columns={studentColumns} data={studentData} />
            </div>

            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex flex-col md:flex-row justify-between items-center gap-4">
              <div>
                <h3 className="font-bold text-gray-900 mb-1">Finalize Selection Report</h3>
                <p className="text-sm text-secondary">Export the current selection data for university submission.</p>
              </div>
              <div className="flex flex-wrap gap-3">
                <button className="px-4 py-2 border border-gray-200 rounded-xl font-semibold text-gray-700 bg-white hover:bg-gray-50 flex items-center transition-colors">
                  <Download className="w-4 h-4 mr-2" /> Download Category-wise
                </button>
                <button className="px-4 py-2 bg-primary text-white rounded-xl font-semibold hover:bg-blue-700 flex items-center shadow-sm transition-colors">
                  <Download className="w-4 h-4 mr-2" /> Download All Selections
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default DeptElectiveAdmin;
