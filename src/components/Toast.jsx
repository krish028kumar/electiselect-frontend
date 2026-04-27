import { useEffect } from 'react';
import { CheckCircle, XCircle } from 'lucide-react';

const Toast = ({ message, type = 'success', onClose }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 3000);
    return () => clearTimeout(timer);
  }, [onClose]);

  if (!message) return null;

  const isSuccess = type === 'success';

  return (
    <div className="fixed bottom-6 right-6 z-50 animate-in slide-in-from-bottom-5 fade-in duration-300">
      <div className={`flex items-center px-4 py-3 rounded-xl shadow-lg border ${
        isSuccess ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'
      }`}>
        {isSuccess ? (
          <CheckCircle className="w-5 h-5 text-success mr-3 flex-shrink-0" />
        ) : (
          <XCircle className="w-5 h-5 text-error mr-3 flex-shrink-0" />
        )}
        <p className={`text-sm font-semibold pr-4 ${isSuccess ? 'text-green-800' : 'text-red-800'}`}>
          {message}
        </p>
      </div>
    </div>
  );
};

export default Toast;
