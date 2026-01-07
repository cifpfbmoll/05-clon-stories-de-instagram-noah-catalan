import { Story } from '../types';

const STORAGE_KEY = 'instagram_stories';
const TWENTY_FOUR_HOURS_MS = 24 * 60 * 60 * 1000;

/**
 * Obtiene todas las historias de LocalStorage.
 * Filtra automáticamente las historias que tienen más de 24 horas.
 * 
 * EXPLICACIÓN PEDAGÓGICA:
 * 1. Leemos el string JSON de LocalStorage
 * 2. Lo parseamos a un array de objetos Story
 * 3. Filtramos las historias cuyo timestamp sea menor a 24h
 * 4. Guardamos de nuevo solo las válidas (limpieza automática)
 */
export function getStories(): Story[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return [];
    
    const stories: Story[] = JSON.parse(stored);
    const now = Date.now();
    
    // Filtrar historias que NO han expirado (menos de 24 horas)
    const validStories = stories.filter(story => {
      const age = now - story.createdAt;
      return age < TWENTY_FOUR_HOURS_MS;
    });
    
    // Si hubo historias eliminadas, actualizar LocalStorage
    if (validStories.length !== stories.length) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(validStories));
    }
    
    return validStories;
  } catch (error) {
    console.error('Error leyendo historias:', error);
    return [];
  }
}

/**
 * Guarda una nueva historia en LocalStorage.
 * 
 * EXPLICACIÓN PEDAGÓGICA:
 * 1. Obtenemos las historias existentes (ya filtradas)
 * 2. Creamos un objeto Story con ID único basado en timestamp
 * 3. Agregamos la nueva historia al principio del array
 * 4. Convertimos a JSON y guardamos
 */
export function saveStory(imageBase64: string): Story {
  const stories = getStories();
  
  const newStory: Story = {
    id: `story_${Date.now()}`,
    imageBase64,
    createdAt: Date.now(),
  };
  
  // Insertar al principio para que aparezca primero
  const updatedStories = [newStory, ...stories];
  
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedStories));
  } catch (error) {
    // LocalStorage puede lanzar error si está lleno (~5MB límite)
    console.error('Error guardando historia:', error);
    throw new Error('No se pudo guardar la historia. El almacenamiento puede estar lleno.');
  }
  
  return newStory;
}

/**
 * Elimina una historia específica por su ID.
 */
export function deleteStory(storyId: string): void {
  const stories = getStories();
  const filteredStories = stories.filter(s => s.id !== storyId);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(filteredStories));
}

/**
 * Calcula el tiempo restante antes de que una historia expire.
 * @returns Objeto con horas, minutos y segundos restantes
 */
export function getTimeRemaining(createdAt: number): { hours: number; minutes: number; seconds: number } {
  const expiresAt = createdAt + TWENTY_FOUR_HOURS_MS;
  const remaining = Math.max(0, expiresAt - Date.now());
  
  const hours = Math.floor(remaining / (1000 * 60 * 60));
  const minutes = Math.floor((remaining % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((remaining % (1000 * 60)) / 1000);
  
  return { hours, minutes, seconds };
}
