import { AlertCircle, CheckCircle, Clock } from 'lucide-react';

const SubjectCard = ({ subject, onSelect, isSelected, isDisabled }) => {
  const { code, title, department, maxSeats, filledSeats } = subject;
  const seatsRemaining = maxSeats - filledSeats;
  const percentRemaining = (seatsRemaining / maxSeats) * 100;
  const progressPercentage = (filledSeats / maxSeats) * 100;
  
  let statusText = "Available";
  let statusColor = "success";
  let progressColor = "bg-green-500";
  let Icon = CheckCircle;

  if (seatsRemaining === 0) {
    statusText = "Full";
    statusColor = "error";
    progressColor = "bg-red-500";
    Icon = AlertCircle;
  } else if (percentRemaining < 20) {
    statusText = "Almost Full";
    statusColor = "error";
    progressColor = "bg-red-500";
    Icon = Clock;
  } else if (percentRemaining <= 50) {
    statusText = "Almost Full";
    statusColor = "warning";
    progressColor = "bg-orange-500";
    Icon = Clock;
  } else {
    statusText = "Available";
    statusColor = "success";
    progressColor = "bg-green-500";
    Icon = CheckCircle;
  }

  const colorClasses = {
    success: 'text-success bg-green-50 outline-green-200',
    warning: 'text-warning bg-orange-50 outline-orange-200',
    error: 'text-error bg-red-50 outline-red-200'
  };

  return (
    <div className={`p-6 bg-white rounded-2xl shadow-sm border ${isSelected ? 'border-primary outline outline-2 outline-primary/20' : 'border-gray-100'}`}>
      <div className="flex justify-between items-start mb-4">
        <div>
          <span className="text-primary font-bold text-sm tracking-widest">{code}</span>
          <h3 className="text-lg font-bold text-gray-900 mt-1 line-clamp-2">{title}</h3>
          <p className="text-sm text-secondary mt-1">{department} Department</p>
        </div>
      </div>

      <div className="mb-4">
        <div className="flex justify-between items-end mb-2">
          <span className="text-xs font-semibold text-secondary uppercase tracking-wider">Seats Filled</span>
          <span className="text-sm font-bold text-gray-900">{filledSeats} / {maxSeats}</span>
        </div>
        <div className="w-full bg-gray-100 rounded-full h-2">
          <div className={`${progressColor} h-2 rounded-full transition-all duration-500`} style={{ width: `${progressPercentage}%` }}></div>
        </div>
      </div>

      <div className="flex items-center justify-between mt-6">
        <div className={`flex items-center px-3 py-1 rounded-full outline outline-1 text-xs font-semibold ${colorClasses[statusColor]}`}>
          <Icon className="w-3 h-3 mr-1.5" />
          {statusText}
        </div>
        
        {seatsRemaining > 0 && seatsRemaining < 5 && (
          <span className="text-xs font-semibold text-warning">⚠️ Only {seatsRemaining} left!</span>
        )}
      </div>

      <button
        onClick={() => onSelect(subject)}
        disabled={isDisabled || seatsRemaining === 0 || isSelected}
        className={`w-full mt-6 py-3 rounded-xl font-semibold transition-all ${
          isSelected
            ? 'bg-primary text-white cursor-default'
            : isDisabled || seatsRemaining === 0
              ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
              : 'bg-primary/10 text-primary hover:bg-primary hover:text-white'
        }`}
      >
        {isSelected ? 'Selected' : seatsRemaining === 0 ? 'Seats Full' : 'Select'}
      </button>
    </div>
  );
};

export default SubjectCard;
