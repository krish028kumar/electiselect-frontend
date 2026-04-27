import { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import logo from '../logo.png';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';
import { 
  User, 
  BookOpen, 
  Lock, 
  ChevronRight, 
  ChevronLeft, 
  CheckCircle, 
  Calendar, 
  Phone, 
  Mail, 
  GraduationCap,
  Building2,
  CheckCircle2,
  ArrowRight,
  ShieldCheck,
  X,
  Check
} from 'lucide-react';

const Register = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  
  const [step, setStep] = useState(1);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [registrationComplete, setRegistrationComplete] = useState(false);
  const [registeredUser, setRegisteredUser] = useState(null);
  const [countdown, setCountdown] = useState(5);
  
  // Verification States
  const [isVerifying, setIsVerifying] = useState(false);
  const [verificationType, setVerificationType] = useState('phone'); // 'phone' or 'email'
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [timer, setTimer] = useState(30);
  const [isVerified, setIsVerified] = useState(false);
  const [verificationError, setVerificationError] = useState(false);
  const otpRefs = useRef([]);

  const [formData, setFormData] = useState({
    name: '',
    gender: '',
    dob: '',
    phone: '',
    college: 'Dayananda Sagar College of Engineering',
    role: 'student',
    department: '',
    semester: '',
    admissionYear: '2024',
    rollNo: '',
    password: '',
    confirmPassword: ''
  });
  
  const [errors, setErrors] = useState({});

  // Auto-generate USN and Email
  const branchCodes = { 'ISE': 'IS', 'CSE': 'CS', 'ECE': 'EC', 'MECH': 'ME', 'CIVIL': 'CV', 'MBA': 'MB' };
  const usnYear = formData.admissionYear ? formData.admissionYear.slice(-2) : '';
  const branchCode = branchCodes[formData.department] || '';
  const paddedRollNo = formData.rollNo.padStart(3, '0');
  const generatedUSN = (usnYear && branchCode && formData.rollNo) ? `1DS${usnYear}${branchCode}${paddedRollNo}` : '';
  const generatedEmail = generatedUSN ? `${generatedUSN.toLowerCase()}@dsce.edu.in` : '';

  // Timer Effect
  useEffect(() => {
    let interval;
    if (isVerifying && timer > 0) {
      interval = setInterval(() => setTimer(prev => prev - 1), 1000);
    }
    return () => clearInterval(interval);
  }, [isVerifying, timer]);

  const handleSendOTP = (type) => {
    if (type === 'phone' && !formData.phone) {
      setErrors({ ...errors, phone: "Enter phone number first" });
      return;
    }
    setVerificationType(type);
    setIsVerifying(true);
    setTimer(30);
    setVerificationError(false);
    setOtp(['', '', '', '', '', '']);
  };

  const handleVerifyOTP = () => {
    const enteredOtp = otp.join('');
    if (enteredOtp === '123456') {
      setIsVerified(true);
      setIsVerifying(false);
      setVerificationError(false);
    } else {
      setVerificationError(true);
      setOtp(['', '', '', '', '', '']);
      // Trigger shake animation (handled by framer motion)
      setTimeout(() => setVerificationError(false), 500);
    }
  };

  const handleOtpChange = (index, value) => {
    if (isNaN(value)) return;
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Focus next
    if (value && index < 5) {
      otpRefs.current[index + 1].focus();
    }
  };

  const validateStep = (s) => {
    const newErrors = {};
    if (s === 1) {
      if (!formData.name.trim()) newErrors.name = "Full Name is required";
      if (!formData.gender) newErrors.gender = "Gender is required";
      if (!formData.dob) newErrors.dob = "Date of Birth is required";
      if (!formData.phone) newErrors.phone = "Phone number is required";
      if (!isVerified) newErrors.phone = "Please verify your phone number first";
    } else if (s === 2) {
      if (!formData.college) newErrors.college = "College is required";
      if (!formData.department) newErrors.department = "Department is required";
      if (formData.role === 'student' && !formData.semester) newErrors.semester = "Semester is required";
      if (!formData.admissionYear) newErrors.admissionYear = "Admission Year is required";
      if (!formData.rollNo) newErrors.rollNo = "Roll Number is required";
    } else if (s === 3) {
      const passIssues = getPasswordIssues(formData.password);
      if (passIssues.length > 0) newErrors.password = "Password does not meet requirements";
      if (formData.password !== formData.confirmPassword) newErrors.confirmPassword = "Passwords do not match";
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const getPasswordIssues = (pass) => {
    const issues = [];
    if (pass.length < 8) issues.push("length");
    if (!/[A-Z]/.test(pass)) issues.push("uppercase");
    if (!/[0-9]/.test(pass)) issues.push("number");
    if (!/[@#$%!]/.test(pass)) issues.push("special");
    return issues;
  };

  const handleNext = () => {
    if (validateStep(step)) {
      setStep(step + 1);
    }
  };

  const handleBack = () => {
    setStep(step - 1);
  };

  const handleRegister = (e) => {
    e.preventDefault();
    if (validateStep(3)) {
      const newUser = {
        id: Date.now().toString(),
        name: formData.name,
        email: generatedEmail.toLowerCase().trim(), // FIX 3 - Save correctly
        password: formData.password,
        role: formData.role,
        department: formData.department,
        semester: formData.role === 'student' ? parseInt(formData.semester) : undefined,
        gender: formData.gender,
        phone: formData.phone,
        admissionYear: formData.admissionYear,
        rollNo: paddedRollNo,
        usn: generatedUSN, // Note: lowercase key as requested in FIX 1 snippet, but USN was capitalized in previous schema. I'll use lowercase for consistency with prompt.
        college: formData.college,
        language: 'English',
        profilePhoto: null,
        isDeleted: false,
        createdAt: new Date().toISOString(),
        
        // Elective selections
        openElectiveSelected: null,
        deptElectiveTheory: null,
        deptElectiveLab: null,
        
        // Settings
        settings: {
          emailNotifications: true,
          smsNotifications: false,
          deadlineReminders: true,
          selectionAlerts: false,
          darkMode: false,
          language: 'English',
          twoFactorAuth: false,
          showProfileToClassmates: true,
          shareSelectionData: false
        },
        
        // Notifications
        notifications: [
          {
            id: 1,
            title: "Welcome to ElectiSelect!",
            message: "Your account has been created successfully.",
            time: new Date().toISOString(),
            read: false,
            type: "success"
          }
        ]
      };
      
      const users = JSON.parse(localStorage.getItem('es_users') || '[]');
      users.push(newUser);
      localStorage.setItem('es_users', JSON.stringify(users));

      // FIX 1 & 6 - Set completion states
      setRegisteredUser(newUser);
      setRegistrationComplete(true);
      
      confetti({
        particleCount: 150,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#3B82F6', '#10B981', '#F59E0B']
      });

      // Auto-redirect handling
      const timer = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
             clearInterval(timer);
             navigate('/login');
             return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
  };

  useEffect(() => {
    let timer;
    if (isSubmitted && countdown > 0) {
      timer = setInterval(() => {
        setCountdown((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [isSubmitted, countdown]);

  const renderStepIcon = (s) => {
    if (step > s) return <CheckCircle2 size={16} className="text-green-500" />;
    return <span className={`text-xs font-bold ${step === s ? 'text-primary' : 'text-gray-400'}`}>{s}</span>;
  };

  if (registrationComplete) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 flex items-center justify-center p-4">
        <motion.div 
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-white rounded-[32px] shadow-2xl border border-blue-100 w-full max-w-[500px] p-10 text-center relative overflow-hidden"
        >
          <div className="absolute top-0 left-0 w-full h-2 bg-green-500"></div>
          <div className="mb-6 flex justify-center">
            <motion.div 
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
              className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center text-green-500 shadow-sm"
            >
              <CheckCircle size={48} />
            </motion.div>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Registration Successful! 🎉</h1>
          <p className="text-gray-500 font-medium mb-8">"Welcome to ElectiSelect, {registeredUser.name}!"</p>
          
          <div className="bg-gray-50 rounded-2xl p-6 mb-8 text-left space-y-4 border border-gray-100 group relative">
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <p className="text-[10px] uppercase font-bold text-gray-400 tracking-wider mb-1">Your Login Email</p>
                <div className="flex bg-white p-3 border border-gray-200 rounded-xl items-center justify-between group-hover:border-primary transition-all">
                  <p className="text-sm font-black text-primary truncate mr-2">{registeredUser.email}</p>
                  <button 
                    onClick={() => {
                      navigator.clipboard.writeText(registeredUser.email);
                      // Could add a tiny "Copied!" toast here
                    }}
                    className="p-1.5 hover:bg-blue-50 rounded-lg text-primary transition-colors cursor-pointer"
                  >
                    <Mail size={16} />
                  </button>
                </div>
              </div>
              <div>
                <p className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">Your USN</p>
                <p className="text-sm font-bold text-gray-800">{registeredUser.usn}</p>
              </div>
              <div>
                <p className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">Department</p>
                <p className="text-sm font-bold text-gray-800">{registeredUser.department}</p>
              </div>
              <div>
                <p className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">Semester</p>
                <p className="text-sm font-bold text-gray-800">{registeredUser.semester}</p>
              </div>
              <div>
                <p className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">Password</p>
                <p className="text-sm font-bold text-gray-800">••••••••</p>
              </div>
            </div>
            
            <div className="pt-4 border-t border-gray-200">
              <p className="text-[11px] text-gray-500 font-bold flex items-center">
                <Mail size={14} className="mr-2 text-primary" />
                Save this email to login next time!
              </p>
            </div>
          </div>

          <button 
            onClick={() => navigate('/login')}
            className="w-full bg-primary hover:bg-blue-700 text-white font-bold py-4 rounded-2xl shadow-lg shadow-primary/20 transition-all flex items-center justify-center group"
          >
            Go to Login <ArrowRight size={18} className="ml-2 group-hover:translate-x-1 transition-transform" />
          </button>
          
          <p className="mt-6 text-sm text-gray-400 font-medium">Auto redirecting in <span className="text-primary font-bold">{countdown}s</span>...</p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 flex items-center justify-center p-4 selection:bg-primary/20">
      <div className="bg-white rounded-[32px] shadow-2xl border border-gray-100 w-full max-w-[480px] p-8 sm:p-10 transition-all duration-500 overflow-hidden relative">
        
        {/* Verification Overlay */}
        <AnimatePresence>
          {isVerifying && (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              className="absolute inset-0 z-50 bg-white p-8 sm:p-10 flex flex-col items-center justify-center text-center"
            >
              <div className="mb-6 w-16 h-16 bg-blue-50 text-blue-500 rounded-2xl flex items-center justify-center shadow-inner">
                <ShieldCheck size={32} />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Verify Your {verificationType === 'phone' ? 'Phone Number' : 'Email'}</h2>
              <p className="text-sm text-gray-500 mb-8 font-medium">
                {verificationType === 'phone' 
                  ? `OTP sent to +91 ${formData.phone.slice(0, 2)}XXXXXX${formData.phone.slice(-2)}`
                  : `OTP sent to ${generatedEmail || 'your college email'}`}
              </p>

              <motion.div 
                animate={verificationError ? { x: [-10, 10, -10, 10, 0] } : {}}
                className="flex justify-between gap-2 mb-8"
              >
                {otp.map((digit, idx) => (
                  <input 
                    key={idx}
                    ref={el => otpRefs.current[idx] = el}
                    type="text"
                    maxLength="1"
                    value={digit}
                    onChange={(e) => handleOtpChange(idx, e.target.value)}
                    className={`w-10 h-12 bg-gray-50 border-2 rounded-xl text-center text-lg font-bold outline-none transition-all ${verificationError ? 'border-red-500 bg-red-50 text-red-600' : 'border-gray-100 focus:border-primary focus:bg-white focus:shadow-lg focus:shadow-primary/10'}`}
                  />
                ))}
              </motion.div>

              {verificationError && (
                <p className="text-red-500 text-xs font-bold mb-4 animate-bounce"> Incorrect OTP. Please try again</p>
              )}

              <button 
                onClick={handleVerifyOTP}
                className="w-full bg-primary hover:bg-blue-700 text-white font-bold py-3.5 rounded-2xl mb-4 shadow-lg shadow-primary/20 transition-all font-sans"
              >
                Verify OTP
              </button>

              <div className="space-y-3">
                <div className="text-xs font-bold uppercase tracking-wider">
                  {timer > 0 ? (
                    <span className="text-gray-400">Resend OTP in <span className="text-primary">{timer}s</span></span>
                  ) : (
                    <button onClick={() => handleSendOTP(verificationType)} className="text-primary hover:underline">Resend OTP</button>
                  )}
                </div>
                <button onClick={() => setIsVerifying(false)} className="text-xs font-bold text-gray-400 hover:text-gray-600 outline-none uppercase tracking-widest block mx-auto">Change {verificationType === 'phone' ? 'Number' : 'Email'}</button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Header */}
        <div className="mb-10 text-center flex flex-col items-center">
          <img src={logo} alt="ElectiSelect Logo" className="w-14 h-14 rounded-2xl mb-4 shadow-md" />
          <h2 className="text-[11px] font-bold text-primary tracking-[0.25em] uppercase mb-1.5">ElectiSelect</h2>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Create your account</h1>
        </div>

        {/* Progress Bar */}
        <div className="mb-10 px-4">
          <div className="flex justify-between items-center relative">
            <div className="absolute top-1/2 left-0 w-full h-0.5 bg-gray-100 -translate-y-1/2 z-0"></div>
            <div className="absolute top-1/2 left-0 h-0.5 bg-primary -translate-y-1/2 z-0 transition-all duration-500" style={{ width: `${(step - 1) * 50}%` }}></div>
            {[1, 2, 3].map((s) => (
              <div key={s} className="relative z-10 flex flex-col items-center">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 transition-all duration-300 ${step >= s ? 'bg-white border-primary shadow-sm' : 'bg-white border-gray-200'}`}>
                  {renderStepIcon(s)}
                </div>
                <span className={`text-[10px] font-bold uppercase tracking-wider mt-2 ${step >= s ? 'text-primary' : 'text-gray-400'}`}>
                  {s === 1 ? 'Personal' : s === 2 ? 'Academic' : 'Account'}
                </span>
              </div>
            ))}
          </div>
        </div>

        <form onSubmit={handleRegister} className="space-y-6">
          <AnimatePresence mode="wait">
            {step === 1 && (
              <motion.div key="step1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-4">
                <div>
                  <label className="block text-[12px] font-bold text-gray-500 uppercase tracking-widest mb-2 flex items-center"><User size={14} className="mr-2 text-primary" /> Full Name</label>
                  <input type="text" placeholder="Enter full name" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} className={`w-full p-3.5 bg-gray-50 border rounded-2xl focus:bg-white focus:ring-4 focus:ring-primary/10 outline-none transition-all text-sm font-medium ${errors.name ? 'border-red-500' : 'border-gray-200 focus:border-primary'}`} />
                  {errors.name && <p className="text-red-500 text-[11px] mt-1.5 font-bold">{errors.name}</p>}
                </div>

                <div>
                  <label className="block text-[12px] font-bold text-gray-500 uppercase tracking-widest mb-2">Gender</label>
                  <div className="grid grid-cols-3 gap-3">
                    {['Male', 'Female', 'Other'].map((g) => (
                      <label key={g} className={`flex items-center justify-center p-3 rounded-2xl border-2 cursor-pointer transition-all ${formData.gender === g ? 'border-primary bg-blue-50 text-primary font-bold' : 'border-gray-100 bg-white text-gray-500 hover:border-gray-200'}`}>
                        <input type="radio" name="gender" className="hidden" value={g} checked={formData.gender === g} onChange={(e) => setFormData({...formData, gender: e.target.value})} />
                        <span className="text-sm">{g}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[12px] font-bold text-gray-500 uppercase tracking-widest mb-2 flex items-center"><Calendar size={14} className="mr-2 text-primary" /> Date of Birth</label>
                    <input type="date" value={formData.dob} onChange={(e) => setFormData({...formData, dob: e.target.value})} className={`w-full p-3.5 bg-gray-50 border rounded-2xl focus:bg-white focus:ring-4 focus:ring-primary/10 outline-none transition-all text-sm font-medium ${errors.dob ? 'border-red-500' : 'border-gray-200 focus:border-primary'}`} />
                  </div>
                  <div>
                    <label className="block text-[12px] font-bold text-gray-500 uppercase tracking-widest mb-2 flex items-center justify-between">
                      <span className="flex items-center"><Phone size={14} className="mr-2 text-primary" /> Phone</span>
                      {isVerified && <span className="text-green-500 flex items-center text-[10px] font-bold">Verified <Check size={12} className="ml-1"/></span>}
                    </label>
                    <div className="relative group">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm font-bold text-gray-400">+91</span>
                      <input 
                        type="tel" 
                        disabled={isVerified}
                        placeholder="0000000000" 
                        value={formData.phone} 
                        onChange={(e) => setFormData({...formData, phone: e.target.value.replace(/\D/g, '').slice(0, 10)})} 
                        className={`w-full pl-12 pr-24 p-3.5 bg-gray-50 border rounded-2xl focus:bg-white focus:ring-4 focus:ring-primary/10 transition-all text-sm font-medium ${isVerified ? 'border-green-500 bg-green-50/10 text-gray-500' : errors.phone ? 'border-red-500' : 'border-gray-200 focus:border-primary'}`} 
                      />
                      {!isVerified && formData.phone.length === 10 && (
                        <button 
                          type="button"
                          onClick={() => handleSendOTP('phone')}
                          className="absolute right-2 top-1/2 -translate-y-1/2 bg-primary text-white text-[10px] font-black px-3 py-2 rounded-xl"
                        >
                          SEND OTP
                        </button>
                      )}
                    </div>
                  </div>
                </div>
                {!isVerified && (
                  <button type="button" onClick={() => handleSendOTP('email')} className="w-full text-center text-xs font-bold text-primary hover:underline mt-2">Verify via Email instead</button>
                )}
                {errors.phone && <p className="text-red-500 text-[11px] mt-1.5 font-bold">{errors.phone}</p>}
              </motion.div>
            )}

            {step === 2 && (
              <motion.div key="step2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-4">
                <div>
                  <label className="block text-[12px] font-bold text-gray-500 uppercase tracking-widest mb-2 flex items-center"><Building2 size={14} className="mr-2 text-primary" /> College</label>
                  <select value={formData.college} onChange={(e) => setFormData({...formData, college: e.target.value})} className="w-full p-3.5 bg-gray-50 border border-gray-200 rounded-2xl focus:bg-white outline-none text-sm font-bold text-gray-700">
                    <option value="Dayananda Sagar College of Engineering">Dayananda Sagar College of Engineering</option>
                  </select>
                </div>
                <div className="flex items-center justify-between p-4 bg-blue-50 rounded-2xl border border-blue-100 mb-4">
                   <div className="flex items-center"><GraduationCap size={20} className="text-primary mr-3" /><div><p className="text-xs font-bold text-primary uppercase tracking-wider">Are you a Student?</p><p className="text-[11px] text-gray-500">Toggle for Student/Staff</p></div></div>
                   <button type="button" onClick={() => setFormData({...formData, role: formData.role === 'student' ? 'staff' : 'student'})} className={`w-12 h-6 rounded-full relative transition-colors duration-300 ${formData.role === 'student' ? 'bg-primary' : 'bg-gray-300'}`}><div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all duration-300 ${formData.role === 'student' ? 'left-7' : 'left-1'}`}></div></button>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[12px] font-bold text-gray-500 uppercase tracking-widest mb-2">Department</label>
                    <select value={formData.department} onChange={(e) => setFormData({...formData, department: e.target.value})} className={`w-full p-3.5 bg-gray-50 border rounded-2xl focus:bg-white outline-none text-sm font-medium ${errors.department ? 'border-red-500' : 'border-gray-200 focus:border-primary'}`}>
                      <option value="">Select Dept</option>
                      {Object.keys(branchCodes).map(dept => <option key={dept} value={dept}>{dept}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-[12px] font-bold text-gray-500 uppercase tracking-widest mb-2">Semester</label>
                    <select disabled={formData.role !== 'student'} value={formData.semester} onChange={(e) => setFormData({...formData, semester: e.target.value})} className={`w-full p-3.5 bg-gray-50 border rounded-2xl focus:bg-white outline-none text-sm font-medium ${formData.role !== 'student' ? 'opacity-50' : 'border-gray-200 focus:border-primary'}`}>
                      <option value="">Select Sem</option>
                      {[1,2,3,4,5,6,7,8].map(s => <option key={s} value={s}>Sem {s}</option>)}
                    </select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                   <div><label className="block text-[12px] font-bold text-gray-500 uppercase tracking-widest mb-2">Admission Year</label><select value={formData.admissionYear} onChange={(e) => setFormData({...formData, admissionYear: e.target.value})} className="w-full p-3.5 bg-gray-50 border border-gray-200 rounded-2xl outline-none text-sm font-medium"><option value="">Year</option>{['2023', '2024', '2025', '2026'].map(y => <option key={y} value={y}>{y}</option>)}</select></div>
                   <div><label className="block text-[12px] font-bold text-gray-500 uppercase tracking-widest mb-2">Roll No</label><input type="text" maxLength="3" placeholder="001" value={formData.rollNo} onChange={(e) => setFormData({...formData, rollNo: e.target.value.replace(/\D/g, '')})} className="w-full p-3.5 bg-gray-50 border border-gray-200 rounded-2xl text-sm font-medium" /></div>
                </div>
                {generatedUSN && <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} className="p-4 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200"><p className="text-[10px] font-extrabold text-gray-400 tracking-widest uppercase mb-1">Generated USN</p><p className="text-xl font-black text-gray-800">{generatedUSN}</p></motion.div>}
              </motion.div>
            )}

            {step === 3 && (
              <motion.div key="step3" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-4">
                <div>
                  <label className="block text-[12px] font-bold text-gray-500 uppercase tracking-widest mb-2">College Email</label>
                  <input type="text" readOnly value={generatedEmail} className="w-full p-3.5 bg-gray-100 border border-gray-200 rounded-2xl text-sm font-bold text-gray-500" />
                </div>
                <div>
                  <label className="block text-[12px] font-bold text-gray-500 uppercase tracking-widest mb-2">Password</label>
                  <input type="password" placeholder="••••••••" value={formData.password} onChange={(e) => setFormData({...formData, password: e.target.value})} className={`w-full p-3.5 bg-gray-50 border rounded-2xl focus:bg-white focus:ring-4 focus:ring-primary/10 outline-none transition-all text-sm font-medium ${errors.password ? 'border-red-500' : 'border-gray-200 focus:border-primary'}`} />
                  {/* Checklist */}
                  <div className="mt-4 grid grid-cols-2 gap-y-2.5 gap-x-4 p-4 bg-gray-50 rounded-2xl border border-gray-100">
                    {[
                      { id: 'length', text: '8+ Characters' },
                      { id: 'uppercase', text: 'Uppercase Letter' },
                      { id: 'number', text: 'Number' },
                      { id: 'special', text: 'Special Character (@#$%!)' }
                    ].map((req) => {
                      const isMet = !getPasswordIssues(formData.password).includes(req.id);
                      return (
                        <div key={req.id} className="flex items-center">
                          <div className={`w-4 h-4 rounded-full flex items-center justify-center mr-2 transition-colors ${isMet ? 'bg-green-100 text-green-600' : 'bg-gray-200 text-gray-400'}`}>
                            {isMet ? <Check size={10} strokeWidth={4} /> : <X size={10} strokeWidth={4} />}
                          </div>
                          <span className={`text-[10px] font-bold uppercase tracking-tight ${isMet ? 'text-green-600' : 'text-gray-400'}`}>{req.text}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
                <div>
                  <label className="block text-[12px] font-bold text-gray-500 uppercase tracking-widest mb-2">Confirm Password</label>
                  <input type="password" placeholder="••••••••" value={formData.confirmPassword} onChange={(e) => setFormData({...formData, confirmPassword: e.target.value})} className={`w-full p-3.5 bg-gray-50 border rounded-2xl focus:bg-white transition-all text-sm font-medium ${errors.confirmPassword ? 'border-red-500' : 'border-gray-200 focus:border-primary'}`} />
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="pt-6 flex gap-3">
            {step > 1 && <button type="button" onClick={handleBack} className="flex-1 border-2 border-gray-100 text-gray-500 font-bold py-3.5 rounded-2xl flex items-center justify-center"><ChevronLeft size={18} className="mr-1" /> Back</button>}
            <button type="button" onClick={step < 3 ? handleNext : handleRegister} className="flex-[2] bg-primary hover:bg-blue-700 text-white font-bold py-3.5 rounded-2xl shadow-lg transition-all flex items-center justify-center group">{step < 3 ? 'Continue' : 'Complete Registration'}{step < 3 && <ChevronRight size={18} className="ml-1 group-hover:translate-x-1" />}</button>
          </div>
        </form>
        <div className="mt-8 text-center text-[13px] text-gray-500 font-medium">Already have an account? <Link to="/login" className="text-primary font-bold hover:underline">Sign In</Link></div>
      </div>
    </div>
  );
};

export default Register;
