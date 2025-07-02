# 🚀 FRAME Factory - Advanced Warframe Build Optimizer

[![Live Demo](https://img.shields.io/badge/Live%20Demo-GitHub%20Pages-brightgreen)](https://duperopope.github.io/frame-factory/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

## 🎯 Project Overview

FRAME Factory is a professional, modular Warframe Build Optimizer that combines beautiful design with cutting-edge technology. Built from the ground up with scalability and internationalization in mind.

## ✨ Key Features

### 🏗️ **Complete Modularization**
- **Separated JavaScript into logical modules:**
  - `js/translations.js` - Complete translation system with API language support
  - `js/api.js` - Warframe API management with caching and error handling
  - `js/ui.js` - UI management with advanced tooltip system
  - `js/optimization.js` - Build optimization logic and calculations
  - `js/main.js` - Application orchestration and initialization

### 🌍 **100% Dynamic Translation System**
- **Hybrid translation approach:**
  - Interface elements: Local JSON files
  - Game content: Direct from Warframe API in user's language
- **11 supported languages:** English, Français, Deutsch, Español, Italiano, 한국어, Polski, Português, Русский, Українська, 中文
- **Smart fallback system** with English as default
- **Real-time language switching** without page reload

### 🎨 **Enhanced User Experience**
- **Advanced tooltip system** with hover delays and smooth animations
- **Navigation tab tooltips** showing descriptions on mouseover
- **Responsive design** preserved from original
- **Theme system** (Light/Dark mode) maintained
- **Loading states** and error handling

### 🚀 **Performance & Architecture**
- **Intelligent caching** for API responses (5-minute timeout)
- **Lazy loading** with infinite scroll for large datasets
- **Event-driven architecture** with custom events
- **Error boundaries** and graceful degradation
- **Modular CSS** structure maintained

## 🚀 Getting Started

### Development Server
```bash
# Start local development server
python server.py

# Or use Python's built-in server
python -m http.server 8000

# Open in browser
http://localhost:8000
```

### Features Demonstrated
1. **Multi-language interface** - Switch between 11 languages
2. **Real-time API data** - Live Warframe item database
3. **Advanced tooltips** - Hover over navigation tabs
4. **Optimization simulation** - Complete build optimization workflow
5. **Responsive design** - Works on all screen sizes

## 🎮 Warframe API Integration

### Supported Content Types
- **Warframes** - All playable characters with localized names
- **Primary Weapons** - Complete weapon database
- **Secondary Weapons** - Sidearms and pistols
- **Melee Weapons** - Close combat weapons
- **Mods** - Enhancement modules
- **Arcanes** - Special enhancement items

### Language Support
The application automatically fetches content in the user's selected language:
- Item names and descriptions
- Categories and types
- Statistical information
- All localized using official Warframe translations

## 📁 Project Structure

```
├── index.html                 # Main application entry point
├── js/                       # JavaScript modules
│   ├── main.js              # Application orchestration
│   ├── translations.js      # Translation management
│   ├── api.js              # Warframe API integration
│   ├── ui.js               # UI management & tooltips
│   └── optimization.js     # Build optimization logic
├── css/                     # Stylesheets (preserved)
│   ├── main.css            # Main styles with imports
│   ├── themes.css          # Theme variables
│   └── components.css      # Component styles
├── locales/                 # Translation files
│   ├── en.json             # English (complete)
│   ├── fr.json             # French (complete)
│   └── *.json              # Other languages
├── archives/               # Backup of original files
└── server.py              # Development server with CORS
```

## 🔧 Technical Features

### Translation System
- **Dynamic key-based translation** with `data-i18n` attributes
- **Tooltip translation** with `data-i18n-title` attributes
- **Placeholder translation** with `data-i18n-placeholder` attributes
- **Automatic interface updates** on language change
- **API content localization** using Warframe's official translations

### API Integration
- **Multi-language support** via `?language=` parameter
- **Intelligent caching** with timestamp validation
- **Graceful error handling** with fallbacks
- **Real-time data** from `api.warframestat.us`
- **Image optimization** via CDN

### UI Management
- **Custom tooltip system** replacing native browser tooltips
- **Smooth animations** and transitions
- **Event delegation** for performance
- **State management** across components
- **Notification system** for user feedback

## 🏆 Achievement Summary

✅ **Complete modularization** while preserving interface  
✅ **100% dynamic translation** with 11 languages  
✅ **Advanced tooltip system** with smooth UX  
✅ **Real-time Warframe API integration**  
✅ **Professional error handling** and fallbacks  
✅ **Maintainable code architecture**  
✅ **Performance optimizations** and caching  
✅ **Responsive design** preservation  

## 🎯 Key Benefits

1. **Maintainability** - Clean, modular code structure
2. **Scalability** - Easy to add new features and languages
3. **Performance** - Optimized loading and caching
4. **User Experience** - Smooth, professional interface
5. **Internationalization** - True multi-language support
6. **Developer Experience** - Well-documented, organized codebase

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

**The Warframe Build Optimizer is now a professional, scalable application ready for production use while maintaining the beautiful interface you love!** 🚀
