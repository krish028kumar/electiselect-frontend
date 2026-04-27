import { useState, useEffect, useRef } from 'react';
import { 
  X, ChevronRight, Check, Loader2, KeyRound, Smartphone, AlertTriangle, 
  Eye, EyeOff, Download, FileText, FileSpreadsheet, Share2, Mail, Copy, Send
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { useNavigate } from 'react-router-dom';
import Avatar from './Avatar';

const Toggle = ({ enabled, onChange, isRTL }) => (
  <button 
    type="button"
    onClick={() => onChange(!enabled)}
    className={`w-11 h-6 rounded-full flex items-center p-1 transition-colors duration-200 outline-none ${enabled ? 'bg-primary' : 'bg-gray-300'}`}
  >
    <div className={`w-4 h-4 bg-white rounded-full shadow-sm transform transition-transform duration-200 ${enabled ? (isRTL ? '-translate-x-5' : 'translate-x-5') : 'translate-x-0'}`} />
  </button>
);

const SettingsModal = ({ isOpen, onClose }) => {
  const { user, logout, deleteAccount } = useAuth();
  const { language, setLanguage, t, isRTL } = useLanguage();
  const navigate = useNavigate();
  
  const [settings, setSettings] = useState(() => {
    return user?.settings || {
      emailNotifications: true,
      smsNotifications: false,
      deadlineReminders: true,
      selectionAlerts: false,
      darkMode: false,
      language: 'English',
      twoFactorAuth: false,
      showProfileToClassmates: true,
      shareSelectionData: false
    };
  });

  const [isSaving, setIsSaving] = useState(false);
  const [isToastVisible, setIsToastVisible] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  
  const [simNotif, setSimNotif] = useState(null); // Simulated popups
  
  const [activeSubModal, setActiveSubModal] = useState(null);
  
  // Delete Account States
  const [deleteStep, setDeleteStep] = useState(1);
  const [deleteInput, setDeleteInput] = useState('');
  
  // Password States
  const [passForm, setPassForm] = useState({ current: '', new: '', confirm: '' });
  const [showPass, setShowPass] = useState({ current: false, new: false, confirm: false });
  const getPassStrength = (p) => {
    if (!p) return 0;
    let s = 0;
    if (p.length >= 8) s += 1;
    if (/[A-Z]/.test(p)) s += 1;
    if (/[0-9]/.test(p)) s += 1;
    if (/[^A-Za-z0-9]/.test(p)) s += 1;
    return s;
  };
  const passStrength = getPassStrength(passForm.new);

  // 2FA States
  const [twoFaStep, setTwoFaStep] = useState(1);
  const [twoFaPhone, setTwoFaPhone] = useState('');
  const [otp, setOtp] = useState(['','','','','','']);
  const [timer, setTimer] = useState(30);

  useEffect(() => {
    let interval;
    if (activeSubModal === '2fa' && twoFaStep === 2 && timer > 0) {
      interval = setInterval(() => setTimer(t => t - 1), 1000);
    }
    return () => clearInterval(interval);
  }, [activeSubModal, twoFaStep, timer]);

  useEffect(() => {
    if (settings.darkMode) document.documentElement.classList.add('dark');
    else document.documentElement.classList.remove('dark');
  }, [settings.darkMode]);

  const updateSetting = (key, value, skipToast = false) => {
    const newSettings = { ...settings, [key]: value };
    setSettings(newSettings);
    // Don't sync to global user yet, wait for 'Save Changes' click for heavy logic, 
    // but for instant toggles like language/theme we can sync immediately if needed.
    // However, the requested flow is to save on click.
    if (!skipToast) showToast('Changes staged locally');
  };

  const showToast = (message) => {
    setToastMessage(message);
    setIsToastVisible(true);
    setTimeout(() => setIsToastVisible(false), 2000);
  };

  const fireSimulatedPopup = (icon, msg, delay) => {
    setTimeout(() => {
      setSimNotif({ icon, msg });
      setTimeout(() => setSimNotif(null), 5000);
    }, delay);
  };

  const handleSaveSettings = () => {
    setIsSaving(true);
    
    // Sync to persistent user object
    const { updateCurrentUser } = useAuth(); // Actually it's already destructured above
    
    setTimeout(() => {
      updateCurrentUser({ settings });
      setIsSaving(false);
      showToast('✅ ' + t('saveChanges'));
    }, 1000);
  };

  // Notification Toggles Logic
  const handleEmailToggle = (v) => {
    updateSetting('emailNotif', v, true);
    if (v) {
      showToast('Email notifications enabled');
      fireSimulatedPopup('📧', 'You have a new notification: Open Elective selection is active!', 3000);
    }
  };
  
  const handleSmsToggle = (v) => {
    updateSetting('smsNotif', v, true);
    if (v) {
      showToast('SMS notifications enabled');
      fireSimulatedPopup('📱', 'SMS: ElectiSelect - Your deadline is in 10 days!', 2000);
    }
  };

  const handleReminderToggle = (v) => {
    updateSetting('reminders', v, true);
    if (v) {
      showToast('Deadline reminders enabled');
      fireSimulatedPopup('⏰', 'Reminder: Selection deadline is on APR 19, 2026 - 10 days left!', 2000);
    }
  };

  const handleAlertToggle = (v) => {
    updateSetting('alerts', v, true);
    if (v) {
      showToast('Selection alerts enabled');
      fireSimulatedPopup('🔔', 'Alert: You haven\'t selected your elective yet!', 1000);
    }
  };

  const handleTwoFactorToggle = (v) => {
    if (v) {
      setTwoFaStep(1);
      setTwoFaPhone('');
      setOtp(['','','','','','']);
      setActiveSubModal('2fa');
    } else {
      setActiveSubModal('2fa-disable');
    }
  };

  const handlePasswordSave = () => {
    if (passForm.new !== passForm.confirm || passStrength < 4 || passForm.current === '') return;
    setActiveSubModal(null);
    setPassForm({ current: '', new: '', confirm: '' });
    showToast('Password updated successfully!');
  };

  const handleDeleteAccountFinal = () => {
    setActiveSubModal('delete-3');
    setTimeout(() => {
      deleteAccount();
    }, 3000);
  };

  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 bg-black/40 z-[60] flex items-center justify-center p-4 backdrop-blur-sm animate-in fade-in duration-200">
        <div className="bg-white rounded-3xl shadow-2xl border border-gray-100 w-full max-w-[500px] overflow-hidden animate-in zoom-in-95 slide-in-from-bottom-4 duration-300 flex flex-col max-h-[90vh] relative">
          
          <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50 sticky top-0 z-10">
            <h2 className="text-lg font-bold text-gray-900 tracking-tight">{t('settings')}</h2>
            <button onClick={onClose} className="p-2 hover:bg-gray-200 rounded-full transition-colors outline-none cursor-pointer">
              <X size={18} className="text-gray-500" />
            </button>
          </div>

          <div className="p-6 overflow-y-auto space-y-8">
            
            {/* User Info Section */}
            <div className={`p-4 bg-gray-50 rounded-2xl border border-gray-100 flex items-center gap-4`}>
              <Avatar user={user} size={14} className="text-xl shadow-sm border border-white" />
              <div>
                <h3 className="font-bold text-gray-900">{user.name}</h3>
                <p className="text-xs text-gray-500 font-medium">{user.email}</p>
              </div>
            </div>
            
            <section>
              <h3 className="text-[11px] font-bold text-gray-400 tracking-wider uppercase mb-3 px-1">{t('accountSettings')}</h3>
              <div className="bg-gray-50 rounded-2xl border border-gray-100 overflow-hidden text-[13px]">
                <div onClick={() => setActiveSubModal('password')} className="px-4 py-3.5 border-b border-gray-100 flex justify-between items-center hover:bg-gray-100/50 cursor-pointer transition-colors">
                  <span className="font-bold text-gray-700">{t('changePassword')}</span>
                  <ChevronRight size={18} className={`${isRTL ? 'rotate-180' : ''} text-gray-400`} />
                </div>
                <div className="px-4 py-3 border-b border-gray-100 flex justify-between items-center">
                  <span className="font-bold text-gray-700">Two Factor Auth</span>
                  <Toggle enabled={settings.twoFactor} onChange={handleTwoFactorToggle} isRTL={isRTL} />
                </div>
              </div>
            </section>

            <section>
              <h3 className="text-[11px] font-bold text-gray-400 tracking-wider uppercase mb-3 px-1">{t('appearanceLanguage')}</h3>
              <div className="bg-gray-50 rounded-2xl border border-gray-100 overflow-hidden text-[13px]">
                <div className="px-4 py-3 border-b border-gray-100 flex justify-between items-center">
                  <span className="font-bold text-gray-700">{t('darkMode')}</span>
                  <Toggle enabled={settings.darkMode} onChange={(v) => updateSetting('darkMode', v)} isRTL={isRTL} />
                </div>
                <div className="px-4 py-3 flex justify-between items-center">
                  <span className="font-bold text-gray-700">{t('language')}</span>
                  <select 
                    value={settings.language} 
                    onChange={(e) => {
                      updateSetting('language', e.target.value, true);
                      setLanguage(e.target.value);
                    }}
                    className="bg-white border border-gray-200 text-gray-700 rounded-lg px-2.5 py-1.5 text-[12px] font-bold outline-none cursor-pointer"
                  >
                    <option value="English">English</option>
                    <option value="Hindi">Hindi</option>
                    <option value="Kannada">Kannada</option>
                    <option value="Tamil">Tamil</option>
                    <option value="Telugu">Telugu</option>
                    <option value="Marathi">Marathi</option>
                    <option value="Bengali">Bengali</option>
                    <option value="Gujarati">Gujarati</option>
                    <option value="Urdu">Urdu</option>
                  </select>
                </div>
              </div>
            </section>

            <section>
              <h3 className="text-[11px] font-bold text-gray-400 tracking-wider uppercase mb-3 px-1">Privacy</h3>
              <div className="bg-gray-50 rounded-2xl border border-gray-100 overflow-hidden text-[13px] mb-2">
                <div className="px-4 py-3 border-b border-gray-100 flex justify-between items-center">
                  <span className="font-bold text-gray-700">Show profile to classmates</span>
                  <Toggle enabled={settings.showProfile} onChange={(v) => { updateSetting('showProfile', v, true); showToast(`Profile visibility ${v ? 'enabled' : 'disabled'}`); }} />
                </div>
                {settings.showProfile ? (
                  <div className="px-4 py-2 bg-green-50/50 text-green-700 text-[11px] font-semibold border-b border-gray-100">✔ Your profile is visible to classmates</div>
                ) : (
                  <div className="px-4 py-2 bg-gray-100 text-gray-500 text-[11px] font-semibold border-b border-gray-100">🔒 Your profile is hidden</div>
                )}
                
                <div className="px-4 py-3 flex justify-between items-center border-t border-gray-100">
                  <span className="font-bold text-gray-700">Share selection data</span>
                  <Toggle enabled={settings.shareData} onChange={(v) => updateSetting('shareData', v)} />
                </div>
              </div>
              
              {settings.shareData ? (
                <div className="p-3 bg-blue-50 text-blue-700 rounded-xl text-[12px] font-medium leading-relaxed border border-blue-100">
                  Your elective selections will be visible to your department coordinator and classmates for academic planning.
                </div>
              ) : (
                <div className="p-3 bg-gray-50 text-gray-600 rounded-xl text-[12px] font-medium leading-relaxed border border-gray-200">
                  Your selection data is private. Only admin can view it.
                </div>
              )}
            </section>

            <section>
              <h3 className="text-[11px] font-bold text-red-500 tracking-wider uppercase mb-3 px-1">{t('dangerZone')}</h3>
              <div className="flex gap-4">
                <button onClick={() => { setDeleteStep(1); setActiveSubModal('delete'); }} className="flex-1 py-3 px-4 rounded-xl border border-red-500 text-red-600 font-bold hover:bg-red-50 transition-colors text-[13px]">
                  {t('deleteAccount')}
                </button>
                <button onClick={() => setActiveSubModal('export')} className="flex-1 py-3 px-4 rounded-xl border border-gray-300 text-gray-700 font-bold hover:bg-gray-100 transition-colors bg-white text-[13px]">
                  {t('exportData')}
                </button>
              </div>
            </section>

          </div>

          <div className="p-4 border-t border-gray-100 bg-gray-50/50 relative z-10 flex">
            <button onClick={handleSaveSettings} disabled={isSaving} className="w-full py-3.5 px-4 bg-primary text-white font-bold rounded-xl hover:bg-blue-700 transition-colors shadow-sm text-[14px] flex items-center justify-center disabled:opacity-70">
              {isSaving ? <Loader2 size={18} className="animate-spin mr-2" /> : null}
              {isSaving ? 'Saving...' : t('saveChanges')}
            </button>
          </div>

          {/* SIMULATED PUSH NOTIFICATION */}
          {simNotif && (
            <div className="absolute top-16 left-6 right-6 bg-white/90 backdrop-blur-md border border-gray-200 shadow-2xl rounded-2xl p-4 z-50 animate-in slide-in-from-top-4 fade-in duration-300 flex items-start gap-3">
              <span className="text-2xl">{simNotif.icon}</span>
              <p className="text-sm font-semibold text-gray-800 leading-snug pt-1">{simNotif.msg}</p>
            </div>
          )}

          {/* CHANGE PASSWORD SUB-MODAL */}
          {activeSubModal === 'password' && (
            <div className="absolute inset-0 bg-white/70 z-[70] flex items-center justify-center p-4 backdrop-blur-md animate-in fade-in duration-200">
              <div className="bg-white rounded-2xl shadow-xl border border-gray-100 w-full max-w-[360px] p-6 animate-in zoom-in-95 duration-200">
                 <div className="flex justify-between items-center mb-5">
                   <h3 className="font-bold text-[15px] text-gray-900 flex items-center"><KeyRound size={16} className="mr-2 text-primary" /> Change Password</h3>
                   <button onClick={() => setActiveSubModal(null)} className="text-gray-400 hover:text-gray-600 outline-none"><X size={18} /></button>
                 </div>
                 <div className="space-y-4">
                   <div className="relative">
                     <label className="block text-[11px] font-bold text-gray-700 uppercase mb-1">Current Password</label>
                     <input type={showPass.current ? "text" : "password"} value={passForm.current} onChange={e => setPassForm({...passForm, current: e.target.value})} className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-primary text-sm pr-10" />
                     <button onClick={() => setShowPass({...showPass, current: !showPass.current})} className="absolute right-3 top-7 text-gray-400 hover:text-gray-600">
                       {showPass.current ? <EyeOff size={16} /> : <Eye size={16} />}
                     </button>
                   </div>
                   <div className="relative">
                     <label className="block text-[11px] font-bold text-gray-700 uppercase mb-1">New Password</label>
                     <input type={showPass.new ? "text" : "password"} value={passForm.new} onChange={e => setPassForm({...passForm, new: e.target.value})} className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-primary text-sm pr-10" />
                     <button onClick={() => setShowPass({...showPass, new: !showPass.new})} className="absolute right-3 top-7 text-gray-400 hover:text-gray-600">
                       {showPass.new ? <EyeOff size={16} /> : <Eye size={16} />}
                     </button>
                     
                     <div className="flex gap-1 mt-2">
                       <div className={`h-1 flex-1 rounded-full ${passStrength >= 1 ? (passStrength < 3 ? 'bg-red-400' : (passStrength < 4 ? 'bg-orange-400' : 'bg-green-500')) : 'bg-gray-200'}`}></div>
                       <div className={`h-1 flex-1 rounded-full ${passStrength >= 2 ? (passStrength < 3 ? 'bg-red-400' : (passStrength < 4 ? 'bg-orange-400' : 'bg-green-500')) : 'bg-gray-200'}`}></div>
                       <div className={`h-1 flex-1 rounded-full ${passStrength >= 3 ? (passStrength < 4 ? 'bg-orange-400' : 'bg-green-500') : 'bg-gray-200'}`}></div>
                       <div className={`h-1 flex-1 rounded-full ${passStrength >= 4 ? 'bg-green-500' : 'bg-gray-200'}`}></div>
                     </div>
                     <p className="text-[10px] font-bold mt-1 text-gray-500">Requirements: 8+ chars, 1 uppercase, 1 number, 1 symbol</p>
                   </div>
                   <div className="relative">
                     <label className="block text-[11px] font-bold text-gray-700 uppercase mb-1">Confirm New Password</label>
                     <input type={showPass.confirm ? "text" : "password"} value={passForm.confirm} onChange={e => setPassForm({...passForm, confirm: e.target.value})} className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-primary text-sm pr-10" />
                     <button onClick={() => setShowPass({...showPass, confirm: !showPass.confirm})} className="absolute right-3 top-7 text-gray-400 hover:text-gray-600">
                       {showPass.confirm ? <EyeOff size={16} /> : <Eye size={16} />}
                     </button>
                   </div>
                   <button 
                     onClick={handlePasswordSave} 
                     disabled={passForm.new !== passForm.confirm || passStrength < 4 || passForm.current === ''}
                     className="w-full py-3 bg-primary text-white font-bold rounded-xl mt-2 hover:bg-blue-700 disabled:opacity-50 transition-colors text-[13px]"
                   >
                     Update Password
                   </button>
                 </div>
              </div>
            </div>
          )}

          {/* 2FA SETUP MODAL */}
          {activeSubModal === '2fa' && (
            <div className="absolute inset-0 bg-white/70 z-[70] flex items-center justify-center p-4 backdrop-blur-md animate-in fade-in duration-200">
              <div className="bg-white rounded-2xl shadow-xl w-full max-w-[360px] p-6 animate-in zoom-in-95 duration-200 text-center relative border border-gray-100">
                 
                 {twoFaStep === 1 && (
                   <>
                     <button onClick={() => setActiveSubModal(null)} className="absolute top-4 right-4 text-gray-400"><X size={18}/></button>
                     <h3 className="font-bold text-lg text-gray-900 mb-2">Set Up Two-Factor Authentication</h3>
                     <p className="text-sm text-gray-500 mb-6 font-medium">Step 1: Enter your phone number</p>
                     
                     <div className="flex gap-2 mb-6">
                       <div className="w-16 p-3 bg-gray-50 border border-gray-200 rounded-xl font-bold text-gray-700 text-sm text-center">+91</div>
                       <input autoFocus type="tel" value={twoFaPhone} onChange={e => setTwoFaPhone(e.target.value)} placeholder="Phone number" className="flex-1 p-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:bg-white focus:border-primary text-sm font-semibold tracking-wider" />
                     </div>
                     <button disabled={twoFaPhone.length < 10} onClick={() => { setTwoFaStep(2); setTimer(30); }} className="w-full py-3 bg-primary text-white font-bold rounded-xl disabled:opacity-50">Send OTP</button>
                   </>
                 )}

                 {twoFaStep === 2 && (
                   <>
                     <button onClick={() => setTwoFaStep(1)} className="absolute top-4 right-4 text-gray-400"><X size={18}/></button>
                     <h3 className="font-bold text-lg text-gray-900 mb-2">Set Up Two-Factor Authentication</h3>
                     <p className="text-sm text-gray-500 mb-6 font-medium">Step 2: Enter the 6-digit OTP sent to {twoFaPhone}</p>
                     
                     <div className="flex justify-between gap-2 mb-6">
                       {[0,1,2,3,4,5].map(i => (
                         <input key={i} id={`otp-${i}`} type="text" maxLength={1} value={otp[i]}
                           onChange={e => {
                             const v = e.target.value;
                             const newOtp = [...otp]; newOtp[i] = v; setOtp(newOtp);
                             if (v && i < 5) document.getElementById(`otp-${i+1}`).focus();
                           }}
                           className="w-10 h-10 bg-gray-50 border border-gray-200 rounded-xl text-center text-lg font-bold focus:border-primary focus:bg-white transition-colors outline-none" 
                         />
                       ))}
                     </div>
                     
                     <button 
                       disabled={otp.join('').length < 6} 
                       onClick={() => { setTwoFaStep(3); updateSetting('twoFactor', true); updateSetting('smsNotif', true, true); }} 
                       className="w-full py-3 bg-primary text-white font-bold rounded-xl disabled:opacity-50 mb-3"
                     >
                       Verify
                     </button>
                     
                     <div className="text-[12px] font-bold text-gray-500">
                       {timer > 0 ? `Resend OTP in ${timer}s` : <span className="text-primary cursor-pointer hover:underline" onClick={() => setTimer(30)}>Resend OTP</span>}
                     </div>
                   </>
                 )}

                 {twoFaStep === 3 && (
                   <div className="py-2">
                     <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4 border-4 border-green-50 shadow-sm">
                       <Check size={32} />
                     </div>
                     <h3 className="font-bold text-xl text-gray-900 mb-2">2FA Enabled Successfully!</h3>
                     <p className="text-sm text-gray-500 mb-6">Your account is now more secure</p>
                     <button onClick={() => setActiveSubModal(null)} className="w-full py-3 bg-gray-900 text-white font-bold rounded-xl">Done</button>
                   </div>
                 )}
              </div>
            </div>
          )}

          {activeSubModal === '2fa-disable' && (
            <div className="absolute inset-0 bg-white/70 z-[70] flex items-center justify-center p-4 backdrop-blur-md animate-in fade-in">
              <div className="bg-white rounded-2xl shadow-xl w-full max-w-[320px] p-6 text-center border border-gray-100">
                <AlertTriangle size={32} className="mx-auto text-orange-500 mb-4" />
                <h3 className="font-bold text-lg text-gray-900 mb-2">Disable 2FA?</h3>
                <p className="text-sm text-gray-500 mb-6">Your account will be less secure without Two-Factor Authentication.</p>
                <div className="flex gap-3">
                  <button onClick={() => setActiveSubModal(null)} className="flex-1 py-3 border border-gray-200 font-bold rounded-xl text-gray-600">Cancel</button>
                  <button onClick={() => { setActiveSubModal(null); updateSetting('twoFactor', false); }} className="flex-1 py-3 bg-orange-500 text-white font-bold rounded-xl">Disable</button>
                </div>
              </div>
            </div>
          )}

          {/* DELETE ACCOUNT FLOW */}
          {activeSubModal?.startsWith('delete') && (
            <div className="absolute inset-0 bg-white/70 z-[70] flex items-center justify-center p-4 backdrop-blur-md animate-in fade-in duration-200">
              <div className="bg-white rounded-2xl shadow-xl border border-gray-100 w-full max-w-[360px] p-6 animate-in zoom-in-95 duration-200 text-center">
                 
                 {activeSubModal === 'delete' && (
                   <>
                     <div className="w-14 h-14 bg-red-50 text-red-500 border border-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                       <AlertTriangle size={26} />
                     </div>
                     <h3 className="font-bold text-xl text-gray-900 mb-2">Delete Your Account?</h3>
                     <p className="text-sm text-gray-500 font-medium mb-4 leading-relaxed">This will permanently delete your account and all your data. This action cannot be undone!</p>
                     
                     <div className="bg-gray-50 rounded-xl p-4 text-left mb-6 border border-gray-100">
                       <p className="text-[11px] font-bold text-gray-600 uppercase mb-2">Data to be deleted:</p>
                       <ul className="text-[13px] text-gray-700 font-medium space-y-1.5 ml-1">
                         <li>• Your profile information</li>
                         <li>• Your elective selections</li>
                         <li>• Your academic records</li>
                       </ul>
                     </div>

                     <div className="space-y-2">
                       <button onClick={() => setActiveSubModal('delete-2')} className="w-full py-3 border-2 border-red-500 text-red-600 font-bold rounded-xl hover:bg-red-50 transition-colors">Yes, Continue</button>
                       <button onClick={() => setActiveSubModal(null)} className="w-full py-3 bg-gray-100 text-gray-700 font-bold rounded-xl hover:bg-gray-200">Cancel</button>
                     </div>
                   </>
                 )}

                 {activeSubModal === 'delete-2' && (
                   <>
                     <h3 className="font-bold text-xl text-gray-900 mb-2">Are you absolutely sure?</h3>
                     <p className="text-sm text-gray-500 mb-5">Type <strong className="text-gray-900">DELETE</strong> to confirm</p>
                     
                     <input autoFocus type="text" value={deleteInput} onChange={e => setDeleteInput(e.target.value)} placeholder="DELETE" className="w-full p-3 bg-red-50/50 border border-red-100 rounded-xl outline-none focus:border-red-500 focus:bg-white transition-all text-sm mb-6 text-center tracking-widest font-bold text-red-600 uppercase" />
                     
                     <div className="space-y-2">
                       <button 
                         disabled={deleteInput !== 'DELETE'} 
                         onClick={handleDeleteAccountFinal} 
                         className="w-full py-3 bg-red-500 text-white font-bold rounded-xl disabled:opacity-50 disabled:cursor-not-allowed hover:bg-red-600 transition-all text-[14px]"
                       >
                         Delete My Account
                       </button>
                       <button onClick={() => setActiveSubModal(null)} className="w-full py-3 bg-blue-50 text-blue-600 font-bold rounded-xl hover:bg-blue-100">No, Keep My Account</button>
                     </div>
                   </>
                 )}

                 {activeSubModal === 'delete-3' && (
                   <div className="py-4">
                     <Loader2 size={32} className="animate-spin text-red-500 mx-auto mb-4" />
                     <h3 className="font-bold text-lg text-gray-900">Account deleted successfully</h3>
                     <p className="text-sm text-gray-500 mt-2">Redirecting to login...</p>
                   </div>
                 )}

              </div>
            </div>
          )}

          {/* EXPORT DATA SHARE SHEET */}
          {activeSubModal === 'export' && (
            <div className="absolute inset-x-0 bottom-0 top-1/3 bg-white z-[70] rounded-t-3xl shadow-[0_-10px_40px_rgba(0,0,0,0.15)] flex flex-col animate-in slide-in-from-bottom-full duration-300 border-t border-gray-200">
               <div className="w-12 h-1.5 bg-gray-200 rounded-full mx-auto mt-3 mb-2"></div>
               
               <div className="px-6 py-4 border-b border-gray-100 text-center relative">
                 <h3 className="font-bold text-lg text-gray-900">Export Your Data</h3>
                 <p className="text-xs text-gray-500 mt-1">Profile info • Selections • Records</p>
               </div>
               
               <div className="p-6 overflow-y-auto space-y-3">
                 <button onClick={() => { showToast('Downloading electiselect-data.json...'); setTimeout(()=>setActiveSubModal(null),1500); }} className="w-full flex items-center justify-between p-4 bg-gray-50 hover:bg-gray-100 rounded-2xl transition-colors outline-none cursor-pointer">
                   <div className="flex items-center gap-3">
                     <div className="w-10 h-10 bg-yellow-100 text-yellow-600 rounded-xl flex items-center justify-center"><Download size={18}/></div>
                     <span className="font-bold text-gray-700 text-sm tracking-wide">Download as JSON</span>
                   </div>
                   <ChevronRight size={18} className="text-gray-400" />
                 </button>
                 
                 <button onClick={() => { showToast('Downloading electiselect-report.pdf...'); setTimeout(()=>setActiveSubModal(null),1500); }} className="w-full flex items-center justify-between p-4 bg-gray-50 hover:bg-gray-100 rounded-2xl transition-colors outline-none cursor-pointer">
                   <div className="flex items-center gap-3">
                     <div className="w-10 h-10 bg-red-100 text-red-600 rounded-xl flex items-center justify-center"><FileText size={18}/></div>
                     <span className="font-bold text-gray-700 text-sm tracking-wide">Download as PDF</span>
                   </div>
                   <ChevronRight size={18} className="text-gray-400" />
                 </button>
                 
                 <button onClick={() => { showToast('Downloading electiselect-data.xlsx...'); setTimeout(()=>setActiveSubModal(null),1500); }} className="w-full flex items-center justify-between p-4 bg-gray-50 hover:bg-gray-100 rounded-2xl transition-colors outline-none cursor-pointer">
                   <div className="flex items-center gap-3">
                     <div className="w-10 h-10 bg-green-100 text-green-600 rounded-xl flex items-center justify-center"><FileSpreadsheet size={18}/></div>
                     <span className="font-bold text-gray-700 text-sm tracking-wide">Download as Excel</span>
                   </div>
                   <ChevronRight size={18} className="text-gray-400" />
                 </button>
                 
                 <div className="flex items-center gap-4 py-3">
                   <div className="h-px bg-gray-200 flex-1"></div>
                   <span className="text-[11px] font-bold tracking-wider text-gray-400 uppercase">Or share via</span>
                   <div className="h-px bg-gray-200 flex-1"></div>
                 </div>

                 <div className="flex gap-4 justify-center py-2 pb-4">
                   <button onClick={()=>showToast('Shared via WhatsApp')} className="w-14 h-14 bg-green-500 rounded-2xl flex items-center justify-center text-white shadow-sm hover:scale-105 transition-transform"><Send size={22}/></button>
                   <button onClick={()=>showToast('Shared via Email')} className="w-14 h-14 bg-blue-500 rounded-2xl flex items-center justify-center text-white shadow-sm hover:scale-105 transition-transform"><Mail size={22}/></button>
                   <button onClick={()=>showToast('Link Copied to Clipboard')} className="w-14 h-14 bg-gray-700 rounded-2xl flex items-center justify-center text-white shadow-sm hover:scale-105 transition-transform"><Copy size={22}/></button>
                 </div>
                 
                 <button onClick={() => setActiveSubModal(null)} className="w-full py-4 text-gray-600 font-bold bg-white border border-gray-200 rounded-2xl hover:bg-gray-50 transition-colors">
                   Cancel
                 </button>
               </div>
            </div>
          )}

        </div>
      </div>

      {/* Success Toast Base */}
      {isToastVisible && (
        <div className="fixed bottom-6 right-6 z-[80] bg-gray-900 text-white px-5 py-3 rounded-xl shadow-2xl flex items-center animate-in slide-in-from-bottom-5 duration-300">
          <Check size={18} className="text-green-400 mr-3" />
          <span className="font-medium text-sm">{toastMessage}</span>
        </div>
      )}
    </>
  );
};

export default SettingsModal;
