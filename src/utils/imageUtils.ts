const MAX_WIDTH = 1080;
const MAX_HEIGHT = 1920;

/**
 * Redimensiona una imagen manteniendo su proporción.
 * Máximo: 1080x1920 píxeles.
 * 
 * EXPLICACIÓN PEDAGÓGICA:
 * 1. Creamos un elemento Image para cargar el archivo
 * 2. Usamos Canvas para redimensionar
 * 3. Canvas.toDataURL() nos da el Base64
 * 
 * ¿Por qué Canvas?
 * - Es la única forma nativa de manipular imágenes en el navegador
 * - Permite redimensionar sin perder calidad significativa
 * - Genera directamente el formato Base64 que necesitamos
 */
export function processImage(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    // Validar que sea una imagen
    if (!file.type.startsWith('image/')) {
      reject(new Error('El archivo debe ser una imagen'));
      return;
    }

    const reader = new FileReader();
    
    reader.onload = (event) => {
      const img = new Image();
      
      img.onload = () => {
        // Calcular nuevas dimensiones manteniendo proporción
        let { width, height } = img;
        
        // Escalar si excede el máximo
        if (width > MAX_WIDTH || height > MAX_HEIGHT) {
          const widthRatio = MAX_WIDTH / width;
          const heightRatio = MAX_HEIGHT / height;
          const ratio = Math.min(widthRatio, heightRatio);
          
          width = Math.round(width * ratio);
          height = Math.round(height * ratio);
        }
        
        // Crear canvas para redimensionar
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('No se pudo crear el contexto del canvas'));
          return;
        }
        
        // Dibujar imagen redimensionada
        ctx.drawImage(img, 0, 0, width, height);
        
        // Convertir a Base64 (JPEG con 85% calidad para balance tamaño/calidad)
        const base64 = canvas.toDataURL('image/jpeg', 0.85);
        resolve(base64);
      };
      
      img.onerror = () => {
        reject(new Error('Error al cargar la imagen'));
      };
      
      // Cargar imagen desde el resultado del FileReader
      img.src = event.target?.result as string;
    };
    
    reader.onerror = () => {
      reject(new Error('Error al leer el archivo'));
    };
    
    // Leer archivo como Data URL (Base64)
    reader.readAsDataURL(file);
  });
}

/**
 * Genera un thumbnail pequeño para la lista de historias.
 * Tamaño fijo: 64x64 píxeles (cuadrado).
 */
export function generateThumbnail(base64: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    
    img.onload = () => {
      const canvas = document.createElement('canvas');
      const size = 64;
      canvas.width = size;
      canvas.height = size;
      
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        reject(new Error('No se pudo crear el contexto del canvas'));
        return;
      }
      
      // Recortar al centro para hacer cuadrado
      const minDim = Math.min(img.width, img.height);
      const sx = (img.width - minDim) / 2;
      const sy = (img.height - minDim) / 2;
      
      ctx.drawImage(img, sx, sy, minDim, minDim, 0, 0, size, size);
      
      resolve(canvas.toDataURL('image/jpeg', 0.7));
    };
    
    img.onerror = () => reject(new Error('Error generando thumbnail'));
    img.src = base64;
  });
}
