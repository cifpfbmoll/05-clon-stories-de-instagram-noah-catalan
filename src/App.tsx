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
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 text-white">
      {/* Cabecera moderna */}
      <header className="relative p-6 border-b border-gray-700/50 backdrop-blur-sm bg-black/30">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-400 via-pink-500 to-orange-400 bg-clip-text text-transparent">
            ✨ Stories
          </h1>
          <div className="text-xs text-gray-400 font-medium">
            por Noah Catalán Rosell
          </div>
        </div>
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
      <main className="max-w-2xl mx-auto p-4">
        <div className="space-y-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-sm rounded-2xl p-5 border border-gray-700/30 shadow-xl hover:shadow-2xl transition-all duration-300">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-11 h-11 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 animate-pulse" />
                <div className="flex-1">
                  <div className="h-3 w-28 bg-gray-700/50 rounded-full mb-2" />
                  <div className="h-2 w-20 bg-gray-800/50 rounded-full" />
                </div>
              </div>
              <div className="h-72 bg-gradient-to-br from-gray-700/30 to-gray-800/30 rounded-xl mb-4 flex items-center justify-center">
                <span className="text-gray-600 text-sm">📸 Publicación {i}</span>
              </div>
              <div className="space-y-3">
                <div className="h-2.5 w-3/4 bg-gray-700/40 rounded-full" />
                <div className="h-2.5 w-1/2 bg-gray-800/40 rounded-full" />
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
