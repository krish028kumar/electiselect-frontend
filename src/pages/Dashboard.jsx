import React from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import Navbar from '../components/Navbar';
import { useAuth } from '../context/AuthContext';

const Dashboard = () => {
  const navigate = useNavigate();
  const { user, loading } = useAuth();
  
  // If no user redirect to login
  if (!user && !loading) {
    return <Navigate to="/login" replace />;
  }
  
  // Map backend ProfileResponse to UI safely without silent fallbacks
  const name = user?.user?.name;
  const dept = user?.user?.department;
  const sem = user?.academicState?.currentSemester;
  const gender = user?.user?.gender;
  const role = user?.user?.role;
  
  const getEmoji = () => {
    const g = gender?.toLowerCase();
    if (g === 'male') return '👦';
    if (g === 'female') return '👧';
    return '👋';
  };
  
  const deadline = new Date();
  deadline.setDate(deadline.getDate() + 10);
  const deadlineStr = deadline.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  }).toUpperCase();
  
  console.log("Dashboard user:", user);

  // Dynamic elective states based on user.selections
  const openSelected = user?.selections?.openElective || null;
  const deptTheory = user?.selections?.deptTheory || null;
  const deptLab = user?.selections?.deptLab || null;
  
  const openSessionActive = user?.activeSession?.type === 'OPEN' && user?.activeSession?.active;
  const deptSessionActive = user?.activeSession?.type === 'DEPARTMENT' && user?.activeSession?.active;

  if (loading || !user) {
     return <div className="flex h-screen bg-gray-50 items-center justify-center">Loading...</div>;
  }

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      
      <Sidebar 
        active="dashboard" 
        role={role}
        user={user}
      />
      
      <div className="flex-1 flex flex-col overflow-hidden md:ml-64">
        
        <Navbar user={user} />
        
        <main className="flex-1 overflow-y-auto p-6 md:p-10">
          
          <div className="mb-8">
            <h1 className="text-3xl font-black text-gray-900 flex items-center gap-3">
              Welcome back, {name} 👋
            </h1>
            <div className="text-gray-500 text-sm mt-1 font-semibold flex items-center uppercase tracking-wider">
               <div className="w-1.5 h-1.5 bg-primary rounded-full mr-2"></div>
               Curate your learning experience
            </div>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
            
            <div className="bg-white rounded-[24px] p-8 shadow-[0_4px_20px_rgba(0,0,0,0.03)] border border-gray-100 hover:shadow-[0_8px_30px_rgba(0,0,0,0.06)] transition-all duration-300 group">
              <div className="flex justify-between items-start mb-6">
                <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center text-2xl shadow-inner group-hover:scale-110 transition-transform">
                  📚
                </div>
                <span className={`text-[10px] font-black px-3 py-1.5 rounded-full uppercase tracking-[0.1em] ${openSessionActive ? 'text-green-600 bg-green-50' : 'text-gray-500 bg-gray-100'}`}>
                  ● {openSessionActive ? 'ACTIVE' : 'INACTIVE'}
                </span>
              </div>
              <h3 className="text-xl font-black text-gray-900 mb-2">
                Open Elective
              </h3>
              <p className="text-sm text-gray-500 mb-6 leading-relaxed">
                Choose from interdisciplinary electives offered by other academic departments.
              </p>
              
              <div className="mb-6 p-4 bg-gray-50/50 rounded-2xl border border-gray-100">
                {openSelected ? (
                  <div className="text-[13px] text-green-600 font-black flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full shadow-[0_0_8px_rgba(34,197,94,0.4)]"></div>
                    {typeof openSelected === 'object' ? openSelected.title : openSelected}
                  </div>
                ) : (
                  <div className="text-[13px] text-orange-500 font-black flex items-center gap-2">
                    <div className="w-2 h-2 bg-orange-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(249,115,22,0.4)]"></div>
                    NOT SELECTED
                  </div>
                )}
              </div>

              <button 
                onClick={() => navigate('/open-elective')}
                className="w-full bg-primary hover:bg-blue-700 text-white py-4 px-6 rounded-2xl font-black text-sm uppercase tracking-widest shadow-xl shadow-primary/20 transition-all hover:-translate-y-1 active:translate-y-0"
              >
                View Electives
              </button>
            </div>
            
            <div className="bg-white rounded-[24px] p-8 shadow-[0_4px_20px_rgba(0,0,0,0.03)] border border-gray-100 hover:shadow-[0_8px_30px_rgba(0,0,0,0.06)] transition-all duration-300 group">
              <div className="flex justify-between items-start mb-6">
                <div className="w-12 h-12 bg-purple-50 text-purple-600 rounded-2xl flex items-center justify-center text-2xl shadow-inner group-hover:scale-110 transition-transform">
                  🎓
                </div>
                <span className={`text-[10px] font-black px-3 py-1.5 rounded-full uppercase tracking-[0.1em] ${deptSessionActive ? 'text-green-600 bg-green-50' : 'text-gray-500 bg-gray-100'}`}>
                  ● {deptSessionActive ? 'ACTIVE' : 'INACTIVE'}
                </span>
              </div>
              <h3 className="text-xl font-black text-gray-900 mb-2">
                Department Elective
              </h3>
              <p className="text-sm text-gray-500 mb-6 leading-relaxed">
                Select your core department elective subjects and specialized laboratory modules.
              </p>

              <div className="mb-6 p-4 bg-gray-50/50 rounded-2xl border border-gray-100">
                {deptTheory && deptLab ? (
                  <div className="text-[13px] text-green-600 font-black flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full shadow-[0_0_8px_rgba(34,197,94,0.4)]"></div>
                    SELECTED
                  </div>
                ) : (
                  <div className="text-[13px] text-orange-500 font-black flex items-center gap-2">
                    <div className="w-2 h-2 bg-orange-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(249,115,22,0.4)]"></div>
                    PENDING
                  </div>
                )}
              </div>

              <button
                onClick={() => navigate('/dept-elective')}
                className="w-full bg-primary hover:bg-blue-700 text-white py-4 px-6 rounded-2xl font-black text-sm uppercase tracking-widest shadow-xl shadow-primary/20 transition-all hover:-translate-y-1 active:translate-y-0"
              >
                View Electives
              </button>
            </div>
          </div>
          
          <div className="bg-white rounded-[24px] p-6 shadow-sm border border-gray-100 flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex gap-4">
              <div className="flex flex-col">
                <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Current Academic Level</span>
                <div className="flex gap-2">
                  {sem ? (
                    <span className="bg-gray-50 text-gray-700 px-4 py-1.5 rounded-xl text-xs font-black border border-gray-100 uppercase">
                      Semester {sem}
                    </span>
                  ) : null}
                  {dept ? (
                    <span className="bg-gray-50 text-gray-700 px-4 py-1.5 rounded-xl text-xs font-black border border-gray-100 uppercase">
                      {dept} Dept
                    </span>
                  ) : null}
                </div>
              </div>
            </div>
            <div className="flex flex-col items-center md:items-end">
               <span className="text-[10px] font-black text-red-400 uppercase tracking-[0.2em] mb-1">System Deadline</span>
               <div className="text-sm font-black text-red-600 bg-red-50/50 px-5 py-2 rounded-xl border-2 border-red-50 border-dashed">
                 {deadlineStr}
               </div>
            </div>
          </div>
          
        </main>
      </div>
    </div>
  );
};

export default Dashboard;
