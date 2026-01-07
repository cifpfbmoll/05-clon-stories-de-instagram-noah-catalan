[![Review Assignment Due Date](https://classroom.github.com/assets/deadline-readme-button-22041afd0340ce965d47ae6ef1cefeee28c7c493a6346c4f15d667ab976d596c.svg)](https://classroom.github.com/a/n2vQQF73)
# 📱 Instagram Stories Clone

> **Un clon funcional de Instagram Stories construido con React, TypeScript y LocalStorage**

![React](https://img.shields.io/badge/React-18.2-blue)
![TypeScript](https://img.shields.io/badge/TypeScript-5.3-blue)
![Vite](https://img.shields.io/badge/Vite-5.0-purple)
![Tailwind](https://img.shields.io/badge/Tailwind-3.4-cyan)

## 🚀 Demo en Vivo

[Ver Demo](https://maximofernandezriera.github.io/instagram-stories-clone/)

## ✨ Características

- 📸 **Subir imágenes** que se convierten automáticamente a historias
- ⏰ **Expiración de 24 horas** - Las historias desaparecen automáticamente
- ⏱️ **Timer de 3 segundos** por historia con barra de progreso
- 👆 **Gestos táctiles** - Swipe, tap y hold para navegar
- 💾 **Sin backend** - Todo se guarda en LocalStorage
- 📱 **100% Responsive** - Funciona en móvil y desktop
- 🎨 **UI estilo Instagram** - Círculos con gradiente, animaciones fluidas

## 🛠️ Tecnologías

- **Frontend**: React 18 + TypeScript
- **Build Tool**: Vite
- **Estilos**: Tailwind CSS
- **Almacenamiento**: LocalStorage (Browser API)
- **Procesamiento de Imágenes**: Canvas API + FileReader

## 📦 Instalación

```bash
# Clonar repositorio
git clone https://github.com/maximofernandezriera/instagram-stories-clone.git
cd instagram-stories-clone

# Instalar dependencias
npm install

# Iniciar servidor de desarrollo
npm run dev
```

## 🏗️ Estructura del Proyecto

```
src/
├── components/          # Componentes UI
│   ├── StoryList.tsx   # Lista horizontal de historias
│   ├── StoryViewer.tsx # Visor fullscreen
│   └── ProgressBar.tsx # Barras de progreso animadas
├── hooks/              # Custom Hooks
│   ├── useStories.ts   # Gestión de historias
│   └── useStoryViewer.ts # Control del visor
├── utils/              # Utilidades
│   ├── storage.ts      # LocalStorage + expiración
│   └── imageUtils.ts   # Procesamiento de imágenes
└── types/              # Tipos TypeScript
```

## 📚 Documentación

### Para Desarrolladores Junior

- 📖 **[CLASE MAGISTRAL](docs/CLASE_MAGISTRAL.md)** - Tutorial completo paso a paso
- 📝 **[Bitácora de Desarrollo](docs/bitacora.md)** - Proceso de desarrollo detallado

### Conceptos Clave Explicados

1. **FileReader API** - Cómo convertir archivos a Base64
2. **Canvas API** - Redimensionar y comprimir imágenes
3. **LocalStorage** - Persistencia sin backend
4. **React Hooks** - useState, useEffect, useCallback, useRef
5. **Gestión de Timers** - Sincronización de animaciones
6. **Detección de Gestos** - Touch events y swipe

## 🎮 Cómo Usar

### Subir una Historia
1. Click en el botón "+" 
2. Selecciona una imagen
3. La imagen se procesa y aparece en la lista

### Ver Historias
- **Click** en cualquier historia para verla
- **Tap izquierdo** (25% pantalla): Historia anterior
- **Tap derecho** (75% pantalla): Historia siguiente
- **Swipe horizontal**: Navegar entre historias
- **Mantener presionado**: Pausar historia
- **Teclas ←/→**: Navegar (desktop)
- **ESC**: Cerrar visor

## 🔧 Configuración Técnica

### Límites
- **Tamaño máximo imagen**: 1080x1920px (se redimensiona automáticamente)
- **Almacenamiento**: ~5MB (límite de LocalStorage)
- **Duración historia**: 24 horas
- **Timer por historia**: 3 segundos

### Optimizaciones
- Compresión JPEG al 85%
- Redimensionado automático
- Limpieza automática de historias expiradas
- Animaciones a 60fps

## 🐛 Problemas Conocidos y Soluciones

### "Las historias no avanzan"
**Solución aplicada**: Fix de stale closure en `useStoryViewer` usando refs

### "Storage lleno"
**Solución**: Las imágenes se comprimen automáticamente. Límite ~25 historias

### "Memory leaks"
**Solución**: Limpieza de timers en cleanup de useEffect

## 🚀 Deploy

### GitHub Pages
```bash
npm run build
gh pages deploy dist
```

### Vercel/Netlify
Compatible con deploy automático desde GitHub

## 📄 Licencia

MIT - Proyecto educativo de código abierto

## 🤝 Contribuciones

¡Las contribuciones son bienvenidas! 

1. Fork el proyecto
2. Crea tu feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add: nueva característica'`)
4. Push a la branch (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 📧 Contacto

Máximo Fernández Riera - [GitHub](https://github.com/maximofernandezriera)

---

⭐ **Si te gustó este proyecto, dale una estrella!**

🎓 **Perfecto para aprender**: React, TypeScript, APIs del navegador, y más.
