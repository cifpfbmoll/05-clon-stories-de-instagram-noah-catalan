import React, { useRef } from 'react';

interface AddStoryButtonProps {
  onFileSelect: (file: File) => void;
  isLoading?: boolean;
}

/**
 * Botón "+" para subir nuevas historias.
 * Abre el selector de archivos del sistema.
 * 
 * EXPLICACIÓN PEDAGÓGICA:
 * - Input file está oculto visualmente
 * - Al hacer clic en el botón, activamos el input programáticamente
 * - El evento onChange del input nos da el archivo seleccionado
 */
export const AddStoryButton: React.FC<AddStoryButtonProps> = ({
  onFileSelect,
  isLoading = false,
}) => {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleClick = () => {
    inputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onFileSelect(file);
      // Limpiar input para permitir seleccionar el mismo archivo de nuevo
      e.target.value = '';
    }
  };

  return (
    <div className="flex-shrink-0">
      <button
        onClick={handleClick}
        disabled={isLoading}
        className={`
          w-16 h-16 rounded-full border-2 border-dashed border-gray-400
          flex items-center justify-center
          text-gray-400 text-3xl font-light
          hover:border-white hover:text-white
          transition-colors duration-200
          ${isLoading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
        `}
        aria-label="Subir nueva historia"
      >
        {isLoading ? (
          <svg
            className="animate-spin h-6 w-6"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
            />
          </svg>
        ) : (
          '+'
        )}
      </button>
      
      {/* Input oculto para seleccionar archivos */}
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        className="hidden"
        aria-hidden="true"
      />
    </div>
  );
};
