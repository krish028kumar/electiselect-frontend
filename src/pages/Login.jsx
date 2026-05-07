import { useState, useEffect } from 'react';
import { useNavigate, Link, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Mail, Lock, ArrowRight, AlertCircle } from 'lucide-react';
import logo from '../logo.png';
import ForgotPasswordModal from '../components/ForgotPasswordModal';
import { motion } from 'framer-motion';

const Login = () => {
  const { isLoggedIn } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isForgotModalOpen, setForgotModalOpen] = useState(false);

  // Security States
  const [passwordError, setPasswordError] = useState('');
  const [shake, setShake] = useState(false);

  // Auto-redirect if already logged in
  if (isLoggedIn) {
    return <Navigate to="/dashboard" replace />;
  }

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('error') === 'unauthorized_email') {
      setPasswordError("❌ Only @dsce.edu.in emails are permitted.");
      setShake(true);
      setTimeout(() => setShake(false), 500);
      // Clean URL
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, []);

  const handleEmailLogin = (e) => {
    e.preventDefault();
    setShake(true);
    setPasswordError("❌ Local login is disabled. Please use 'Continue with Google'.");
    setTimeout(() => setShake(false), 500);
  };

  const handleGoogleLogin = () => {
    window.location.href = "http://localhost:8080/oauth2/authorization/google";
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 flex flex-col items-center justify-center p-4 selection:bg-primary/20 font-sans relative overflow-hidden">
      
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
                className="w-full pl-12 p-4 bg-gray-50 border border-gray-100 rounded-2xl focus:bg-white focus:ring-4 focus:ring-primary/10 focus:border-primary outline-none transition-all text-[15px] font-medium placeholder:text-gray-300"
              />
            </div>
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
                className="text-[11px] font-bold transition-colors outline-none cursor-pointer uppercase tracking-tight text-primary hover:text-blue-700"
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
                className={`w-full pl-12 p-4 bg-gray-50 border rounded-2xl focus:bg-white focus:ring-4 focus:ring-primary/10 transition-all text-[15px] font-medium ${passwordError ? 'border-red-500' : 'border-gray-100 focus:border-primary'}`}
              />
            </motion.div>
            
            {passwordError && (
               <motion.div 
                 initial={{ opacity: 0, y: -10 }}
                 animate={{ opacity: 1, y: 0 }}
                 className="flex items-center mt-2 px-1 text-red-500"
               >
                 <AlertCircle size={14} className="mr-1.5" />
                 <p className="text-[11px] font-bold">{passwordError}</p>
               </motion.div>
            )}
          </div>

          <div className="pt-4">
            <button 
              type="submit"
              className="w-full bg-primary hover:bg-blue-700 text-white font-bold py-4 px-6 rounded-2xl shadow-xl shadow-primary/20 transition-all hover:-translate-y-1 active:translate-y-0 flex items-center justify-center group"
            >
              Sign In
              <ArrowRight size={20} className="ml-2 group-hover:translate-x-1.5 transition-transform" />
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
          onClick={handleGoogleLogin}
          className="w-full bg-white border border-gray-100 hover:bg-gray-50 hover:border-gray-200 text-gray-700 font-bold py-4 px-6 rounded-2xl shadow-sm transition-all flex items-center justify-center outline-none hover:-translate-y-0.5 mb-8"
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

    </div>
  );
};

export default Login;
