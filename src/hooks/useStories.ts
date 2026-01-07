import { useState, useEffect, useCallback } from 'react';
import { Story } from '../types';
import { getStories, saveStory, deleteStory } from '../utils/storage';
import { processImage } from '../utils/imageUtils';

/**
 * Hook personalizado para manejar el estado de las historias.
 * 
 * EXPLICACIÓN PEDAGÓGICA:
 * Este hook encapsula toda la lógica de:
 * - Cargar historias desde LocalStorage
 * - Agregar nuevas historias
 * - Eliminar historias expiradas
 * - Verificar expiración periódicamente
 */
export function useStories() {
  const [stories, setStories] = useState<Story[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Cargar historias al montar el componente
  const loadStories = useCallback(() => {
    const validStories = getStories();
    setStories(validStories);
  }, []);

  useEffect(() => {
    loadStories();
    
    // Verificar expiración cada minuto
    const interval = setInterval(loadStories, 60000);
    
    return () => clearInterval(interval);
  }, [loadStories]);

  /**
   * Agrega una nueva historia a partir de un archivo de imagen.
   */
  const addStory = useCallback(async (file: File) => {
    setIsLoading(true);
    setError(null);
    
    try {
      // 1. Procesar y redimensionar imagen
      const imageBase64 = await processImage(file);
      
      // 2. Guardar en LocalStorage
      const newStory = saveStory(imageBase64);
      
      // 3. Actualizar estado local
      setStories(prev => [newStory, ...prev]);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error desconocido';
      setError(message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Elimina una historia manualmente.
   */
  const removeStory = useCallback((storyId: string) => {
    deleteStory(storyId);
    setStories(prev => prev.filter(s => s.id !== storyId));
  }, []);

  return {
    stories,
    isLoading,
    error,
    addStory,
    removeStory,
    refreshStories: loadStories,
  };
}
