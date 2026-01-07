import React from 'react';

interface ProgressBarProps {
  /** Número total de historias */
  total: number;
  /** Índice de la historia actual (0-indexed) */
  currentIndex: number;
  /** Progreso de la historia actual (0-100) */
  progress: number;
}

/**
 * Barra de progreso superior del visor de historias.
 * Muestra una barra por cada historia, la activa se llena progresivamente.
 * 
 * EXPLICACIÓN PEDAGÓGICA:
 * - Cada segmento representa una historia
 * - Las anteriores están llenas (100%)
 * - La actual muestra el progreso real
 * - Las siguientes están vacías (0%)
 */
export const ProgressBar: React.FC<ProgressBarProps> = ({
  total,
  currentIndex,
  progress,
}) => {
  return (
    <div className="flex gap-1 p-2 w-full">
      {Array.from({ length: total }).map((_, index) => {
        // Determinar el progreso de cada segmento
        let segmentProgress = 0;
        if (index < currentIndex) {
          segmentProgress = 100; // Historia ya vista
        } else if (index === currentIndex) {
          segmentProgress = progress; // Historia actual
        }
        // index > currentIndex = 0% (historias futuras)

        return (
          <div
            key={index}
            className="flex-1 h-[3px] bg-white/30 rounded-full overflow-hidden"
          >
            <div
              className="h-full bg-white rounded-full transition-none"
              style={{
                width: `${segmentProgress}%`,
                // Transición suave solo para historias ya vistas
                transition: index < currentIndex ? 'width 0.1s' : 'none',
              }}
            />
          </div>
        );
      })}
    </div>
  );
};
