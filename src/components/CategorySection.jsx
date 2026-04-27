import { CheckCircle2, Star } from 'lucide-react';
import { motion } from 'framer-motion';

const CategorySection = ({ title, icon, colorTheme, subjects, selectedId, onSelect, disabled }) => {
  const colorMap = {
    blue: {
      border: 'border-blue-200',
      bgActive: 'bg-blue-50/50',
      borderActive: 'border-primary',
      text: 'text-primary',
      badge: 'bg-blue-100 text-primary',
      accent: 'primary'
    },
    purple: {
      border: 'border-purple-200',
      bgActive: 'bg-purple-50/50',
      borderActive: 'border-purple-500',
      text: 'text-purple-600',
      badge: 'bg-purple-100 text-purple-700',
      accent: 'purple-500'
    }
  };

  const theme = colorMap[colorTheme] || colorMap.blue;

  return (
    <div className={`bg-white rounded-3xl p-6 md:p-8 border ${theme.border} shadow-[0_8px_30px_rgb(0,0,0,0.04)] mb-8 transition-all`}>
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-xl font-black flex items-center text-gray-900 tracking-tight">
          <span className="mr-3 text-3xl">{icon}</span> {title}
        </h3>
        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 bg-gray-50 px-3 py-1 rounded-full border border-gray-100">
          Selection Required
        </span>
      </div>
      <p className="text-sm text-secondary mb-8 font-medium">Please select exactly one subject from the list below</p>
      
      <div className="grid grid-cols-1 gap-4">
        {subjects.map(subject => {
          const isSelected = selectedId === subject.id;
          return (
            <motion.label 
              key={subject.id}
              whileHover={!disabled ? { y: -2, shadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1)" } : {}}
              className={`relative flex items-start p-5 rounded-2xl border-2 transition-all duration-300 cursor-pointer overflow-hidden ${
                isSelected 
                  ? `${theme.bgActive} ${theme.borderActive} shadow-lg shadow-${theme.accent}/5` 
                  : `border-gray-100 hover:border-gray-200 bg-white ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`
              }`}
            >
              <div className="flex items-center h-6 mt-0.5">
                <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${
                  isSelected ? `bg-${theme.accent} border-${theme.accent}` : 'border-gray-200 bg-white'
                }`}>
                  <input 
                    type="radio" 
                    name={`category-${title}`}
                    value={subject.id}
                    checked={isSelected}
                    onChange={() => !disabled && onSelect(subject)}
                    disabled={disabled}
                    className="hidden"
                  />
                  {isSelected && <CheckCircle2 className="w-4 h-4 text-white" strokeWidth={3} />}
                </div>
              </div>

              <div className="ml-5 flex-1">
                <div className="flex justify-between items-start">
                  <div className="pr-4">
                    <span className={`text-[11px] font-black uppercase tracking-widest ${isSelected ? theme.text : 'text-gray-400'}`}>
                      {subject.code}
                    </span>
                    <h4 className="font-extrabold text-gray-900 text-lg leading-tight mt-0.5">{subject.title}</h4>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <span className={`text-[10px] px-2.5 py-1 rounded-lg font-black tracking-wider uppercase border ${
                      isSelected ? `bg-white ${theme.text} border-${theme.accent}/20` : 'bg-gray-50 text-gray-500 border-gray-100'
                    }`}>
                      {subject.credits} {subject.credits === 1 ? 'Credit' : 'Credits'}
                    </span>
                    {subject.isPopular && (
                      <span className={`flex items-center gap-1 text-[9px] px-2 py-0.5 rounded-full font-black tracking-widest uppercase bg-amber-100 text-amber-600 border border-amber-200`}>
                        <Star className="w-2 h-2 fill-amber-600" /> Popular
                      </span>
                    )}
                  </div>
                </div>
                {subject.description && (
                  <p className={`text-sm mt-3 leading-relaxed transition-colors ${isSelected ? 'text-gray-700' : 'text-secondary'}`}>
                    {subject.description}
                  </p>
                )}
              </div>
              
              {isSelected && (
                <div className={`absolute top-0 right-0 w-24 h-24 bg-${theme.accent}/5 rounded-full -translate-y-12 translate-x-12 -z-0`}></div>
              )}
            </motion.label>
          );
        })}
      </div>
    </div>
  );
};

export default CategorySection;
