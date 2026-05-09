import { useState, useEffect, useRef } from 'react';
import { X, Camera, Check, FolderUp, Trash2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import Avatar from './Avatar';

const EditProfileModal = ({ isOpen, onClose }) => {
  const { user, updateCurrentUser } = useAuth();
  const { t } = useLanguage();
  const [profilePhoto, setProfilePhoto] = useState(null);
  const [isPhotoMenuOpen, setIsPhotoMenuOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const fileInputRef = useRef(null);

  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    department: '',
    semester: ''
  });
  const [isToastVisible, setIsToastVisible] = useState(false);

  useEffect(() => {
    if (user && isOpen) {
      setFormData({
        name: user.name || '',
        phone: user.phone || '',
        department: user.department || '',
        semester: user.semester || ''
      });
      setIsToastVisible(false);
      
      const savedPhoto = localStorage.getItem(`profile_photo_${user.id}`);
      setProfilePhoto(savedPhoto);
    }
  }, [user, isOpen]);

  if (!isOpen || !user) return null;

  const showToast = (message) => {
    setToastMessage(message);
    setIsToastVisible(true);
    setTimeout(() => setIsToastVisible(false), 2000);
  };

  const handleSave = (e) => {
    e.preventDefault();
    showToast(t('saveChanges') + '...');
    
    setTimeout(() => {
      updateCurrentUser(formData);
      onClose();
    }, 1500);
  };

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result;
        // Save to specific avatar key (for existing Avatar component logic) AND user object
        localStorage.setItem(`profile_photo_${user.id}`, base64String);
        updateCurrentUser({ profilePhoto: base64String });
        
        setProfilePhoto(base64String);
        setIsPhotoMenuOpen(false);
        showToast("Photo updated!");
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemovePhoto = () => {
    localStorage.removeItem(`profile_photo_${user.id}`);
    updateCurrentUser({ profilePhoto: null });
    setProfilePhoto(null);
    setIsPhotoMenuOpen(false);
    showToast("Photo removed!");
  };

  return (
    <>
      <div className="fixed inset-0 bg-black/40 z-[60] flex items-center justify-center p-4 backdrop-blur-sm animate-in fade-in duration-200">
        <div className="bg-white rounded-3xl shadow-2xl border border-gray-100 w-full max-w-[480px] overflow-hidden animate-in zoom-in-95 slide-in-from-bottom-4 duration-300 flex flex-col max-h-[90vh]">
          
          <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50 sticky top-0 z-10">
            <h2 className="text-lg font-bold text-gray-900 tracking-tight">{t('editProfile')}</h2>
            <button onClick={onClose} className="p-2 hover:bg-gray-200 rounded-full transition-colors outline-none cursor-pointer">
              <X size={18} className="text-gray-500" />
            </button>
          </div>

          <div className="p-6 overflow-y-auto">
            <div className="flex flex-col items-center mb-6 relative">
              <div className="relative">
                <Avatar user={user} size={20} className="text-3xl" />
                <button onClick={() => setIsPhotoMenuOpen(!isPhotoMenuOpen)} type="button" className="absolute bottom-0 right-0 w-7 h-7 bg-white rounded-full flex items-center justify-center shadow-md border border-gray-200 text-gray-600 hover:text-primary hover:border-primary transition-colors cursor-pointer outline-none">
                  <Camera size={14} />
                </button>
              </div>
              
              <button type="button" onClick={() => setIsPhotoMenuOpen(!isPhotoMenuOpen)} className="mt-3 text-[12px] font-bold text-primary hover:underline outline-none">
                Change Photo
              </button>

              {/* Photo Upload Menu */}
              {isPhotoMenuOpen && (
                <div className="absolute top-24 z-20 w-56 bg-white rounded-xl shadow-lg border border-gray-100 py-1 animate-in fade-in zoom-in-95 duration-150">
                  <button 
                    type="button"
                    onClick={() => fileInputRef.current.click()} 
                    className="w-full px-4 py-2.5 text-left text-[13px] font-bold text-gray-700 hover:bg-gray-50 flex items-center transition-colors outline-none"
                  >
                    <FolderUp size={14} className="mr-2.5 text-primary" />
                    Choose from Gallery
                  </button>
                  <button 
                    type="button"
                    onClick={handleRemovePhoto} 
                    className="w-full px-4 py-2.5 text-left text-[13px] font-bold text-red-600 hover:bg-red-50 flex items-center transition-colors outline-none"
                  >
                    <Trash2 size={14} className="mr-2.5" />
                    Remove Photo
                  </button>
                </div>
              )}
              
              <input 
                type="file" 
                accept="image/*" 
                ref={fileInputRef} 
                onChange={handlePhotoChange} 
                className="hidden" 
              />
            </div>

            <form id="edit-profile-form" onSubmit={handleSave} className="space-y-5">
              <div>
                <label className="block text-[12px] font-bold text-gray-700 uppercase tracking-wider mb-1.5">Full Name</label>
                <input 
                  type="text" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})}
                  className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all text-[14px]"
                />
              </div>

              <div>
                <label className="block text-[12px] font-bold text-gray-700 uppercase tracking-wider mb-1.5 flex justify-between">
                  <span>Email Address</span> <span className="text-gray-400 font-medium lowercase">cannot change</span>
                </label>
                <input 
                  type="email" value={user.email} disabled
                  className="w-full p-3 bg-gray-100 border border-gray-200 rounded-xl text-gray-500 outline-none cursor-not-allowed text-[14px]"
                />
              </div>

              <div>
                <label className="block text-[12px] font-bold text-gray-700 uppercase tracking-wider mb-1.5">Phone Number</label>
                <input 
                  type="tel" value={formData.phone} onChange={(e) => setFormData({...formData, phone: e.target.value})}
                  className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all text-[14px]"
                />
              </div>

              {user.role === 'STUDENT' && (
                <>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[12px] font-bold text-gray-700 uppercase tracking-wider mb-1.5">Department</label>
                      <select 
                        value={formData.department} onChange={(e) => setFormData({...formData, department: e.target.value})}
                        className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-primary/20 outline-none transition-all text-[13px] appearance-none cursor-pointer"
                      >
                        <option value="ISE">ISE</option>
                        <option value="CSE">CSE</option>
                        <option value="ECE">ECE</option>
                        <option value="MECH">MECH</option>
                        <option value="CIVIL">CIVIL</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-[12px] font-bold text-gray-700 uppercase tracking-wider mb-1.5">Semester</label>
                      <select 
                        value={formData.semester} onChange={(e) => setFormData({...formData, semester: e.target.value})}
                        className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-primary/20 outline-none transition-all text-[13px] appearance-none cursor-pointer"
                      >
                         {[...Array(8)].map((_, i) => (
                           <option key={i+1} value={i+1}>Semester {i+1}</option>
                         ))}
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-[12px] font-bold text-gray-700 uppercase tracking-wider mb-1.5 flex justify-between">
                      <span>USN</span> <span className="text-gray-400 font-medium lowercase">auto generated</span>
                    </label>
                    <input 
                      type="text" value={user.USN} disabled
                      className="w-full p-3 bg-gray-100 border border-gray-200 rounded-xl text-gray-500 font-bold outline-none cursor-not-allowed text-[14px]"
                    />
                  </div>
                </>
              )}
            </form>
          </div>

          <div className="p-4 border-t border-gray-100 flex gap-3 bg-gray-50/50 relative z-10">
            <button type="button" onClick={onClose} className="flex-1 py-3.5 px-4 border border-gray-200 text-gray-700 font-bold rounded-xl hover:bg-gray-100 transition-colors bg-white text-[14px]">
              Cancel
            </button>
            <button form="edit-profile-form" type="submit" className="flex-1 py-3.5 px-4 bg-primary text-white font-bold rounded-xl hover:bg-blue-700 transition-colors shadow-sm text-[14px]">
              {t('saveChanges')}
            </button>
          </div>

        </div>
      </div>

      {/* Success Toast */}
      {isToastVisible && (
        <div className="fixed bottom-6 right-6 z-[70] bg-gray-900 text-white px-5 py-3 rounded-xl shadow-2xl flex items-center animate-in slide-in-from-bottom-5 duration-300">
          <Check size={18} className="text-green-400 mr-3" />
          <span className="font-medium text-sm">{toastMessage}</span>
        </div>
      )}
    </>
  );
};

export default EditProfileModal;
