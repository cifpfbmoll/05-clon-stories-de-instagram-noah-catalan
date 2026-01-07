import React, { useEffect, useRef, useCallback } from 'react';
import { Story } from '../types';
import { ProgressBar } from './ProgressBar';

interface StoryViewerProps {
  stories: Story[];
  currentIndex: number;
  progress: number;
  isOpen: boolean;
  onClose: () => void;
  onNext: () => void;
  onPrevious: () => void;
  onPause: () => void;
  onResume: () => void;
}

/**
 * Visor de historias a pantalla completa.
 * Muestra la imagen actual con barras de progreso y navegación táctil.
 * 
 * EXPLICACIÓN PEDAGÓGICA:
 * Navegación:
 * - Tap en izquierda (25%): historia anterior
 * - Tap en derecha (75%): historia siguiente
 * - Mantener presionado: pausar
 * - Swipe horizontal: navegar
 * - Teclas: ←/→ para navegar, Escape para cerrar
 */
export const StoryViewer: React.FC<StoryViewerProps> = ({
  stories,
  currentIndex,
  progress,
  isOpen,
  onClose,
  onNext,
  onPrevious,
  onPause,
  onResume,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const touchStartX = useRef<number>(0);
  const touchStartY = useRef<number>(0);
  const isHolding = useRef<boolean>(false);
  const holdTimer = useRef<number | null>(null);

  const currentStory = stories[currentIndex];

  // Manejar teclas del teclado
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.key) {
        case 'ArrowLeft':
          onPrevious();
          break;
        case 'ArrowRight':
          onNext();
          break;
        case 'Escape':
          onClose();
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onNext, onPrevious, onClose]);

  // Prevenir scroll del body cuando el visor está abierto
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  // Manejar inicio de toque
  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
    touchStartY.current = e.touches[0].clientY;
    isHolding.current = false;

    // Iniciar timer para detectar "hold" (mantener presionado)
    holdTimer.current = window.setTimeout(() => {
      isHolding.current = true;
      onPause();
    }, 200);
  }, [onPause]);

  // Manejar fin de toque
  const handleTouchEnd = useCallback((e: React.TouchEvent) => {
    // Limpiar timer de hold
    if (holdTimer.current) {
      clearTimeout(holdTimer.current);
      holdTimer.current = null;
    }

    // Si estaba en hold, solo reanudar
    if (isHolding.current) {
      isHolding.current = false;
      onResume();
      return;
    }

    const touchEndX = e.changedTouches[0].clientX;
    const touchEndY = e.changedTouches[0].clientY;
    const deltaX = touchEndX - touchStartX.current;
    const deltaY = touchEndY - touchStartY.current;
    const containerWidth = containerRef.current?.clientWidth || window.innerWidth;

    // Detectar swipe horizontal (mínimo 50px y más horizontal que vertical)
    if (Math.abs(deltaX) > 50 && Math.abs(deltaX) > Math.abs(deltaY)) {
      if (deltaX > 0) {
        onPrevious(); // Swipe derecha = anterior
      } else {
        onNext(); // Swipe izquierda = siguiente
      }
      return;
    }

    // Si no fue swipe, detectar tap en zonas
    const tapX = touchStartX.current;
    const threshold = containerWidth * 0.25;

    if (tapX < threshold) {
      onPrevious(); // Tap izquierda (25%)
    } else {
      onNext(); // Tap derecha (75%)
    }
  }, [onNext, onPrevious, onResume]);

  // Manejar clic del mouse (para desktop)
  const handleClick = useCallback((e: React.MouseEvent) => {
    const containerWidth = containerRef.current?.clientWidth || window.innerWidth;
    const clickX = e.clientX;
    const threshold = containerWidth * 0.25;

    if (clickX < threshold) {
      onPrevious();
    } else {
      onNext();
    }
  }, [onNext, onPrevious]);

  // Manejar mouse down/up para pausar (desktop)
  const handleMouseDown = useCallback(() => {
    holdTimer.current = window.setTimeout(() => {
      isHolding.current = true;
      onPause();
    }, 200);
  }, [onPause]);

  const handleMouseUp = useCallback(() => {
    if (holdTimer.current) {
      clearTimeout(holdTimer.current);
      holdTimer.current = null;
    }
    if (isHolding.current) {
      isHolding.current = false;
      onResume();
    }
  }, [onResume]);

  if (!isOpen || !currentStory) return null;

  return (
    <div 
      className="fixed inset-0 z-50 bg-black flex items-center justify-center"
      ref={containerRef}
    >
      {/* Contenedor de la historia con aspect ratio 9:16 */}
      <div 
        className="relative w-full h-full max-w-[1080px] max-h-[1920px] mx-auto"
        style={{ aspectRatio: '9 / 16' }}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        onClick={handleClick}
        onMouseDown={handleMouseDown}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      >
        {/* Barras de progreso */}
        <div className="absolute top-0 left-0 right-0 z-10">
          <ProgressBar
            total={stories.length}
            currentIndex={currentIndex}
            progress={progress}
          />
        </div>

        {/* Botón cerrar */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onClose();
          }}
          className="absolute top-4 right-4 z-20 text-white text-3xl font-light
                     w-10 h-10 flex items-center justify-center
                     hover:bg-white/20 rounded-full transition-colors"
          aria-label="Cerrar"
        >
          ×
        </button>

        {/* Imagen de la historia */}
        <img
          src={currentStory.imageBase64}
          alt={`Historia ${currentIndex + 1}`}
          className="w-full h-full object-contain"
          draggable={false}
        />

        {/* Indicadores de navegación (solo desktop) */}
        <div className="hidden md:block">
          {/* Zona izquierda */}
          <div className="absolute left-0 top-0 bottom-0 w-1/4 cursor-pointer" />
          {/* Zona derecha */}
          <div className="absolute right-0 top-0 bottom-0 w-3/4 cursor-pointer" />
        </div>

        {/* Contador de historias */}
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 
                        text-white/70 text-sm font-medium">
          {currentIndex + 1} / {stories.length}
        </div>
      </div>
    </div>
  );
};
