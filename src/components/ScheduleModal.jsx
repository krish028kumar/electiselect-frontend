import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Calendar, Info } from 'lucide-react';

const ScheduleModal = ({ isOpen, onClose, sessionInfo }) => {
  if (!isOpen) return null;

  const formatDate = (value) => (value ? new Date(value).toLocaleString() : '—');

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-black/60 backdrop-blur-md"
        />

        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 30 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 30 }}
          className="bg-gray-900 border border-white/10 w-full max-w-xl rounded-[32px] overflow-hidden shadow-2xl relative"
        >
          <div className="p-8 border-b border-white/5 relative bg-gradient-to-br from-gray-800 to-gray-900">
            <button
              onClick={onClose}
              className="absolute top-6 right-6 p-2 h-10 w-10 bg-white/5 hover:bg-white/10 rounded-full flex items-center justify-center transition-all text-gray-400 hover:text-white"
            >
              <X size={20} />
            </button>
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-primary/20 rounded-2xl flex items-center justify-center text-primary border border-primary/20">
                <Calendar size={24} />
              </div>
              <div>
                <h2 className="text-2xl font-extrabold text-white tracking-tight">Session Schedule</h2>
                <p className="text-gray-400 text-sm font-bold tracking-widest uppercase mt-1">
                  {sessionInfo?.sessionType ? `${sessionInfo.sessionType} Session` : 'SESSION SCHEDULE'}
                </p>
              </div>
            </div>
          </div>

          <div className="p-8 space-y-4 text-white">
            <div className="flex items-center justify-between border-b border-white/5 pb-3">
              <span className="text-xs font-bold text-gray-400">Academic Year</span>
              <span className="text-xs font-black tracking-tight">{sessionInfo?.academicYear || '—'}</span>
            </div>
            <div className="flex items-center justify-between border-b border-white/5 pb-3">
              <span className="text-xs font-bold text-gray-400">Selection Window Opens</span>
              <span className="text-xs font-black tracking-tight">{formatDate(sessionInfo?.startTime)}</span>
            </div>
            <div className="flex items-center justify-between border-b border-white/5 pb-3">
              <span className="text-xs font-bold text-gray-400">Selection Window Closes</span>
              <span className="text-xs font-black tracking-tight">{formatDate(sessionInfo?.endTime)}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-gray-400">Status</span>
              <span className="text-xs font-black tracking-tight">{sessionInfo?.status || '—'}</span>
            </div>

            <div className="mt-6 p-3 bg-white/5 rounded-xl flex items-start border border-white/10">
              <Info className="w-4 h-4 text-primary mr-3 flex-shrink-0 mt-0.5" />
              <p className="text-[10px] font-bold text-gray-400 leading-relaxed italic">
                Selection visibility is based on session availability and your eligibility.
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default ScheduleModal;
