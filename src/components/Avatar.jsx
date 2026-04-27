import React, { useState, useEffect } from 'react';

const Avatar = ({ user, size = 10, className = "" }) => {
  const [photo, setPhoto] = useState(null);

  useEffect(() => {
    if (user?.id) {
      const savedPhoto = localStorage.getItem(`profile_photo_${user.id}`);
      setPhoto(savedPhoto);
    }
    
    // Listen for custom event when photo is updated
    const handlePhotoUpdate = () => {
      if (user?.id) {
        const savedPhoto = localStorage.getItem(`profile_photo_${user.id}`);
        setPhoto(savedPhoto);
      }
    };
    
    window.addEventListener('profile-photo-updated', handlePhotoUpdate);
    return () => window.removeEventListener('profile-photo-updated', handlePhotoUpdate);
  }, [user?.id]);

  if (!user) return null;

  const initial = user.name ? user.name.charAt(0).toUpperCase() : '?';

  return (
    <div 
      className={`rounded-full flex items-center justify-center font-bold overflow-hidden shadow-sm ${className} ${!photo ? 'bg-primary text-white' : ''}`}
      style={{ width: `${size * 0.25}rem`, height: `${size * 0.25}rem` }}
    >
      {photo ? (
        <img 
          src={photo} 
          alt={user.name} 
          className="w-full h-full object-cover rounded-full" 
        />
      ) : (
        <span>{initial}</span>
      )}
    </div>
  );
};

export default Avatar;
