import { useState, useRef, useEffect } from 'react';
import { Mail, Phone, X, ArrowRight } from 'lucide-react';

const ForgotPasswordModal = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState('email'); // 'email', 'phone'
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [timer, setTimer] = useState(30);
  const [emailStatus, setEmailStatus] = useState('idle'); // 'idle', 'sent'
  const inputRefs = useRef([]);

  useEffect(() => {
    let interval;
    if (otpSent && timer > 0) {
      interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [otpSent, timer]);

  // Reset state when modal closes
  useEffect(() => {
    if (!isOpen) {
      setTimeout(() => {
        setOtpSent(false);
        setActiveTab('email');
        setOtp(['', '', '', '', '', '']);
        setTimer(30);
        setEmailStatus('idle');
      }, 300); // Wait for fade out
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSendResetLink = (e) => {
    e.preventDefault();
    setEmailStatus('sent');
  };

  const handleSendOtp = (e) => {
    e.preventDefault();
    setOtpSent(true);
    setTimer(30);
  };

  const handleOtpChange = (index, value) => {
    if (!/^\d*$/.test(value)) return; // Only allow digits
    if (value.length > 1) value = value.slice(-1);
    
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Auto focus next
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleOtpKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  return (
    <div className="fixed inset-0 bg-gray-900/40 z-50 flex items-center justify-center p-4 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl shadow-2xl border border-gray-100 w-full max-w-[400px] overflow-hidden animate-in zoom-in-95 slide-in-from-bottom-4 duration-300">
        
        {/* Header */}
        <div className="px-6 pt-6 pb-4 flex justify-between items-center border-b border-gray-100">
          <div>
            <h2 className="text-xl font-bold text-gray-900 tracking-tight">Reset Password</h2>
            <p className="text-xs text-gray-500 mt-1 font-medium">Choose an option to regain access</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors focus:ring-2 focus:ring-gray-200 outline-none">
            <X size={18} className="text-gray-500" />
          </button>
        </div>

        {/* Tab Selector */}
        {!otpSent ? (
          <div className="flex px-6 pt-5">
            <div className="flex bg-gray-100/80 p-1 rounded-[14px] w-full border border-gray-200/50">
              <button
                onClick={() => setActiveTab('email')}
                className={`flex-1 py-2 text-[13px] font-bold rounded-xl transition-all outline-none ${activeTab === 'email' ? 'bg-white text-primary shadow-sm border border-gray-200/50' : 'text-gray-500 hover:text-gray-700'}`}
              >
                Email
              </button>
              <button
                onClick={() => setActiveTab('phone')}
                className={`flex-1 py-2 text-[13px] font-bold rounded-xl transition-all outline-none ${activeTab === 'phone' ? 'bg-white text-primary shadow-sm border border-gray-200/50' : 'text-gray-500 hover:text-gray-700'}`}
              >
                Phone Number
              </button>
            </div>
          </div>
        ) : null}

        {/* Content */}
        <div className="p-6">
          {otpSent ? (
            // OTP State
            <div className="animate-in slide-in-from-right-4 duration-300">
              <p className="text-[13px] text-gray-600 mb-6 font-medium text-center">
                We've sent a 6-digit OTP to your registered phone number.
              </p>
              
              <div className="flex justify-between gap-2 mb-8 px-2">
                {otp.map((digit, index) => (
                  <input
                    key={index}
                    ref={(el) => (inputRefs.current[index] = el)}
                    type="text"
                    inputMode="numeric"
                    value={digit}
                    onChange={(e) => handleOtpChange(index, e.target.value)}
                    onKeyDown={(e) => handleOtpKeyDown(index, e)}
                    className="w-[42px] h-[52px] text-center text-lg font-bold bg-gray-50 border border-gray-300 rounded-xl focus:bg-white focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                  />
                ))}
              </div>

              <button className="w-full bg-primary hover:bg-blue-700 text-white font-bold py-3.5 px-4 rounded-xl shadow-md transition-all flex items-center justify-center group mb-5">
                Verify OTP
                <ArrowRight size={18} className="ml-2 group-hover:translate-x-1 transition-transform" />
              </button>

              <div className="text-center text-[13px] font-bold">
                {timer > 0 ? (
                  <span className="text-gray-400">Resend OTP in <span className="text-gray-600">{timer}s</span></span>
                ) : (
                  <button onClick={() => { setTimer(30); setOtp(['','','','','','']); inputRefs.current[0]?.focus(); }} className="text-primary hover:text-blue-700 hover:underline transition-colors outline-none">Resend OTP</button>
                )}
              </div>
            </div>
          ) : activeTab === 'email' ? (
            // Email Form
            <form onSubmit={handleSendResetLink} className="animate-in slide-in-from-left-4 duration-300">
              <div className="mb-6">
                <label className="block text-[12px] font-bold text-gray-700 uppercase tracking-wider mb-2">College Email</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                    <Mail size={18} />
                  </div>
                  <input 
                    type="email"
                    placeholder="Enter your college email"
                    required
                    className="w-full pl-10 p-3.5 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all text-[14px]"
                  />
                </div>
                <p className="text-[11px] text-gray-400 mt-2 font-semibold">We'll send a reset link to your registered email</p>
              </div>

              <button disabled={emailStatus === 'sent'} type="submit" className={`w-full text-white font-bold py-3.5 px-4 rounded-xl shadow-md transition-all flex items-center justify-center ${emailStatus === 'sent' ? 'bg-green-500' : 'bg-primary hover:bg-blue-700'}`}>
                {emailStatus === 'sent' ? 'Reset Link Sent!' : 'Send Reset Link'}
                {emailStatus !== 'sent' && <ArrowRight size={18} className="ml-2" />}
              </button>
            </form>
          ) : (
            // Phone Form
            <form onSubmit={handleSendOtp} className="animate-in slide-in-from-right-4 duration-300">
               <div className="mb-6">
                <label className="block text-[12px] font-bold text-gray-700 uppercase tracking-wider mb-2">Phone Number</label>
                <div className="flex relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-500 border-r border-gray-200 pr-3">
                    <span className="text-base mr-1.5 leading-none">🇮🇳</span>
                    <span className="text-[13px] font-bold">+91</span>
                  </div>
                  <input 
                    type="tel"
                    placeholder="Enter your phone number"
                    pattern="[0-9]{10}"
                    required
                    className="w-full pl-24 p-3.5 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all text-[14px]"
                  />
                </div>
                <p className="text-[11px] text-gray-400 mt-2 font-semibold">We'll send a 6-digit OTP to your registered phone number</p>
              </div>

              <button type="submit" className="w-full bg-primary hover:bg-blue-700 text-white font-bold py-3.5 px-4 rounded-xl shadow-md transition-all flex items-center justify-center">
                <Phone size={16} className="mr-2" />
                Send OTP
              </button>
            </form>
          )}
        </div>

      </div>
    </div>
  );
};

export default ForgotPasswordModal;
