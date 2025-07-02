/**
 * UI Manager - Gestion de l'interface utilisateur avec tooltips
 */
class UIManager {
    constructor() {
        this.currentTab = 'optimizer';
        this.currentCategory = 'warframes';
        this.currentTheme = 'light';
        this.tooltipElement = null;
        this.tooltipTimeout = null;
        this.init();
    }

    /**
     * Initialise le gestionnaire UI
     */
    init() {
        this.createTooltipElement();
        this.setupEventListeners();
        this.loadSavedPreferences();
    }

    /**
     * Crée l'élément tooltip
     */
    createTooltipElement() {
        this.tooltipElement = document.createElement('div');
        this.tooltipElement.className = 'custom-tooltip';
        this.tooltipElement.style.cssText = `
            position: absolute;
            z-index: 9999;
            background: var(--bg-secondary);
            border: 1px solid var(--border);
            border-radius: 0.5rem;
            padding: 0.75rem;
            font-size: 0.875rem;
            color: var(--text-secondary);
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
            pointer-events: none;
            opacity: 0;
            transform: translateY(5px);
            transition: all 0.2s ease;
            max-width: 250px;
            word-wrap: break-word;
        `;
        document.body.appendChild(this.tooltipElement);
    }

    /**
     * Configure les event listeners
     */
    setupEventListeners() {
        // Navigation par onglets
        document.addEventListener('click', (e) => {
            const tabButton = e.target.closest('[data-tab]');
            if (tabButton) {
                this.showTab(tabButton.getAttribute('data-tab'));
            }

            const categoryButton = e.target.closest('[data-category]');
            if (categoryButton) {
                this.setActiveCategory(categoryButton.getAttribute('data-category'));
            }
        });

        // Tooltips
        document.addEventListener('mouseover', (e) => {
            this.handleTooltipShow(e);
        });

        document.addEventListener('mouseout', (e) => {
            this.handleTooltipHide(e);
        });

        document.addEventListener('mousemove', (e) => {
            this.updateTooltipPosition(e);
        });

        // Thème
        document.addEventListener('change', (e) => {
            if (e.target.name === 'theme') {
                this.setTheme(e.target.value);
            }
        });

        // Langue
        const languageSelect = document.getElementById('languageSelect');
        if (languageSelect) {
            languageSelect.addEventListener('change', async (e) => {
                await this.setLanguage(e.target.value);
            });
        }
    }

    /**
     * Affiche un onglet
     */
    showTab(tabName) {
        // Masquer tous les onglets
        document.querySelectorAll('.tab-content').forEach(tab => {
            tab.classList.add('hidden');
        });

        // Retirer la classe active de tous les boutons
        document.querySelectorAll('.tab-button').forEach(btn => {
            btn.classList.remove('active');
        });

        // Afficher l'onglet sélectionné
        const targetTab = document.getElementById(tabName);
        if (targetTab) {
            targetTab.classList.remove('hidden');
        }

        // Ajouter la classe active au bouton sélectionné
        const activeButton = document.querySelector(`[data-tab="${tabName}"]`);
        if (activeButton) {
            activeButton.classList.add('active');
        }

        this.currentTab = tabName;
    }

    /**
     * Définit la catégorie active
     */
    setActiveCategory(category) {
        // Retirer l'état actif de tous les boutons de catégorie
        document.querySelectorAll('.category-btn').forEach(btn => {
            btn.classList.remove('bg-accent', 'text-white');
            btn.classList.add('hover:bg-tertiary');
        });

        // Activer le bouton sélectionné
        const activeButton = document.querySelector(`[data-category="${category}"]`);
        if (activeButton) {
            activeButton.classList.add('bg-accent', 'text-white');
            activeButton.classList.remove('hover:bg-tertiary');
        }

        this.currentCategory = category;

        // Déclencher l'événement de changement de catégorie
        document.dispatchEvent(new CustomEvent('categoryChanged', {
            detail: { category }
        }));
    }

    /**
     * Gère l'affichage des tooltips
     */
    handleTooltipShow(e) {
        const element = e.target.closest('[title], [data-tooltip], [data-i18n-title]');
        if (!element) return;

        // Annuler le timeout précédent
        if (this.tooltipTimeout) {
            clearTimeout(this.tooltipTimeout);
        }

        // Délai avant affichage
        this.tooltipTimeout = setTimeout(() => {
            let tooltipText = '';

            // Priorité : data-tooltip > data-i18n-title > title
            if (element.hasAttribute('data-tooltip')) {
                tooltipText = element.getAttribute('data-tooltip');
            } else if (element.hasAttribute('data-i18n-title')) {
                const key = element.getAttribute('data-i18n-title');
                tooltipText = window.translationManager ? 
                    window.translationManager.t(key) : 
                    element.title || key;
            } else {
                tooltipText = element.title;
            }

            if (tooltipText && tooltipText.trim()) {
                this.showTooltip(tooltipText, e);
                // Masquer le tooltip natif
                element.setAttribute('data-original-title', element.title);
                element.title = '';
            }
        }, 500);
    }

