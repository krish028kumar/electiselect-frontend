import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { mockUsers } from '../data/mockData';
import { Mail, Lock, ArrowRight, CheckCircle2, AlertCircle, ShieldAlert } from 'lucide-react';
import logo from '../logo.png';
import ForgotPasswordModal from '../components/ForgotPasswordModal';
import GoogleAuthModal from '../components/GoogleAuthModal';
import { motion, AnimatePresence } from 'framer-motion';

const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showDebug, setShowDebug] = useState(false); // Debug toggle
  const [isForgotModalOpen, setForgotModalOpen] = useState(false);
  const [isGoogleModalOpen, setGoogleModalOpen] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [userData, setUserData] = useState(null);

  // Security States
  const [failedAttempts, setFailedAttempts] = useState(0);
  const [lockCountdown, setLockCountdown] = useState(30);
  const [isLocked, setIsLocked] = useState(false);
  const [passwordError, setPasswordError] = useState('');
  const [shake, setShake] = useState(false);

  useEffect(() => {
    let timer;
    if (isLocked && lockCountdown > 0) {
      timer = setInterval(() => {
        setLockCountdown((prev) => prev - 1);
      }, 1000);
    } else if (lockCountdown === 0) {
      setIsLocked(false);
      setFailedAttempts(0);
      setLockCountdown(30);
    }
    return () => clearInterval(timer);
  }, [isLocked, lockCountdown]);

  const handleEmailLogin = (e) => {
    e.preventDefault();
    if (isLocked) return;

    const allUsers = JSON.parse(localStorage.getItem('es_users') || '[]');
    
    console.log('=== LOGIN DEBUG ===');
    console.log('Entered email:', email);
    console.log('Entered password:', password);
    console.log('Total users stored:', allUsers.length);
    console.log('All stored emails:', allUsers.map(u => u.email));
    
    const foundUser = allUsers.find(u => 
      u.email.toLowerCase().trim() === email.toLowerCase().trim() && 
      u.password.trim() === password.trim() &&
      !u.isDeleted
    );
    
    console.log('Matched user:', foundUser);
    
    if (!foundUser) {
      // Show stored users for debugging
      console.log('Stored users detail:', 
        allUsers.map(u => ({
          email: u.email,
          password: u.password,
          role: u.role
        }))
      );
    }

    if (foundUser) {
      // Save session - standardizing on 'currentUser' as requested
      localStorage.setItem('currentUser', JSON.stringify(foundUser));
      sessionStorage.setItem('es_session', JSON.stringify(foundUser));

      // Update AuthContext state
      login(foundUser);

      // Success Path
      setPasswordError('');
      setFailedAttempts(0);
      setUserData(foundUser);
      setIsSuccess(true);

      // Role-based navigation - Redirect after 1.5 seconds as requested
      setTimeout(() => {
        if (foundUser.role === 'student') navigate('/dashboard');
        else if (foundUser.role === 'staff') navigate('/open-elective/admin');
        else if (foundUser.role === 'superadmin') navigate('/super-admin');
        else navigate('/dashboard');
      }, 1500);
    } else {
      setShake(true);
      setPassword('');
      
      const newAttempts = failedAttempts + 1;
      setFailedAttempts(newAttempts);
      setPasswordError("❌ Invalid email or password. Please check and try again.");
      if (newAttempts >= 3) {
        setIsLocked(true);
      }
      
      setTimeout(() => setShake(false), 500);
    }
  };

  const getWelcomeEmoji = (gender) => {
    const g = gender?.toLowerCase();
    if (g === 'male') return '👦';
    if (g === 'female') return '👧';
    return '👋';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 flex flex-col items-center justify-center p-4 selection:bg-primary/20 font-sans relative overflow-hidden">
      
      {/* Success Overlay */}
      <AnimatePresence>
        {isSuccess && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-white/80 backdrop-blur-md flex items-center justify-center p-4"
          >
            <motion.div 
              initial={{ scale: 0.9, y: 20, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              className="bg-white rounded-[32px] shadow-[0_20px_60px_-15px_rgba(0,0,0,0.1)] border border-gray-100 w-full max-w-[400px] p-10 text-center"
            >
              <div className="mb-6 flex justify-center">
                <motion.div 
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', stiffness: 200, delay: 0.1 }}
                  className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center text-primary shadow-inner relative"
                >
                  <CheckCircle2 size={48} />
                  {/* Subtle Loading Ring */}
                  <motion.div 
                    animate={{ rotate: 360 }}
                    transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                    className="absolute inset-0 border-2 border-primary border-t-transparent rounded-full"
                  />
                </motion.div>
              </div>

              <h2 className="text-2xl font-black text-gray-900 mb-1 tracking-tight">
                Welcome back, {userData?.name} 👋
              </h2>
              <p className="text-gray-500 font-medium mb-6">
                You've successfully authenticated via <span className="text-primary font-bold">SecurePort</span>
              </p>

              <div className="flex justify-center mb-8">
                <span className={`px-4 py-1.5 rounded-full text-[11px] font-bold uppercase tracking-widest border shadow-sm ${
                  userData?.role === 'superadmin' ? 'bg-purple-50 text-purple-600 border-purple-100' :
                  userData?.role === 'staff' ? 'bg-orange-50 text-orange-600 border-orange-100' :
                  'bg-blue-50 text-blue-600 border-blue-100'
                }`}>
                  {userData?.role === 'superadmin' ? 'System Administrator' : userData?.role}
                </span>
              </div>

              <div className="space-y-3">
                <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: '100%' }}
                    transition={{ duration: 1.5, ease: "easeInOut" }}
                    className="h-full bg-primary"
                  ></motion.div>
                </div>
                <p className="text-[11px] text-gray-400 font-bold uppercase tracking-widest animate-pulse">
                  Initializing your workspace...
                </p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="bg-white rounded-[32px] shadow-2xl w-full max-w-[420px] p-8 sm:p-10 animate-in fade-in zoom-in-[0.98] duration-500 border border-white relative">
        
        {/* Top Section */}
        <div className="mb-10 text-center flex flex-col items-center">
          <img src={logo} alt="ElectiSelect Logo" className="w-16 h-16 rounded-2xl mb-5 shadow-lg border border-gray-50" />
          <h1 className="text-3xl font-black text-primary tracking-tight mb-2">ElectiSelect</h1>
          <h2 className="text-[11px] font-bold text-gray-400 tracking-[0.3em] uppercase mb-4">The Academic Curator</h2>
          <p className="text-gray-500 text-[14px] font-medium leading-relaxed">Smart Elective Selection<br/>for Smart Students</p>
        </div>

        {/* Form Section */}
        <form onSubmit={handleEmailLogin} className="space-y-5">
          <div>
            <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-widest mb-2 ml-1">Email Address</label>
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400 group-focus-within:text-primary transition-colors">
                <Mail size={18} />
              </div>
              <input 
                type="email"
                placeholder="1ds24is001@dsce.edu.in"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={isLocked}
                className={`w-full pl-12 p-4 bg-gray-50 border border-gray-100 rounded-2xl focus:bg-white focus:ring-4 focus:ring-primary/10 focus:border-primary outline-none transition-all text-[15px] font-medium placeholder:text-gray-300 ${isLocked ? 'opacity-50 cursor-not-allowed' : ''}`}
              />
            </div>
            {/* FIX 5 - LOGIN PAGE HINT */}
            <p className="mt-2 text-[11px] font-bold text-gray-400 ml-1">
              Hint: Your email is <span className="text-primary italic">usn@dsce.edu.in</span> (e.g. 1ds24is001@dsce.edu.in)
            </p>
          </div>

          <div>
            <div className="flex justify-between items-center mb-2 ml-1 pr-1">
              <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-widest">Password</label>
              <button 
                type="button" 
                onClick={() => setForgotModalOpen(true)} 
                className={`text-[11px] font-bold transition-colors outline-none cursor-pointer uppercase tracking-tight ${isLocked ? 'text-primary font-black scale-110' : 'text-primary hover:text-blue-700'}`}
              >
                Forgot?
              </button>
            </div>
            <motion.div 
              animate={shake ? { x: [-4, 4, -4, 4, 0] } : {}}
              className="relative group">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400 group-focus-within:text-primary transition-colors">
                <Lock size={18} />
              </div>
              <input 
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={isLocked}
                className={`w-full pl-12 p-4 bg-gray-50 border rounded-2xl focus:bg-white focus:ring-4 focus:ring-primary/10 transition-all text-[15px] font-medium ${passwordError ? 'border-red-500' : 'border-gray-100 focus:border-primary'} ${isLocked ? 'bg-gray-100 cursor-not-allowed border-gray-200' : ''}`}
              />
            </motion.div>
            
            {passwordError && !isLocked && (
               <motion.div 
                 initial={{ opacity: 0, y: -10 }}
                 animate={{ opacity: 1, y: 0 }}
                 className="flex items-center mt-2 px-1 text-red-500"
               >
                 <AlertCircle size={14} className="mr-1.5" />
                 <p className="text-[11px] font-bold">{passwordError}</p>
               </motion.div>
            )}

            {isLocked && (
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="mt-3 p-4 bg-red-50 border border-red-100 rounded-xl text-center shadow-sm"
              >
                 <p className="text-[10px] font-extrabold text-red-600 uppercase tracking-wider mb-1">Too many failed attempts</p>
                 <p className="text-[13px] font-bold text-red-700">Account temporarily locked.</p>
                 <p className="text-[11px] font-bold text-red-400 mt-2 italic flex items-center justify-center">
                   <Loader2 size={10} className="mr-1.5 animate-spin" />
                   Try again in <span className="text-red-600 ml-1">{lockCountdown}s</span>
                 </p>
              </motion.div>
            )}
          </div>

          <div className="pt-4">
            <button 
              type="submit"
              disabled={isLocked}
              className={`w-full bg-primary hover:bg-blue-700 text-white font-bold py-4 px-6 rounded-2xl shadow-xl shadow-primary/20 transition-all hover:-translate-y-1 active:translate-y-0 flex items-center justify-center group ${isLocked ? 'opacity-50 cursor-not-allowed grayscale' : ''}`}
            >
              {isLocked ? `Locked (${lockCountdown}s)` : 'Sign In'}
              {!isLocked && <ArrowRight size={20} className="ml-2 group-hover:translate-x-1.5 transition-transform" />}
            </button>
          </div>
        </form>

        {/* OR Divider */}
        <div className="flex items-center my-8">
          <div className="flex-1 border-t border-gray-100"></div>
          <span className="px-5 text-[10px] tracking-widest text-gray-300 font-black text-center uppercase">Or</span>
          <div className="flex-1 border-t border-gray-100"></div>
        </div>

        {/* Continue with Google */}
        <button 
          type="button"
          disabled={isLocked}
          onClick={() => setGoogleModalOpen(true)}
          className={`w-full bg-white border border-gray-100 hover:bg-gray-50 hover:border-gray-200 text-gray-700 font-bold py-4 px-6 rounded-2xl shadow-sm transition-all flex items-center justify-center outline-none hover:-translate-y-0.5 mb-8 ${isLocked ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          <img src="https://cdn-icons-png.flaticon.com/512/2991/2991148.png" alt="Google" className="w-[20px] h-[20px] mr-3" />
          Continue with Google
        </button>

        {/* Bottom Section */}
        <div className="text-center">
           <p className="text-[14px] text-gray-500 font-medium mb-6">
             Don't have an account? <Link to="/register" className="text-primary font-black hover:text-blue-700 hover:underline transition-all underline-offset-4">Register here</Link>
           </p>
           <p className="text-[10px] text-gray-400 font-bold tracking-[0.2em] uppercase bg-gray-50 py-2 rounded-lg">Only college email IDs are allowed</p>
        </div>

        {/* Temporary Debug Button */}
        <div className="mt-8 pt-4 border-t border-dashed border-gray-100">
           <button 
             type="button" 
             onClick={() => setShowDebug(!showDebug)} 
             className="w-full py-2 text-[10px] font-black text-gray-400 uppercase tracking-widest hover:text-primary transition-colors"
           >
             {showDebug ? 'Hide Debug Info' : 'Show Debug Info (Temporary)'}
           </button>
           
           {showDebug && (
             <motion.div 
               initial={{ opacity: 0, height: 0 }}
               animate={{ opacity: 1, height: 'auto' }}
               className="mt-4 p-4 bg-gray-50 rounded-xl max-h-[150px] overflow-y-auto text-left border border-gray-100"
             >
               <p className="text-[10px] font-black text-gray-900 border-b border-gray-200 pb-2 mb-2 uppercase tracking-tight">Registered Users ({JSON.parse(localStorage.getItem('es_users') || '[]').length})</p>
               {JSON.parse(localStorage.getItem('es_users') || '[]').map((u, i) => (
                 <div key={i} className="mb-3 last:mb-0">
                    <p className="text-[11px] font-bold text-gray-800 break-all">{u.email}</p>
                    <p className="text-[9px] font-medium text-gray-400">Pass: {u.password} | Role: {u.role}</p>
                 </div>
               ))}
               {JSON.parse(localStorage.getItem('es_users') || '[]').length === 0 && (
                 <p className="text-[11px] text-gray-400 italic">No users found in localStorage.</p>
               )}
             </motion.div>
           )}
        </div>

      </div>

      {/* Footer */}
      <div className="mt-10 text-center text-[12px] text-gray-400 font-semibold space-x-6 flex items-center justify-center opacity-60 hover:opacity-100 transition-opacity">
        <a href="#" className="hover:text-primary transition-colors">Privacy Policy</a>
        <span className="text-gray-200">•</span>
        <a href="#" className="hover:text-primary transition-colors">Terms</a>
        <span className="text-gray-200">•</span>
        <a href="#" className="hover:text-primary transition-colors">Guidelines</a>
      </div>

    <ForgotPasswordModal isOpen={isForgotModalOpen} onClose={() => setForgotModalOpen(false)} />
    <GoogleAuthModal isOpen={isGoogleModalOpen} onClose={() => setGoogleModalOpen(false)} />

    </div>
  );
};

export default Login;
