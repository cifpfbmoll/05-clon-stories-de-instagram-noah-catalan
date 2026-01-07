import React from 'react';
import { Story } from '../types';
import { StoryCircle } from './StoryCircle';
import { AddStoryButton } from './AddStoryButton';

interface StoryListProps {
  stories: Story[];
  isLoading: boolean;
  onAddStory: (file: File) => void;
  onStoryClick: (index: number) => void;
}

/**
 * Lista horizontal de historias.
 * Incluye el botón "+" y todos los círculos de historias.
 * 
 * EXPLICACIÓN PEDAGÓGICA:
 * - overflow-x-auto permite scroll horizontal
 * - flex-shrink-0 en cada elemento evita que se compriman
 * - snap-x y snap-start proporcionan "snapping" nativo en móviles
 */
export const StoryList: React.FC<StoryListProps> = ({
  stories,
  isLoading,
  onAddStory,
  onStoryClick,
}) => {
  return (
    <div className="bg-black border-b border-gray-800">
      <div 
        className="
          flex items-center gap-4 p-4
          overflow-x-auto scrollbar-hide
          snap-x snap-mandatory
        "
        style={{
          scrollbarWidth: 'none', // Firefox
          msOverflowStyle: 'none', // IE/Edge
        }}
      >
        {/* Botón para agregar nueva historia */}
        <div className="snap-start">
          <AddStoryButton onFileSelect={onAddStory} isLoading={isLoading} />
        </div>
        
        {/* Lista de historias existentes */}
        {stories.map((story, index) => (
          <div key={story.id} className="snap-start">
            <StoryCircle
              story={story}
              onClick={() => onStoryClick(index)}
            />
          </div>
        ))}
        
        {/* Mensaje si no hay historias */}
        {stories.length === 0 && (
          <div className="text-gray-500 text-sm pl-2">
            No hay historias. ¡Sube la primera!
          </div>
        )}
      </div>
    </div>
  );
};
