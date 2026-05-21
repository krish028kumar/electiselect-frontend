import React, { useState, useEffect } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import Navbar from '../components/Navbar';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

const Dashboard = () => {
  const navigate = useNavigate();
  const { user, loading } = useAuth();

  const [openSessionActive, setOpenSessionActive] = useState(false);
  const [deptSessionActive, setDeptSessionActive] = useState(false);
  const [openSubmitted, setOpenSubmitted] = useState(false);
  const [deptSubmitted, setDeptSubmitted] = useState(false);
  const [mySelections, setMySelections] = useState(null);

  const [openEndTime, setOpenEndTime] = useState(null);
  const [deptEndTime, setDeptEndTime] = useState(null);
  const [semester, setSemester] = useState(null);

  useEffect(() => {
    api.getProfile()
      .then(res => setSemester(res?.academicState?.currentSemester))
      .catch(() => {});

    api.getMySelections()
      .then(res => setMySelections(res))
      .catch(() => {});

    Promise.all([
      api.getOpenStatus(),
      api.getDeptStatus()
    ])
      .then(([openStatus, deptStatus]) => {
        setOpenSessionActive(openStatus?.visible === true);
        setDeptSessionActive(deptStatus?.visible === true);
        setOpenSubmitted(openStatus?.submitted === true);
        setDeptSubmitted(deptStatus?.submitted === true);
        setOpenEndTime(openStatus?.endTime || null);
        setDeptEndTime(deptStatus?.endTime || null);
      })
      .catch(() => {
        setOpenSessionActive(false);
        setDeptSessionActive(false);
        setOpenSubmitted(false);
        setDeptSubmitted(false);
      });
  }, []);

  // If no user redirect to login
  if (!user && !loading) {
    return <Navigate to="/login" replace />;
  }

  // Map backend /api/user/me response to UI safely
  // AuthContext user comes from /api/user/me which returns flat fields
  const name = user?.name;
  const dept = user?.department;
  const sem  = semester || user?.semester;
  const role = user?.role;

  const getEmoji = () => '👋';

  let activeEndTime = null;
  if (openSessionActive && openEndTime) activeEndTime = new Date(openEndTime);
  if (deptSessionActive && deptEndTime) {
    const dTime = new Date(deptEndTime);
    if (!activeEndTime || dTime < activeEndTime) {
      activeEndTime = dTime; // show closest deadline
    }
  }

  const deadlineStr = activeEndTime 
    ? activeEndTime.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      }).toUpperCase()
    : 'NO ACTIVE DEADLINE';

  console.log("Dashboard user:", user);

  // Dynamic elective states based on user.selections
  const openSelected = mySelections?.openElective?.selected;
  const openDetails = mySelections?.openElective;
  const deptSelected = mySelections?.departmentElective?.selected;
  const deptDetails = mySelections?.departmentElective;

  const isOpActive = openSelected ? openDetails.sessionActive : openSessionActive;
  const isDeptActive = deptSelected ? deptDetails.sessionActive : deptSessionActive;

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
                <span className={`text-[10px] font-black px-3 py-1.5 rounded-full uppercase tracking-[0.1em] ${isOpActive ? 'text-green-600 bg-green-50' : 'text-gray-500 bg-gray-100'}`}>
                  ● {isOpActive ? 'ACTIVE' : 'CLOSED'}
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
                  <>
                    <div className="text-[13px] text-green-600 font-black flex items-center gap-2 mb-1">
                      <div className="w-2 h-2 bg-green-500 rounded-full shadow-[0_0_8px_rgba(34,197,94,0.4)]"></div>
                      SELECTED
                    </div>
                    <div className="text-sm font-semibold text-gray-800">
                      {openDetails.courseCode} - {openDetails.subjectName}
                    </div>
                  </>
                ) : (
                  <>
                    <div className="text-[13px] text-orange-500 font-black flex items-center gap-2 mb-1">
                      <div className="w-2 h-2 bg-orange-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(249,115,22,0.4)]"></div>
                      NOT SELECTED
                    </div>
                    <div className="text-sm font-semibold text-gray-500">
                      No elective selected
                    </div>
                  </>
                )}
              </div>

              <button 
                onClick={() => navigate('/open-elective')}
                disabled={!isOpActive}
                className={`w-full py-4 px-6 rounded-2xl font-black text-sm uppercase tracking-widest shadow-xl transition-all ${isOpActive ? 'bg-primary hover:bg-blue-700 text-white shadow-primary/20 hover:-translate-y-1 active:translate-y-0' : 'bg-gray-200 text-gray-400 cursor-not-allowed shadow-none'}`}
              >
                {openSelected ? 'VIEW SELECTION' : 'VIEW ELECTIVES'}
              </button>
            </div>
            
            <div className="bg-white rounded-[24px] p-8 shadow-[0_4px_20px_rgba(0,0,0,0.03)] border border-gray-100 hover:shadow-[0_8px_30px_rgba(0,0,0,0.06)] transition-all duration-300 group">
              <div className="flex justify-between items-start mb-6">
                <div className="w-12 h-12 bg-purple-50 text-purple-600 rounded-2xl flex items-center justify-center text-2xl shadow-inner group-hover:scale-110 transition-transform">
                  🎓
                </div>
                <span className={`text-[10px] font-black px-3 py-1.5 rounded-full uppercase tracking-[0.1em] ${isDeptActive ? 'text-green-600 bg-green-50' : 'text-gray-500 bg-gray-100'}`}>
                  ● {isDeptActive ? 'ACTIVE' : 'CLOSED'}
                </span>
              </div>
              <h3 className="text-xl font-black text-gray-900 mb-2">
                Department Elective
              </h3>
              <p className="text-sm text-gray-500 mb-6 leading-relaxed">
                Select your core department elective subjects and specialized laboratory modules.
              </p>

              <div className="mb-6 p-4 bg-gray-50/50 rounded-2xl border border-gray-100">
                {deptSelected ? (
                  <>
                    <div className="text-[13px] text-green-600 font-black flex items-center gap-2 mb-1">
                      <div className="w-2 h-2 bg-green-500 rounded-full shadow-[0_0_8px_rgba(34,197,94,0.4)]"></div>
                      SELECTED
                    </div>
                    <div className="text-sm font-semibold text-gray-800">
                      {deptDetails.courseCode} - {deptDetails.subjectName}
                    </div>
                  </>
                ) : (
                  <>
                    <div className="text-[13px] text-orange-500 font-black flex items-center gap-2 mb-1">
                      <div className="w-2 h-2 bg-orange-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(249,115,22,0.4)]"></div>
                      NOT SELECTED
                    </div>
                    <div className="text-sm font-semibold text-gray-500">
                      No elective selected
                    </div>
                  </>
                )}
              </div>

              <button
                onClick={() => navigate('/dept-elective')}
                disabled={!isDeptActive}
                className={`w-full py-4 px-6 rounded-2xl font-black text-sm uppercase tracking-widest shadow-xl transition-all ${isDeptActive ? 'bg-primary hover:bg-blue-700 text-white shadow-primary/20 hover:-translate-y-1 active:translate-y-0' : 'bg-gray-200 text-gray-400 cursor-not-allowed shadow-none'}`}
              >
                {deptSelected ? 'VIEW SELECTION' : 'VIEW ELECTIVES'}
              </button>
            </div>
          </div>
          
          <div className="bg-white rounded-[24px] p-6 shadow-[0_4px_20px_rgba(0,0,0,0.03)] border border-gray-100 mb-8">
            <h3 className="text-[11px] font-black text-gray-400 uppercase tracking-[0.15em] mb-4">
              My Current Selections
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 bg-gray-50 rounded-xl border border-gray-100">
                <div className="text-xs font-bold text-gray-500 uppercase mb-1">Open Elective</div>
                {openSelected ? (
                  <div className="font-bold text-gray-900">{openDetails.courseCode} - {openDetails.subjectName}</div>
                ) : (
                  <div className="text-sm text-gray-400 italic">None selected</div>
                )}
              </div>
              <div className="p-4 bg-gray-50 rounded-xl border border-gray-100">
                <div className="text-xs font-bold text-gray-500 uppercase mb-1">Department Elective</div>
                {deptSelected ? (
                  <div className="font-bold text-gray-900">{deptDetails.courseCode} - {deptDetails.subjectName}</div>
                ) : (
                  <div className="text-sm text-gray-400 italic">None selected</div>
                )}
              </div>
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
