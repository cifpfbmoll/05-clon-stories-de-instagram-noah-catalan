# 🎓 Clase Magistral: Construyendo un Instagram Stories Clone

> **Duración estimada**: 90 minutos  
> **Nivel**: Junior Developer  
> **Proyecto Final**: Instagram Stories Clone totalmente funcional

---

## 📚 Tabla de Contenidos

1. [Introducción: ¿Qué vamos a construir?](#1-introducción-qué-vamos-a-construir)
2. [Arquitectura del Proyecto](#2-arquitectura-del-proyecto)
3. [Manejo de Imágenes con FileReader y Canvas](#3-manejo-de-imágenes-con-filereader-y-canvas)
4. [Persistencia con LocalStorage](#4-persistencia-con-localstorage)
5. [Custom Hooks: El Cerebro de la App](#5-custom-hooks-el-cerebro-de-la-app)
6. [Componentes React: La UI](#6-componentes-react-la-ui)
7. [Gestión del Tiempo y Animaciones](#7-gestión-del-tiempo-y-animaciones)
8. [Navegación e Interacciones](#8-navegación-e-interacciones)
9. [Problemas Comunes y Soluciones](#9-problemas-comunes-y-soluciones)
10. [Deploy y Próximos Pasos](#10-deploy-y-próximos-pasos)

---

## 1. Introducción: ¿Qué vamos a construir?

### El Reto

Tu jefe te dice: "Necesitamos un clon de Instagram Stories, pero **sin servidor**. Todo debe funcionar en el navegador."

### Requisitos Funcionales
- ✅ Subir imágenes que desaparecen en 24 horas
- ✅ Visor con timer de 3 segundos por historia
- ✅ Navegación táctil (swipe, tap, hold)
- ✅ Todo almacenado localmente

### Stack Tecnológico

```
Frontend:  React 18 + TypeScript + Vite
Estilos:   Tailwind CSS
Storage:   LocalStorage
Deploy:    GitHub Pages
```

---

## 2. Arquitectura del Proyecto

### Diseño en Capas

```
┌─────────────────────────────────────┐
│     CAPA DE PRESENTACIÓN (UI)      │
│  StoryList • StoryViewer • Buttons  │
└──────────────┬──────────────────────┘
               │
┌──────────────▼──────────────────────┐
│      CAPA DE LÓGICA (HOOKS)        │
│  useStories • useStoryViewer       │
└──────────────┬──────────────────────┘
               │
┌──────────────▼──────────────────────┐
│     CAPA DE SERVICIOS (UTILS)      │
│   storage.ts • imageUtils.ts       │
└──────────────┬──────────────────────┘
               │
┌──────────────▼──────────────────────┐
│       APIS DEL NAVEGADOR           │
│  LocalStorage • FileReader • Canvas│
└─────────────────────────────────────┘
```

### Estructura de Carpetas

```bash
src/
├── components/      # UI - Lo que se ve
├── hooks/          # Lógica - El cerebro
├── utils/          # Helpers - Funciones puras
└── types/          # TypeScript - Contratos
```

---

## 3. Manejo de Imágenes con FileReader y Canvas

### El Pipeline Completo

```typescript
// src/utils/imageUtils.ts

export function processImage(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    // PASO 1: Validar que es imagen
    if (!file.type.startsWith('image/')) {
      reject(new Error('Debe ser una imagen'));
      return;
    }

    // PASO 2: Leer archivo
    const reader = new FileReader();
    
    reader.onload = (event) => {
      const img = new Image();
      
      img.onload = () => {
        // PASO 3: Calcular redimensionado
        let { width, height } = img;
        const MAX_WIDTH = 1080;
        const MAX_HEIGHT = 1920;
        
        if (width > MAX_WIDTH || height > MAX_HEIGHT) {
          const ratio = Math.min(
            MAX_WIDTH / width,
            MAX_HEIGHT / height
          );
          width *= ratio;
          height *= ratio;
        }
        
        // PASO 4: Crear canvas
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        
        // PASO 5: Dibujar y exportar
        const ctx = canvas.getContext('2d')!;
        ctx.drawImage(img, 0, 0, width, height);
        
        // Base64 con compresión JPEG
        const base64 = canvas.toDataURL('image/jpeg', 0.85);
        resolve(base64);
      };
      
      img.src = event.target?.result as string;
    };
    
    reader.readAsDataURL(file);
  });
}
```

### Conceptos Clave

**FileReader**: Convierte archivos a formatos legibles
- `readAsDataURL()` → Base64
- `readAsText()` → Texto plano
- `readAsArrayBuffer()` → Binario

**Canvas**: Tu Photoshop en JavaScript
- Redimensionar imágenes
- Aplicar filtros
- Cambiar formato
- Comprimir calidad

**Base64**: Texto que representa imágenes
```
data:image/jpeg;base64,/9j/4AAQ...
└──┬──┘└──┬──┘└──┬──┘ └────┬────┘
  Tipo   MIME  Encoding   Datos
```

---

## 4. Persistencia con LocalStorage

### Sistema CRUD Completo

```typescript
// src/utils/storage.ts

const STORAGE_KEY = 'instagram_stories';
const EXPIRY_TIME = 24 * 60 * 60 * 1000; // 24h

interface Story {
  id: string;
  imageBase64: string;
  createdAt: number;
}

// CREATE
export function saveStory(imageBase64: string): Story {
  const stories = getStories();
  
  const newStory: Story = {
    id: `story_${Date.now()}`,
    imageBase64,
    createdAt: Date.now(),
  };
  
  const updated = [newStory, ...stories];
  
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  } catch (e) {
    if (e.name === 'QuotaExceededError') {
      throw new Error('Storage lleno (5MB límite)');
    }
  }
  
  return newStory;
}

// READ con filtrado automático
export function getStories(): Story[] {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (!stored) return [];
  
  const stories: Story[] = JSON.parse(stored);
  const now = Date.now();
  
  // MAGIA: Filtrar expiradas
  const valid = stories.filter(s => {
    return (now - s.createdAt) < EXPIRY_TIME;
  });
  
  // Limpiar si hubo cambios
  if (valid.length !== stories.length) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(valid));
  }
  
  return valid;
}
```

### El Truco de la Expiración

**NO** usamos timers. **Filtramos al leer**:
- Más eficiente
- No consume batería
- Se auto-limpia

---

## 5. Custom Hooks: El Cerebro de la App

### Hook 1: useStories

```typescript
export function useStories() {
  const [stories, setStories] = useState<Story[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  
  // Cargar al montar
  useEffect(() => {
    const load = () => {
      const valid = getStories();
      setStories(valid);
    };
    
    load();
    // Verificar cada minuto
    const interval = setInterval(load, 60000);
    return () => clearInterval(interval);
  }, []);
  
  // Agregar historia
  const addStory = async (file: File) => {
    setIsLoading(true);
    try {
      const base64 = await processImage(file);
      const story = saveStory(base64);
      setStories(prev => [story, ...prev]);
    } finally {
      setIsLoading(false);
    }
  };
  
  return { stories, isLoading, addStory };
}
```

### Hook 2: useStoryViewer (con fix de stale closure)

```typescript
export function useStoryViewer(stories: Story[]) {
  const [isOpen, setIsOpen] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [progress, setProgress] = useState(0);
  
  const timerRef = useRef<number | null>(null);
  const progressRef = useRef<number | null>(null);
  
  // FIX: Usar ref para evitar stale closure
  const storiesLengthRef = useRef(stories.length);
  storiesLengthRef.current = stories.length;
  
  const clearTimers = () => {
    if (timerRef.current) clearTimeout(timerRef.current);
    if (progressRef.current) clearInterval(progressRef.current);
  };
  
  const goToNext = useCallback(() => {
    setCurrentIndex(prev => {
      const next = prev + 1;
      if (next >= storiesLengthRef.current) {
        setTimeout(() => closeViewer(), 0);
        return prev;
      }
      return next;
    });
    setProgress(0);
  }, []);
  
  const startTimer = useCallback(() => {
    clearTimers();
    const startTime = Date.now();
    
    // Progreso cada 16ms (60fps)
    progressRef.current = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const prog = (elapsed / 3000) * 100;
      setProgress(Math.min(prog, 100));
    }, 16);
    
    // Avanzar después de 3s
    timerRef.current = setTimeout(goToNext, 3000);
  }, [goToNext]);
  
  // Auto-iniciar cuando cambia índice
  useEffect(() => {
    if (isOpen) startTimer();
    return clearTimers;
  }, [isOpen, currentIndex]);
  
  return {
    isOpen,
    currentIndex,
    progress,
    openViewer: (idx: number) => {
      setCurrentIndex(idx);
      setIsOpen(true);
    },
    closeViewer: () => {
      clearTimers();
      setIsOpen(false);
    },
    goToNext,
    goToPrevious: () => setCurrentIndex(Math.max(0, currentIndex - 1)),
  };
}
```

---

## 6. Componentes React: La UI

### StoryList: Lista Horizontal

```tsx
export const StoryList = ({ stories, onAddStory, onStoryClick }) => {
  return (
    <div className="flex gap-4 p-4 overflow-x-auto">
      <AddStoryButton onFileSelect={onAddStory} />
      
      {stories.map((story, idx) => (
        <StoryCircle
          key={story.id}
          story={story}
          onClick={() => onStoryClick(idx)}
        />
      ))}
    </div>
  );
};
```

### StoryCircle: Miniatura con Gradiente

```tsx
export const StoryCircle = ({ story, onClick }) => {
  return (
    <button onClick={onClick}>
      {/* Borde gradiente Instagram */}
      <div 
        className="p-[3px] rounded-full"
        style={{
          background: 'linear-gradient(45deg, #833ab4, #fd1d1d, #fcb045)'
        }}
      >
        <div className="p-[2px] bg-black rounded-full">
          <img 
            src={story.imageBase64}
            className="w-14 h-14 rounded-full object-cover"
          />
        </div>
      </div>
    </button>
  );
};
```

### ProgressBar: Sincronizada con Timer

```tsx
export const ProgressBar = ({ total, currentIndex, progress }) => {
  return (
    <div className="flex gap-1 p-2">
      {Array.from({ length: total }).map((_, i) => {
        let width = 0;
        if (i < currentIndex) width = 100;
        else if (i === currentIndex) width = progress;
        
        return (
          <div className="flex-1 h-1 bg-white/30 rounded">
            <div 
              className="h-full bg-white rounded"
              style={{ width: `${width}%` }}
            />
          </div>
        );
      })}
    </div>
  );
};
```

---

## 7. Gestión del Tiempo y Animaciones

### El Problema de Sincronización

```javascript
// MAL: CSS transition no sincroniza con JS
.progress-bar {
  transition: width 3s linear; ❌
}

// BIEN: Control manual con JS
setInterval(() => {
  const elapsed = Date.now() - startTime;
  const progress = (elapsed / 3000) * 100; ✅
}, 16);
```

### ¿Por qué 16ms?

```
1000ms ÷ 60fps = 16.67ms por frame
```

Actualizar cada 16ms da animación fluida a 60fps.

---

## 8. Navegación e Interacciones

### Detección de Gestos

```typescript
const handleTouchStart = (e: TouchEvent) => {
  startX = e.touches[0].clientX;
  startTime = Date.now();
};

const handleTouchEnd = (e: TouchEvent) => {
  const deltaX = e.changedTouches[0].clientX - startX;
  const deltaTime = Date.now() - startTime;
  
  // Hold (mantener presionado)
  if (deltaTime > 200) {
    onPause();
    return;
  }
  
  // Swipe horizontal
  if (Math.abs(deltaX) > 50) {
    deltaX > 0 ? onPrevious() : onNext();
    return;
  }
  
  // Tap en zonas
  const tapX = startX;
  const threshold = window.innerWidth * 0.25;
  tapX < threshold ? onPrevious() : onNext();
};
```

### Navegación por Teclado

```typescript
useEffect(() => {
  const handleKey = (e: KeyboardEvent) => {
    switch(e.key) {
      case 'ArrowLeft': onPrevious(); break;
      case 'ArrowRight': onNext(); break;
      case 'Escape': onClose(); break;
    }
  };
  
  window.addEventListener('keydown', handleKey);
  return () => window.removeEventListener('keydown', handleKey);
}, []);
```

---

## 9. Problemas Comunes y Soluciones

### Problema 1: Stale Closure

**Síntoma**: El timer no avanza al siguiente story.

**Causa**: Función captura valor antiguo de variable.

**Solución**: Usar `useRef` para valores mutables:
```typescript
const lengthRef = useRef(stories.length);
lengthRef.current = stories.length; // Siempre actualizado
```

### Problema 2: Memory Leaks

**Síntoma**: La app se vuelve lenta con el tiempo.

**Causa**: Timers no limpiados.

**Solución**: Siempre limpiar en cleanup:
```typescript
useEffect(() => {
  const timer = setInterval(...);
  return () => clearInterval(timer); // IMPORTANTE
}, []);
```

### Problema 3: LocalStorage Lleno

**Síntoma**: Error al guardar historias.

**Causa**: Límite de 5MB excedido.

**Solución**: Comprimir imágenes y manejar error:
```typescript
try {
  localStorage.setItem(key, value);
} catch (e) {
  if (e.name === 'QuotaExceededError') {
    alert('Storage lleno, elimina historias antiguas');
  }
}
```

### Problema 4: Imágenes Enormes

**Síntoma**: App crashea con fotos grandes.

**Solución**: Redimensionar con Canvas:
```typescript
canvas.toDataURL('image/jpeg', 0.85); // 85% calidad
```

---

## 10. Deploy y Próximos Pasos

### Deploy con GitHub Pages

```bash
# 1. Crear repositorio
git init
git add .
git commit -m "Initial commit"

# 2. Subir a GitHub
gh repo create stories-clone --public --source=. --push

# 3. Build y deploy
npm run build
gh pages deploy dist
```

### Mejoras Futuras

1. **IndexedDB**: Para más almacenamiento (50MB+)
2. **Service Worker**: Modo offline
3. **WebRTC**: Stories en vivo
4. **Canvas Filters**: Efectos tipo Instagram
5. **Web Share API**: Compartir historias

### Recursos de Aprendizaje

- [MDN Web APIs](https://developer.mozilla.org/es/docs/Web/API)
- [React Docs](https://react.dev)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Tailwind CSS](https://tailwindcss.com)

---

## 🎯 Conclusión

Has construido una aplicación compleja que:
- Manipula imágenes con Canvas
- Gestiona estado con React Hooks
- Persiste datos sin backend
- Sincroniza animaciones con JavaScript
- Maneja gestos táctiles

**¡Felicidades!** Ahora tienes las habilidades para construir aplicaciones web modernas y complejas.

---

*Creado con ❤️ para desarrolladores junior que quieren entender, no solo copiar código.*
