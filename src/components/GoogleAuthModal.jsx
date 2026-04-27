import { useState, useEffect, useRef } from 'react';
import { X, UserPlus, Loader2, Mail, Lock, Eye, EyeOff, CheckCircle2, ChevronDown, UserCircle, ShieldCheck, ArrowLeft, Check } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { mockUsers } from '../data/mockData';
import { motion, AnimatePresence } from 'framer-motion';

const GoogleAuthModal = ({ isOpen, onClose }) => {
  const navigate = useNavigate();
  const { login } = useAuth();
  
  const [modalStep, setModalStep] = useState(1); // 1: Picker, 2: Password, 3: Verifying, 4: Another Account, 5: OTP, 6: Reset
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [attempts, setAttempts] = useState(0);
  const [error, setError] = useState('');
  const [shake, setShake] = useState(false);

  // OTP States
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [timer, setTimer] = useState(30);
  const otpRefs = useRef([]);
  const [verificationError, setVerificationError] = useState(false);

  const googleAccount = {
    name: "College Student",
    email: "student@dsce.edu.in",
    initial: "S"
  };

  useEffect(() => {
    if (!isOpen) {
      setModalStep(1);
      setPassword('');
      setEmail('');
      setAttempts(0);
      setError('');
    }
  }, [isOpen]);

  useEffect(() => {
    let interval;
    if (modalStep === 5 && timer > 0) {
      interval = setInterval(() => setTimer(prev => prev - 1), 1000);
    }
    return () => clearInterval(interval);
  }, [modalStep, timer]);

  const handleAccountSelect = () => {
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      setModalStep(2);
    }, 800);
  };

  const handlePasswordSubmit = (e) => {
    e.preventDefault();
    const loginEmail = modalStep === 2 ? googleAccount.email : email;
    const users = JSON.parse(localStorage.getItem('electiselect_users') || '[]');
    const foundUser = users.find(u => u.email === loginEmail);

    if (!foundUser) {
      setError("No account found with this email. Please register first.");
      setShake(true);
      setTimeout(() => setShake(false), 500);
      return;
    }

    if (foundUser.password === password) {
      if (foundUser.isDeleted) {
        setError("❌ This account has been permanently deleted.");
        setShake(true);
        setTimeout(() => setShake(false), 500);
        return;
      }
      
      setError('');
      setIsLoading(true);
      setModalStep(3);
      
      setTimeout(() => {
        setIsLoading(false);
        login(foundUser);
        onClose();
        navigate('/dashboard');
      }, 2000);
    } else {
      const newAttempts = attempts + 1;
      setAttempts(newAttempts);
      setShake(true);
      setPassword('');
      setError(newAttempts >= 3 ? "Too many attempts. Try again later or reset password" : "Incorrect password. Please try again.");
      setTimeout(() => setShake(false), 500);
    }
  };

  const handleOtpChange = (index, value) => {
    if (isNaN(value)) return;
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);
    if (value && index < 5) otpRefs.current[index + 1].focus();
  };

  const handleVerifyOtp = () => {
    if (otp.join('') === '123456') {
      setModalStep(6);
      setPassword('');
    } else {
      setVerificationError(true);
      setShake(true);
      setOtp(['', '', '', '', '', '']);
      setTimeout(() => {
        setVerificationError(false);
        setShake(false);
      }, 500);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/40 z-[100] flex items-center justify-center p-4 backdrop-blur-sm animate-in fade-in duration-200">
      <motion.div 
        initial={{ scale: 0.95, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        className="bg-white rounded-[28px] shadow-2xl border border-gray-100 w-full max-w-[420px] overflow-hidden flex flex-col min-h-[520px] relative transition-all duration-300"
      >
        
        {/* Header - Always Show X */}
        <button onClick={onClose} className="absolute top-4 right-4 p-2 hover:bg-gray-100 rounded-full transition-colors z-20 outline-none">
          <X size={20} className="text-gray-400" />
        </button>

        <AnimatePresence mode="wait">
          {modalStep === 1 && (
            <motion.div key="picker" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} className="p-8 flex flex-col flex-1">
              <div className="flex flex-col items-center text-center mt-2 mb-8">
                <img src="https://cdn-icons-png.flaticon.com/512/2991/2991148.png" alt="Google" className="w-10 h-10 mb-4" />
                <h2 className="text-[24px] font-medium tracking-tight text-gray-900 mb-1" style={{ fontFamily: "'Google Sans', Roboto, Arial, sans-serif" }}>Sign in</h2>
                <p className="text-[16px] text-gray-800 tracking-wide">Use your Google Account</p>
              </div>

              <div className="flex-1">
                {isLoading ? (
                  <div className="flex flex-col items-center justify-center py-10"><Loader2 className="w-8 h-8 text-blue-500 animate-spin" /></div>
                ) : (
                  <div className="space-y-1">
                    <div onClick={handleAccountSelect} className="flex items-center p-3.5 hover:bg-gray-50 cursor-pointer transition-all border-b border-gray-100 rounded-xl">
                      <div className="w-10 h-10 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-lg mr-4 shadow-sm">{googleAccount.initial}</div>
                      <div className="flex-1 overflow-hidden">
                        <p className="text-[14px] font-bold text-gray-900 leading-tight">{googleAccount.name}</p>
                        <p className="text-[12px] font-medium text-gray-500 truncate mt-0.5">{googleAccount.email}</p>
                      </div>
                      <ChevronDown size={16} className="text-gray-400" />
                    </div>
                    <div onClick={() => setModalStep(4)} className="flex items-center p-3.5 hover:bg-gray-50 cursor-pointer transition-all rounded-xl mt-1">
                      <div className="w-10 h-10 rounded-full bg-gray-100 text-gray-600 flex items-center justify-center mr-4"><UserPlus size={18} /></div>
                      <p className="text-[14px] font-bold text-gray-900">Use another account</p>
                    </div>
                  </div>
                )}
              </div>

              <div className="mt-auto pt-8">
                <p className="text-[12px] text-gray-500 leading-relaxed mb-6">To continue, Google will share your name, email address, language preference, and profile picture with ElectiSelect.</p>
                <div className="flex justify-between items-center text-[12px] font-bold text-gray-500"><div className="flex gap-4"><a href="#" className="hover:text-gray-800">Privacy Policy</a><a href="#" className="hover:text-gray-800">Terms</a></div></div>
              </div>
            </motion.div>
          )}

          {(modalStep === 2 || modalStep === 4) && (
            <motion.div key="password" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, scale: 0.95 }} className="p-8 flex flex-col flex-1">
              <button onClick={() => setModalStep(1)} className="p-2 w-fit -ml-2 mb-2 hover:bg-gray-100 rounded-full transition-colors"><ArrowLeft size={18} className="text-gray-600" /></button>
              <div className="flex flex-col items-center text-center mb-6">
                <img src="https://cdn-icons-png.flaticon.com/512/2991/2991148.png" alt="Google" className="w-8 h-8 mb-4" />
                {modalStep === 2 ? (
                  <>
                    <h2 className="text-[24px] font-medium tracking-tight text-gray-900 mb-2">Hi {googleAccount.name.split(' ')[0]} 👋</h2>
                    <div className="flex items-center gap-2 p-1 bg-white border border-gray-200 rounded-full pr-3 mb-6 shadow-sm">
                      <div className="w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-[10px]">{googleAccount.initial}</div>
                      <span className="text-[13px] font-bold text-gray-700">{googleAccount.email}</span>
                      <ChevronDown size={14} className="text-gray-400" />
                    </div>
                  </>
                ) : (
                  <>
                    <h2 className="text-[24px] font-medium tracking-tight text-gray-900 mb-2">Sign in</h2>
                    <p className="text-[15px] mb-6">Use your Google account</p>
                  </>
                )}
                <h3 className="text-[18px] font-bold text-gray-900 mt-2">Enter your password</h3>
              </div>

              <form onSubmit={handlePasswordSubmit} className="space-y-4">
                {modalStep === 4 && (
                  <div className="relative group">
                    <input 
                      type="email" 
                      placeholder="Email or phone" 
                      value={email} 
                      onChange={(e) => setEmail(e.target.value)} 
                      className="w-full p-4 bg-gray-50 border border-gray-200 rounded-2xl outline-none focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-100 transition-all text-[15px] font-medium" 
                    />
                  </div>
                )}
                <div className="relative group">
                  <motion.div animate={shake ? { x: [-4, 4, -4, 4, 0] } : {}} className={`relative flex items-center p-4 bg-gray-50 border rounded-2xl transition-all ${error ? 'border-red-500 bg-red-50' : 'border-gray-200 group-focus-within:border-blue-500 group-focus-within:bg-white group-focus-within:ring-4 group-focus-within:ring-blue-100'}`}>
                    <input type={showPassword ? "text" : "password"} placeholder="Enter your password" value={password} onChange={(e) => setPassword(e.target.value)} className="flex-1 bg-transparent border-none outline-none text-[15px] font-medium" />
                    <button type="button" onClick={() => setShowPassword(!showPassword)} className="p-1 text-gray-400 hover:text-gray-600 outline-none">{showPassword ? <EyeOff size={18} /> : <Eye size={18} />}</button>
                  </motion.div>
                  {error && <motion.p initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="text-red-500 text-[12px] font-bold mt-2 ml-1">{error}</motion.p>}
                </div>

                <div className="flex justify-between items-center pt-2">
                  <button type="button" onClick={() => setModalStep(5)} className="text-[14px] font-bold text-blue-600 hover:text-blue-700 hover:underline">Forgot password?</button>
                  <button type="submit" disabled={!password || (modalStep === 4 && !email)} className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-8 rounded-xl shadow-lg shadow-blue-500/20 transition-all disabled:opacity-50 min-w-[100px]">Next</button>
                </div>
              </form>
            </motion.div>
          )}

          {modalStep === 5 && (
            <motion.div key="otp" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 20 }} className="p-8 flex flex-col flex-1 items-center justify-center text-center">
              <div className="mb-6 w-16 h-16 bg-blue-50 text-blue-500 rounded-2xl flex items-center justify-center shadow-inner"><ShieldCheck size={32} /></div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Account Recovery</h2>
              <p className="text-sm text-gray-500 mb-8 font-medium">OTP sent to {modalStep === 4 ? email : googleAccount.email}</p>
              <motion.div animate={shake ? { x: [-10, 10, -10, 10, 0] } : {}} className="flex justify-between gap-2 mb-8">
                {otp.map((digit, idx) => (
                  <input key={idx} ref={el => otpRefs.current[idx] = el} type="text" maxLength="1" value={digit} onChange={(e) => handleOtpChange(idx, e.target.value)} className={`w-10 h-12 bg-gray-50 border-2 rounded-xl text-center text-lg font-bold outline-none transition-all ${verificationError ? 'border-red-500 bg-red-50 text-red-600' : 'border-gray-100 focus:border-primary focus:bg-white'}`} />
                ))}
              </motion.div>
              {verificationError && <p className="text-red-500 text-xs font-bold mb-4"> Incorrect OTP. Please try again</p>}
              <button onClick={handleVerifyOtp} className="w-full bg-blue-600 text-white font-bold py-3.5 rounded-2xl mb-4 shadow-lg shadow-blue-500/20">Verify OTP</button>
              <div className="text-xs font-bold uppercase tracking-wider">{timer > 0 ? <span className="text-gray-400">Resend in <span className="text-blue-600">{timer}s</span></span> : <button onClick={() => setTimer(30)} className="text-blue-600">Resend OTP</button>}</div>
            </motion.div>
          )}

          {modalStep === 6 && (
            <motion.div key="reset" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="p-8 flex flex-col flex-1">
              <h1 className="text-2xl font-bold text-gray-900 mb-2">Set New Password</h1>
              <p className="text-sm text-gray-500 mb-8">Choose a strong password for your account</p>
              <div className="space-y-4">
                <input type="password" placeholder="New Password" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full p-4 bg-gray-50 border border-gray-200 rounded-2xl outline-none focus:border-blue-500 focus:bg-white transition-all text-[15px] font-medium" />
                <button 
                  onClick={() => {
                    localStorage.setItem('user_password', password);
                    setIsLoading(true);
                    setModalStep(3);
                    setTimeout(() => {
                      setIsLoading(false);
                      onClose();
                      navigate('/login');
                    }, 1500);
                  }}
                  className="w-full bg-blue-600 text-white font-bold py-4 rounded-2xl shadow-lg mt-4"
                >
                  Save & Sign In
                </button>
              </div>
            </motion.div>
          )}

          {modalStep === 3 && (
            <motion.div key="verifying" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-12 flex flex-col items-center justify-center flex-1 text-center">
              <div className="mb-6 relative">
                 <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', stiffness: 200 }} className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center text-green-500 shadow-inner mb-6"><CheckCircle2 size={48} /></motion.div>
                 <div className="absolute inset-0 border-4 border-green-500 border-t-transparent rounded-full animate-spin"></div>
              </div>
              <h3 className="text-[22px] font-bold text-gray-900 mb-2">Verifying...</h3>
              <p className="text-[14px] text-gray-500 font-medium">Please wait while we set up your session</p>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
};

export default GoogleAuthModal;
