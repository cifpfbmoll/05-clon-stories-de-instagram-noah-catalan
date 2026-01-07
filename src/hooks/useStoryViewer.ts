import { useState, useCallback, useRef, useEffect } from 'react';
import { Story } from '../types';

const STORY_DURATION_MS = 3000; // 3 segundos por historia

/**
 * Hook para controlar el visor de historias a pantalla completa.
 * 
 * EXPLICACIÓN PEDAGÓGICA:
 * Maneja:
 * - Estado abierto/cerrado del visor
 * - Índice de la historia actual
 * - Temporizador de 3 segundos
 * - Navegación (siguiente/anterior)
 * - Progreso de la barra (0-100%)
 */
export function useStoryViewer(stories: Story[]) {
  const [isOpen, setIsOpen] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [progress, setProgress] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  
  const timerRef = useRef<number | null>(null);
  const progressIntervalRef = useRef<number | null>(null);
  const startTimeRef = useRef<number>(0);
  const pausedProgressRef = useRef<number>(0);
  
  // Ref para almacenar el número total de historias (evita stale closures)
  const storiesLengthRef = useRef(stories.length);
  storiesLengthRef.current = stories.length;

  /**
   * Limpia todos los temporizadores activos.
   */
  const clearTimers = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    if (progressIntervalRef.current) {
      clearInterval(progressIntervalRef.current);
      progressIntervalRef.current = null;
    }
  }, []);

  /**
   * Cierra el visor.
   */
  const closeViewer = useCallback(() => {
    clearTimers();
    setIsOpen(false);
    setProgress(0);
    setIsPaused(false);
  }, [clearTimers]);

  /**
   * Navega a la siguiente historia o cierra si es la última.
   */
  const goToNext = useCallback(() => {
    setCurrentIndex(prev => {
      const nextIndex = prev + 1;
      if (nextIndex >= storiesLengthRef.current) {
        // Era la última historia, cerrar visor
        // Usamos setTimeout para evitar actualizar estado durante render
        setTimeout(() => closeViewer(), 0);
        return prev;
      }
      return nextIndex;
    });
    setProgress(0);
    pausedProgressRef.current = 0;
  }, [closeViewer]);

  /**
   * Navega a la historia anterior.
   */
  const goToPrevious = useCallback(() => {
    setCurrentIndex(prev => Math.max(0, prev - 1));
    setProgress(0);
    pausedProgressRef.current = 0;
  }, []);

  /**
   * Inicia el temporizador de 3 segundos y la animación de progreso.
   */
  const startTimer = useCallback((fromProgress: number = 0) => {
    clearTimers();
    
    const remainingTime = STORY_DURATION_MS * (1 - fromProgress / 100);
    startTimeRef.current = Date.now();
    pausedProgressRef.current = fromProgress;
    setProgress(fromProgress);
    
    // Actualizar barra de progreso cada 16ms (~60fps)
    progressIntervalRef.current = window.setInterval(() => {
      const elapsed = Date.now() - startTimeRef.current;
      const newProgress = pausedProgressRef.current + (elapsed / STORY_DURATION_MS) * 100;
      setProgress(Math.min(newProgress, 100));
    }, 16);
    
    // Avanzar a siguiente historia después del tiempo restante
    timerRef.current = window.setTimeout(() => {
      goToNext();
    }, remainingTime);
  }, [clearTimers, goToNext]);

  /**
   * Abre el visor en una historia específica.
   */
  const openViewer = useCallback((index: number) => {
    if (stories.length === 0) return;
    
    setCurrentIndex(index);
    setIsOpen(true);
    setProgress(0);
    setIsPaused(false);
  }, [stories.length]);

  /**
   * Pausa la historia (al mantener presionado).
   */
  const pause = useCallback(() => {
    if (!isPaused) {
      clearTimers();
      pausedProgressRef.current = progress;
      setIsPaused(true);
    }
  }, [isPaused, progress, clearTimers]);

  /**
   * Reanuda la historia.
   */
  const resume = useCallback(() => {
    if (isPaused) {
      setIsPaused(false);
      startTimer(pausedProgressRef.current);
    }
  }, [isPaused, startTimer]);

  // Iniciar temporizador cuando cambia el índice o se abre
  useEffect(() => {
    if (isOpen && !isPaused) {
      startTimer(0);
    }
    return clearTimers;
  }, [isOpen, currentIndex, isPaused, startTimer, clearTimers]);

  return {
    isOpen,
    currentIndex,
    currentStory: stories[currentIndex] || null,
    progress,
    isPaused,
    openViewer,
    closeViewer,
    goToNext,
    goToPrevious,
    pause,
    resume,
  };
}
