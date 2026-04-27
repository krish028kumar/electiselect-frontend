const Modal = ({ isOpen, onClose, onConfirm, title, children, confirmText = "Confirm", isDestructive = false }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        <div className="p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">{title}</h2>
          <div className="text-secondary text-sm">
            {children}
          </div>
        </div>
        
        <div className="px-6 py-4 bg-gray-50 flex justify-end space-x-3 border-t border-gray-100">
          <button 
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl font-semibold text-gray-600 hover:bg-gray-200 transition-colors"
          >
            Cancel
          </button>
          <button 
            onClick={onConfirm}
            className={`px-5 py-2.5 rounded-xl font-semibold text-white transition-colors shadow-sm ${
              isDestructive 
                ? 'bg-error hover:bg-red-700' 
                : 'bg-primary hover:bg-blue-700'
            }`}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Modal;
