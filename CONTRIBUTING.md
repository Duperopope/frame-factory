# Contributing to FRAME Factory

First off, thank you for considering contributing to FRAME Factory! It's people like you that make FRAME Factory such a great tool for the Warframe community.

## 🎯 Code of Conduct

This project and everyone participating in it is governed by our commitment to creating a welcoming and inclusive environment. By participating, you are expected to uphold this standard.

## 🚀 How Can I Contribute?

### 🐛 Reporting Bugs

Before creating bug reports, please check the existing issues as you might find out that you don't need to create one. When you are creating a bug report, please include as many details as possible using our [bug report template](.github/ISSUE_TEMPLATE/bug_report.md).

### ✨ Suggesting Enhancements

Enhancement suggestions are tracked as GitHub issues. When creating an enhancement suggestion, please use our [feature request template](.github/ISSUE_TEMPLATE/feature_request.md) and include:

- **Clear description** of the enhancement
- **Step-by-step description** of the suggested enhancement
- **Explain why this enhancement would be useful** to most FRAME Factory users
- **Specify which version** of FRAME Factory you're using

### 🔧 Pull Requests

1. Fork the repo and create your branch from `main`
2. If you've added code that should be tested, add tests
3. If you've changed APIs, update the documentation
4. Ensure the test suite passes
5. Make sure your code lints
6. Issue that pull request using our [PR template](.github/pull_request_template.md)

## 🏗️ Development Setup

### Prerequisites

- Modern web browser (Chrome 80+, Firefox 75+, Safari 13+)
- Python 3.6+ (for development server)
- Git

### Local Development

```bash
# Clone your fork
git clone https://github.com/YOUR_USERNAME/frame-factory.git
cd frame-factory

# Start development server
python server.py
# or
python -m http.server 8000

# Open in browser
http://localhost:8000
```

### Project Structure

```
frame-factory/
├── 📄 index.html              # Main application entry
├── 🚀 js/                     # JavaScript modules
│   ├── main.js               # App orchestration
│   ├── translations.js       # i18n system
│   ├── api.js               # API integration
│   ├── ui.js                # UI management
│   ├── optimization.js      # Optimization engine
│   ├── persistence.js       # Data persistence
│   ├── leaderboard.js       # Leaderboard system
│   └── build-manager.js     # Build management
├── 🎨 css/                    # Stylesheets
├── 🌍 locales/                # Translation files
├── 📊 data/                   # Application data
└── ⚙️ .github/workflows/      # CI/CD pipelines
```

## 📝 Coding Standards

### JavaScript

- Use **ES6+ features** where appropriate
- Follow **modular architecture** patterns
- Use **meaningful variable names**
- Add **JSDoc comments** for functions
- Handle **errors gracefully**
- Use **async/await** for asynchronous operations

```javascript
/**
 * Example function with proper documentation
 * @param {string} language - The language code
 * @param {Object} options - Configuration options
 * @returns {Promise<Object>} Translation data
 */
async function loadTranslations(language, options = {}) {
    try {
        // Implementation here
    } catch (error) {
        console.error('Failed to load translations:', error);
        throw error;
    }
}
```

### CSS

- Use **CSS custom properties** for theming
- Follow **BEM methodology** for class naming
- Ensure **responsive design** principles
- Use **semantic class names**

```css
/* Good */
.leaderboard__item--active {
    background-color: var(--color-primary);
}

/* Avoid */
.blue-bg {
    background-color: blue;
}
```

### HTML

- Use **semantic HTML5** elements
- Include **accessibility attributes**
- Use **data-i18n** for translatable content
- Ensure **proper document structure**

```html
<!-- Good -->
<button class="btn btn--primary" data-i18n="start_optimization" aria-label="Start build optimization">
    <i class="fas fa-play" aria-hidden="true"></i>
    <span data-i18n="start_optimization">Start Optimization</span>
</button>
```

## 🌍 Internationalization

### Adding New Languages

1. Create a new JSON file in `locales/` (e.g., `locales/es.json`)
2. Copy the structure from `locales/en.json`
3. Translate all keys to the target language
4. Update `js/translations.js` to include the new language
5. Test the translation thoroughly

### Translation Guidelines

- Keep translations **concise** but **clear**
- Maintain **consistent terminology** throughout
- Consider **cultural context** and gaming terminology
- Test translations with **different text lengths**

## 🧪 Testing

### Manual Testing Checklist

- [ ] Test in multiple browsers (Chrome, Firefox, Safari)
- [ ] Test responsive design on different screen sizes
- [ ] Test with different languages
- [ ] Test Warframe API integration
- [ ] Test optimization functionality
- [ ] Test leaderboard updates
- [ ] Verify accessibility features

### Performance Testing

- [ ] Check page load times
- [ ] Monitor memory usage during long sessions
- [ ] Test with large datasets (16,000+ items)
- [ ] Verify smooth animations and transitions

## 🎮 Warframe-Specific Guidelines

### API Integration

- Always handle **API failures gracefully**
- Implement **proper caching** to reduce API calls
- Support **multiple languages** via API parameters
- Validate **data integrity** from API responses

### Game Data Accuracy

- Verify **item statistics** against in-game values
- Test with **current game version** data
- Consider **game balance changes** in calculations
- Validate **build effectiveness** in actual gameplay

### User Experience

- Design for both **new** and **experienced** players
- Provide **clear explanations** for optimization results
- Support **different playstyles** and content types
- Ensure **fast and responsive** interactions

## 📊 Performance Guidelines

### Optimization Principles

- **Lazy load** large datasets
- Use **event delegation** for better performance
- Implement **intelligent caching** strategies
- **Debounce** user input events
- **Minimize DOM** manipulations

### Memory Management

- Clean up **event listeners** when not needed
- Avoid **memory leaks** in long-running sessions
- Use **efficient data structures**
- **Profile performance** regularly

## 🚀 Deployment

### Automated Deployment

The project uses GitHub Actions for automated deployment:

- **Every push** to `main` triggers deployment
- **Cache busting** ensures immediate updates
- **Error handling** with automatic rollback
- **Performance monitoring** post-deployment

### Manual Deployment

If manual deployment is needed:

```bash
# Ensure all changes are committed
git add .
git commit -m "Your commit message"
git push origin main

# GitHub Actions will handle the rest
```

## 📋 Issue and PR Labels

### Issue Labels

- `bug` - Something isn't working
- `enhancement` - New feature or request
- `documentation` - Improvements or additions to documentation
- `good first issue` - Good for newcomers
- `help wanted` - Extra attention is needed
- `question` - Further information is requested

### Priority Labels

- `priority: critical` - Critical issues that break functionality
- `priority: high` - Important issues that should be addressed soon
- `priority: medium` - Standard priority issues
- `priority: low` - Nice-to-have improvements

## 🏆 Recognition

Contributors will be recognized in:

- **README.md** contributors section
- **CHANGELOG.md** for significant contributions
- **GitHub releases** notes
- **Community highlights** for exceptional contributions

## 📞 Getting Help

- **GitHub Issues** - For bugs and feature requests
- **GitHub Discussions** - For questions and community discussion
- **Documentation** - Check README.md and code comments

## 📄 License

By contributing to FRAME Factory, you agree that your contributions will be licensed under the MIT License.

---

**Thank you for contributing to FRAME Factory! Together, we're building the best Warframe build optimizer for the community.** 🚀

*Built with ❤️ for the Warframe community*
