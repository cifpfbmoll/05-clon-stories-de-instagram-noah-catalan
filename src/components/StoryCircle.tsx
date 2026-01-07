import React from 'react';
import { Story } from '../types';
import { getTimeRemaining } from '../utils/storage';

interface StoryCircleProps {
  story: Story;
  onClick: () => void;
}

/**
 * Círculo individual de historia en la lista horizontal.
 * Muestra la imagen en miniatura con borde gradiente estilo Instagram.
 * 
 * EXPLICACIÓN PEDAGÓGICA:
 * - El borde gradiente se logra con un div padre que tiene el gradiente
 * - El contenedor interno tiene un borde negro para crear el "gap"
 * - La imagen se muestra con object-cover para llenar el círculo
 */
export const StoryCircle: React.FC<StoryCircleProps> = ({ story, onClick }) => {
  const timeRemaining = getTimeRemaining(story.createdAt);
  const timeString = timeRemaining.hours > 0 
    ? `${timeRemaining.hours}h` 
    : `${timeRemaining.minutes}m`;

  return (
    <button
      onClick={onClick}
      className="flex-shrink-0 flex flex-col items-center gap-1 group"
      aria-label={`Ver historia, expira en ${timeString}`}
    >
      {/* Contenedor con borde gradiente */}
      <div 
        className="p-[3px] rounded-full"
        style={{
          background: 'linear-gradient(45deg, #833ab4, #fd1d1d, #fcb045)',
        }}
      >
        {/* Borde negro interno (gap) */}
        <div className="p-[2px] bg-black rounded-full">
          {/* Imagen de la historia */}
          <div className="w-14 h-14 rounded-full overflow-hidden">
            <img
              src={story.imageBase64}
              alt="Historia"
              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-200"
              loading="lazy"
            />
          </div>
        </div>
      </div>
      
      {/* Tiempo restante */}
      <span className="text-xs text-gray-400">{timeString}</span>
    </button>
  );
};