    /**
     * Gère le masquage des tooltips
     */
    handleTooltipHide(e) {
        if (this.tooltipTimeout) {
            clearTimeout(this.tooltipTimeout);
            this.tooltipTimeout = null;
        }

        // Restaurer le titre original
        const element = e.target.closest('[data-original-title]');
        if (element) {
            element.title = element.getAttribute('data-original-title');
            element.removeAttribute('data-original-title');
        }

        this.hideTooltip();
    }

    /**
     * Affiche le tooltip
     */
    showTooltip(text, event) {
        this.tooltipElement.textContent = text;
        this.updateTooltipPosition(event);
        
        // Animation d'apparition
        this.tooltipElement.style.opacity = '1';
        this.tooltipElement.style.transform = 'translateY(0)';
    }

    /**
     * Masque le tooltip
     */
    hideTooltip() {
        this.tooltipElement.style.opacity = '0';
        this.tooltipElement.style.transform = 'translateY(5px)';
    }

    /**
     * Met à jour la position du tooltip
     */
    updateTooltipPosition(event) {
        if (this.tooltipElement.style.opacity === '0') return;

        const tooltip = this.tooltipElement;
        const margin = 10;
        
        // Position de base
        let x = event.clientX + margin;
        let y = event.clientY - tooltip.offsetHeight - margin;

        // Ajustements pour rester dans la fenêtre
        if (x + tooltip.offsetWidth > window.innerWidth) {
            x = event.clientX - tooltip.offsetWidth - margin;
        }
        
        if (y < 0) {
            y = event.clientY + margin;
        }

        tooltip.style.left = `${x}px`;
        tooltip.style.top = `${y}px`;
    }

    /**
     * Définit le thème
     */
    setTheme(theme) {
        this.currentTheme = theme;
        document.body.className = `${theme}-mode`;
        localStorage.setItem('warframe-theme', theme);

        // Mettre à jour les boutons radio
        const lightTheme = document.getElementById('lightTheme');
        const darkTheme = document.getElementById('darkTheme');
        
        if (lightTheme && darkTheme) {
            lightTheme.checked = theme === 'light';
            darkTheme.checked = theme === 'dark';
        }
    }

    /**
     * Définit la langue
     */
    async setLanguage(language) {
        if (window.translationManager) {
            await window.translationManager.setLanguage(language);
            
            // Mettre à jour le sélecteur de langue
            const languageSelect = document.getElementById('languageSelect');
            if (languageSelect) {
                languageSelect.value = language;
            }

            // Déclencher l'événement de changement de langue
            document.dispatchEvent(new CustomEvent('languageChanged', {
                detail: { language }
            }));
        }
    }

    /**
     * Charge les préférences sauvegardées
     */
    loadSavedPreferences() {
        const savedTheme = localStorage.getItem('warframe-theme') || 'light';
        const savedLanguage = localStorage.getItem('warframe-language') || 'en';
        
        this.setTheme(savedTheme);
        
        // La langue sera chargée par le TranslationManager
        const languageSelect = document.getElementById('languageSelect');
        if (languageSelect) {
            languageSelect.value = savedLanguage;
        }
    }

    /**
     * Affiche une notification
     */
    showNotification(message, type = 'info', duration = 3000) {
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            z-index: 10000;
            background: var(--bg-secondary);
            border: 1px solid var(--border);
            border-left: 4px solid var(--accent);
            border-radius: 0.5rem;
            padding: 1rem;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
            transform: translateX(100%);
            transition: transform 0.3s ease;
            max-width: 300px;
        `;
        
        if (type === 'error') {
            notification.style.borderLeftColor = '#ef4444';
        } else if (type === 'success') {
            notification.style.borderLeftColor = '#10b981';
        } else if (type === 'warning') {
            notification.style.borderLeftColor = '#f59e0b';
        }

        notification.textContent = message;
        document.body.appendChild(notification);

        // Animation d'entrée
        setTimeout(() => {
            notification.style.transform = 'translateX(0)';
        }, 100);

        // Suppression automatique
        setTimeout(() => {
            notification.style.transform = 'translateX(100%)';
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            }, 300);
        }, duration);
    }

    /**
     * Met à jour le sélecteur de langue avec toutes les langues supportées
     */
    updateLanguageSelector() {
        const languageSelect = document.getElementById('languageSelect');
        if (!languageSelect || !window.translationManager) return;

        const languages = window.translationManager.getSupportedLanguages();
        languageSelect.innerHTML = '';

        languages.forEach(lang => {
            const option = document.createElement('option');
            option.value = lang.code;
            option.textContent = lang.native;
            languageSelect.appendChild(option);
        });
    }

    /**
     * Obtient l'état actuel de l'UI
     */
    getState() {
        return {
            currentTab: this.currentTab,
            currentCategory: this.currentCategory,
            currentTheme: this.currentTheme
        };
    }
}

// Instance globale
window.uiManager = new UIManager();
