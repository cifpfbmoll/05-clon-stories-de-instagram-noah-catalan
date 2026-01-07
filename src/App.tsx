import React from 'react';
import { useStories } from './hooks/useStories';
import { useStoryViewer } from './hooks/useStoryViewer';
import { StoryList } from './components/StoryList';
import { StoryViewer } from './components/StoryViewer';

/**
 * Componente principal de la aplicación Instagram Stories Clone.
 * 
 * ARQUITECTURA:
 * - useStories: maneja el estado de las historias (CRUD + persistencia)
 * - useStoryViewer: maneja el visor fullscreen (navegación + timers)
 * - StoryList: renderiza la lista horizontal
 * - StoryViewer: renderiza el modal fullscreen
 */
function App() {
  const { stories, isLoading, error, addStory } = useStories();
  const viewer = useStoryViewer(stories);

  const handleAddStory = async (file: File) => {
    try {
      await addStory(file);
    } catch (err) {
      // El error ya se maneja en el hook
      console.error('Error al agregar historia:', err);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Cabecera */}
      <header className="p-4 border-b border-gray-800">
        <h1 className="text-xl font-semibold bg-gradient-to-r from-purple-500 via-red-500 to-yellow-500 bg-clip-text text-transparent">
          Stories
        </h1>
      </header>

      {/* Lista de historias */}
      <StoryList
        stories={stories}
        isLoading={isLoading}
        onAddStory={handleAddStory}
        onStoryClick={viewer.openViewer}
      />

      {/* Error toast */}
      {error && (
        <div className="fixed bottom-4 left-4 right-4 bg-red-600 text-white p-3 rounded-lg text-sm shadow-lg animate-pulse">
          {error}
        </div>
      )}

      {/* Contenido simulado del feed */}
      <main className="p-4">
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-gray-900 rounded-lg p-4">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-full bg-gray-700" />
                <div className="h-4 w-24 bg-gray-700 rounded" />
              </div>
              <div className="h-64 bg-gray-800 rounded-lg mb-3" />
              <div className="space-y-2">
                <div className="h-3 w-3/4 bg-gray-700 rounded" />
                <div className="h-3 w-1/2 bg-gray-700 rounded" />
              </div>
            </div>
          ))}
        </div>
      </main>

      {/* Visor de historias (modal fullscreen) */}
      <StoryViewer
        stories={stories}
        currentIndex={viewer.currentIndex}
        progress={viewer.progress}
        isOpen={viewer.isOpen}
        onClose={viewer.closeViewer}
        onNext={viewer.goToNext}
        onPrevious={viewer.goToPrevious}
        onPause={viewer.pause}
        onResume={viewer.resume}
      />
    </div>
  );
}

export default App;
