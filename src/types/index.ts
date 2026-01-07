/**
 * Representa una historia en el sistema.
 * @property id - Identificador único (timestamp de creación)
 * @property imageBase64 - Imagen codificada en Base64
 * @property createdAt - Timestamp de cuando se creó la historia
 */
export interface Story {
  id: string;
  imageBase64: string;
  createdAt: number;
}

/**
 * Estado del visor de historias
 */
export interface ViewerState {
  isOpen: boolean;
  currentIndex: number;
  stories: Story[];
}
