# 📖 Bitácora de Desarrollo: Instagram Stories Clone

> **Objetivo**: Este documento explica paso a paso cómo se construyó el clon de Stories, pensado para que un desarrollador Junior pueda entenderlo y replicarlo.

---

## 📋 Índice

1. [Elección del Stack](#1-elección-del-stack)
2. [Estructura del Proyecto](#2-estructura-del-proyecto)
3. [Manejo de Imágenes con FileReader](#3-manejo-de-imágenes-con-filereader)
4. [Persistencia con LocalStorage](#4-persistencia-con-localstorage)
5. [Lógica de Expiración (24 horas)](#5-lógica-de-expiración-24-horas)
6. [Barra de Progreso y Temporizadores](#6-barra-de-progreso-y-temporizadores)
7. [Navegación y Gestos](#7-navegación-y-gestos)
8. [Retos Encontrados y Soluciones](#8-retos-encontrados-y-soluciones)

---

## 1. Elección del Stack

### ¿Por qué React + TypeScript?

| Tecnología | Justificación |
|------------|---------------|
| **React** | Framework más demandado en el mercado. Su modelo de componentes y hooks facilita separar responsabilidades. Ideal para aprender patrones modernos. |
| **TypeScript** | Añade tipado estático que previene errores comunes. Los IDEs ofrecen mejor autocompletado. Esencial para proyectos profesionales. |
| **Vite** | Bundler ultrarrápido. Hot Module Replacement instantáneo. Configuración mínima comparado con Webpack. |
| **Tailwind CSS** | Utility-first permite prototipar rápido. No hay que inventar nombres de clases. Responsive design integrado. |

### ¿Por qué NO usamos backend?

El requisito era **client-side only**. Esto significa:
- ✅ Todo se ejecuta en el navegador del usuario
- ✅ Los datos se guardan en `LocalStorage`
- ✅ No necesitamos servidor ni base de datos externa
- ⚠️ Limitación: ~5MB de almacenamiento máximo

---

## 2. Estructura del Proyecto

```
stories-clone/
├── docs/
│   └── bitacora.md          # Este archivo
├── src/
│   ├── components/          # Componentes React
│   │   ├── AddStoryButton.tsx
│   │   ├── ProgressBar.tsx
│   │   ├── StoryCircle.tsx
│   │   ├── StoryList.tsx
│   │   └── StoryViewer.tsx
│   ├── hooks/               # Custom hooks
│   │   ├── useStories.ts    # CRUD de historias
│   │   └── useStoryViewer.ts # Control del visor
│   ├── types/
│   │   └── index.ts         # Tipos TypeScript
│   ├── utils/
│   │   ├── imageUtils.ts    # Procesamiento de imágenes
│   │   └── storage.ts       # Operaciones LocalStorage
│   ├── App.tsx
│   ├── main.tsx
│   └── index.css
├── index.html
├── package.json
├── tailwind.config.js
├── tsconfig.json
└── vite.config.ts
```

### Principios de Arquitectura

1. **Separación de responsabilidades**: Cada archivo tiene UN propósito claro
2. **Custom Hooks**: Extraen lógica reutilizable de los componentes
3. **Utils**: Funciones puras sin dependencias de React
4. **Types**: Contratos claros entre módulos

---

## 3. Manejo de Imágenes con FileReader

### ¿Qué es FileReader?

`FileReader` es una API del navegador que permite leer el contenido de archivos seleccionados por el usuario. Es **asíncrono** (usa callbacks o promesas).

### Flujo de Conversión a Base64

```
[Usuario selecciona imagen]
         ↓
[FileReader.readAsDataURL()]
         ↓
[Callback onload recibe el resultado]
         ↓
[Resultado es un string Base64]
         ↓
[Se puede guardar en LocalStorage]
```

### Código Explicado

```typescript
// src/utils/imageUtils.ts

export function processImage(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    // 1. Validar que sea una imagen
    if (!file.type.startsWith('image/')) {
      reject(new Error('El archivo debe ser una imagen'));
      return;
    }

    // 2. Crear instancia de FileReader
    const reader = new FileReader();
    
    // 3. Definir qué hacer cuando termine de leer
    reader.onload = (event) => {
      const img = new Image();
      
      img.onload = () => {
        // 4. Redimensionar si excede el máximo
        let { width, height } = img;
        
        if (width > 1080 || height > 1920) {
          const ratio = Math.min(1080 / width, 1920 / height);
          width = Math.round(width * ratio);
          height = Math.round(height * ratio);
        }
        
        // 5. Usar Canvas para redimensionar
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);
        
        // 6. Convertir a Base64 (JPEG, 85% calidad)
        const base64 = canvas.toDataURL('image/jpeg', 0.85);
        resolve(base64);
      };
      
      // Cargar la imagen desde el resultado de FileReader
      img.src = event.target.result as string;
    };
    
    // 7. Iniciar la lectura del archivo
    reader.readAsDataURL(file);
  });
}
```

### ¿Por qué Canvas para Redimensionar?

- **Única forma nativa**: JavaScript no tiene API de manipulación de imágenes
- **Control de calidad**: `toDataURL` permite elegir formato y compresión
- **Reduce tamaño**: Una imagen de 4MB puede quedar en 200KB

### Formato Base64

```
data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD...
└─────────┬─────────┘ └────────────┬────────────────┘
      Metadata              Datos de la imagen
```

- **Ventaja**: Es un string, se puede guardar en cualquier lugar
- **Desventaja**: ~33% más grande que el binario original

---

## 4. Persistencia con LocalStorage

### ¿Qué es LocalStorage?

Es un almacén de clave-valor en el navegador:
- **Persistente**: Sobrevive al cerrar el navegador
- **Sincrónico**: Bloquea el hilo principal (cuidado con grandes datos)
- **Límite**: ~5-10MB dependiendo del navegador

### Estructura de Datos

```typescript
// src/types/index.ts
interface Story {
  id: string;           // "story_1702656000000"
  imageBase64: string;  // "data:image/jpeg;base64,..."
  createdAt: number;    // 1702656000000 (timestamp)
}
```

Guardamos un **array de Stories** serializado como JSON:

```javascript
// En LocalStorage
{
  "instagram_stories": "[{\"id\":\"story_123\",\"imageBase64\":\"...\",\"createdAt\":123456}]"
}
```

### Operaciones CRUD

```typescript
// src/utils/storage.ts

const STORAGE_KEY = 'instagram_stories';

// CREATE - Guardar nueva historia
export function saveStory(imageBase64: string): Story {
  const stories = getStories(); // Obtener existentes
  
  const newStory: Story = {
    id: `story_${Date.now()}`,
    imageBase64,
    createdAt: Date.now(),
  };
  
  const updated = [newStory, ...stories]; // Insertar al inicio
  localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  
  return newStory;
}

// READ - Obtener todas las historias
export function getStories(): Story[] {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (!stored) return [];
  return JSON.parse(stored);
}

// DELETE - Eliminar una historia
export function deleteStory(storyId: string): void {
  const stories = getStories();
  const filtered = stories.filter(s => s.id !== storyId);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
}
```

---

## 5. Lógica de Expiración (24 horas)

### El Problema

Las historias deben desaparecer 24 horas después de su creación.

### La Solución

**No eliminamos activamente**. En su lugar, **filtramos al leer**:

```typescript
// src/utils/storage.ts

const TWENTY_FOUR_HOURS_MS = 24 * 60 * 60 * 1000; // 86,400,000 ms

export function getStories(): Story[] {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (!stored) return [];
  
  const stories: Story[] = JSON.parse(stored);
  const now = Date.now();
  
  // Filtrar: solo historias de menos de 24 horas
  const validStories = stories.filter(story => {
    const age = now - story.createdAt;
    return age < TWENTY_FOUR_HOURS_MS;
  });
  
  // Limpieza: si hubo expiradas, actualizar storage
  if (validStories.length !== stories.length) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(validStories));
  }
  
  return validStories;
}
```

### ¿Por qué Este Enfoque?

| Alternativa | Problema |
|-------------|----------|
| `setInterval` global | Consume batería, sigue corriendo aunque no uses la app |
| Web Workers | Complejidad innecesaria para este caso |
| **Filtrar al leer** ✅ | Simple, eficiente, limpia cuando es necesario |

### Verificación Periódica

Para actualizar la UI mientras el usuario está en la app:

```typescript
// src/hooks/useStories.ts

useEffect(() => {
  loadStories(); // Carga inicial
  
  // Verificar cada minuto por si expiraron historias
  const interval = setInterval(loadStories, 60000);
  
  return () => clearInterval(interval);
}, []);
```

---

## 6. Barra de Progreso y Temporizadores

### El Desafío

Sincronizar:
1. Una barra que se llena en **exactamente 3 segundos**
2. Un timer que avanza a la siguiente historia al terminar
3. La capacidad de **pausar** al mantener presionado

### Implementación

```typescript
// src/hooks/useStoryViewer.ts

const STORY_DURATION_MS = 3000;

// Referencias para limpiar timers
const timerRef = useRef<number | null>(null);
const progressIntervalRef = useRef<number | null>(null);

const startTimer = useCallback((fromProgress = 0) => {
  // Limpiar timers anteriores
  clearTimers();
  
  const remainingTime = STORY_DURATION_MS * (1 - fromProgress / 100);
  const startTime = Date.now();
  
  // 1. Actualizar barra cada 16ms (~60fps)
  progressIntervalRef.current = setInterval(() => {
    const elapsed = Date.now() - startTime;
    const newProgress = fromProgress + (elapsed / STORY_DURATION_MS) * 100;
    setProgress(Math.min(newProgress, 100));
  }, 16);
  
  // 2. Timer para avanzar a siguiente
  timerRef.current = setTimeout(() => {
    goToNext();
  }, remainingTime);
}, []);
```

### ¿Por qué 16ms?

```
1000ms / 60fps = 16.67ms por frame
```

Actualizar más seguido no tiene sentido (el monitor no lo mostrará).
Actualizar menos seguido se ve "trabado".

### Sincronización de la Barra

```typescript
// src/components/ProgressBar.tsx

{Array.from({ length: total }).map((_, index) => {
  let segmentProgress = 0;
  
  if (index < currentIndex) {
    segmentProgress = 100; // Ya vista
  } else if (index === currentIndex) {
    segmentProgress = progress; // En progreso
  }
  // Futuras = 0%
  
  return (
    <div className="h-[3px] bg-white/30 rounded-full overflow-hidden">
      <div
        className="h-full bg-white"
        style={{ width: `${segmentProgress}%` }}
      />
    </div>
  );
})}
```

---

## 7. Navegación y Gestos

### Modos de Navegación

| Acción | Resultado |
|--------|-----------|
| **Tap izquierdo** (25% de pantalla) | Historia anterior |
| **Tap derecho** (75% de pantalla) | Historia siguiente |
| **Swipe izquierda** | Historia siguiente |
| **Swipe derecha** | Historia anterior |
| **Mantener presionado** | Pausar |
| **Soltar** | Reanudar |
| **Tecla ←** | Historia anterior |
| **Tecla →** | Historia siguiente |
| **Tecla Escape** | Cerrar visor |

### Detección de Swipe

```typescript
// src/components/StoryViewer.tsx

const touchStartX = useRef<number>(0);

const handleTouchStart = (e: TouchEvent) => {
  touchStartX.current = e.touches[0].clientX;
};

const handleTouchEnd = (e: TouchEvent) => {
  const deltaX = e.changedTouches[0].clientX - touchStartX.current;
  
  // Mínimo 50px de desplazamiento para contar como swipe
  if (Math.abs(deltaX) > 50) {
    if (deltaX > 0) {
      onPrevious(); // Swipe derecha
    } else {
      onNext(); // Swipe izquierda
    }
    return;
  }
  
  // Si no fue swipe, es tap
  const tapX = touchStartX.current;
  const threshold = window.innerWidth * 0.25;
  
  tapX < threshold ? onPrevious() : onNext();
};
```

### Detección de "Hold" (Mantener Presionado)

```typescript
const holdTimer = useRef<number | null>(null);
const isHolding = useRef<boolean>(false);

const handleTouchStart = () => {
  // Si mantiene 200ms, es "hold"
  holdTimer.current = setTimeout(() => {
    isHolding.current = true;
    onPause();
  }, 200);
};

const handleTouchEnd = () => {
  clearTimeout(holdTimer.current);
  
  if (isHolding.current) {
    isHolding.current = false;
    onResume();
    return; // No navegar
  }
  
  // Si no estaba en hold, procesar como tap/swipe
};
```

---

## 8. Retos Encontrados y Soluciones

### 🔴 Reto 1: Límite de LocalStorage

**Problema**: LocalStorage tiene ~5MB de límite. Las imágenes Base64 son grandes.

**Solución**:
1. Comprimir imágenes a JPEG 85% calidad
2. Redimensionar a máximo 1080x1920
3. Mostrar error claro si se llena

```typescript
try {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(stories));
} catch (error) {
  throw new Error('Almacenamiento lleno. Elimina algunas historias.');
}
```

### 🔴 Reto 2: Fugas de Memoria (Memory Leaks)

**Problema**: Los `setInterval` y `setTimeout` pueden seguir ejecutándose después de desmontar el componente.

**Solución**: Siempre limpiar en el cleanup de `useEffect`:

```typescript
useEffect(() => {
  const interval = setInterval(loadStories, 60000);
  return () => clearInterval(interval); // ⬅️ LIMPIAR
}, []);
```

### 🔴 Reto 3: Scroll del Body Durante Visor

**Problema**: Al abrir el visor fullscreen, el body seguía siendo scrolleable.

**Solución**:

```typescript
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
```

### 🔴 Reto 4: Animación No Fluida

**Problema**: La barra de progreso se veía "trabada".

**Solución**: 
- Usar `setInterval` de 16ms (60fps) en vez de CSS `transition`
- Calcular progreso basado en tiempo real, no en incrementos fijos

### 🔴 Reto 5: Imágenes Muy Grandes

**Problema**: Fotos de cámara modernas pueden ser 10+ MB.

**Solución**: Pipeline de procesamiento:
1. Cargar imagen en `<img>` temporal
2. Dibujar en `<canvas>` con dimensiones reducidas
3. Exportar con compresión JPEG

---

## 🎯 Próximos Pasos

Para mejorar el proyecto, podrías:

1. **Agregar múltiples usuarios** (simular perfiles)
2. **Implementar IndexedDB** para más almacenamiento
3. **Añadir filtros de imagen** con Canvas
4. **Modo offline** con Service Worker
5. **Tests unitarios** con Vitest

---

## 📚 Recursos de Aprendizaje

- [MDN: FileReader API](https://developer.mozilla.org/es/docs/Web/API/FileReader)
- [MDN: LocalStorage](https://developer.mozilla.org/es/docs/Web/API/Window/localStorage)
- [MDN: Canvas API](https://developer.mozilla.org/es/docs/Web/API/Canvas_API)
- [React Docs: Hooks](https://react.dev/reference/react)
- [Tailwind CSS Docs](https://tailwindcss.com/docs)

---

*Documento creado como parte del ejercicio de desarrollo del Instagram Stories Clone.*
