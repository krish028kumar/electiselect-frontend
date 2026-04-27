import { Loader2 } from 'lucide-react';

const Loader = ({ fullScreen = false }) => {
  if (fullScreen) {
    return (
      <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-white/80 backdrop-blur-sm">
        <Loader2 className="w-10 h-10 text-primary animate-spin mb-4" />
        <p className="text-primary font-semibold tracking-wide animate-pulse">Loading...</p>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center p-4">
      <Loader2 className="w-6 h-6 text-primary animate-spin" />
    </div>
  );
};

export default Loader;
