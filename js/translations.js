/**
 * Translation System - Gestion complète des traductions
 * Système hybride : API Warframe + fichiers locaux
 */
class TranslationManager {
    constructor() {
        this.currentLanguage = 'en';
        this.translations = {};
        this.apiLanguages = ['en', 'fr', 'de', 'es', 'it', 'ja', 'ko', 'pl', 'pt', 'ru', 'zh', 'uk'];
        this.fallbackLanguage = 'en';
    }

    /**
     * Charge les traductions pour une langue donnée
     */
    async loadTranslations(language) {
        try {
            const response = await fetch(`locales/${language}.json`);
            if (!response.ok) throw new Error('Translation file not found');
            this.translations[language] = await response.json();
            return this.translations[language];
        } catch (error) {
            console.warn(`Could not load translations for ${language}, falling back to ${this.fallbackLanguage}`);
            if (language !== this.fallbackLanguage) {
                return await this.loadTranslations(this.fallbackLanguage);
            }
            return {};
        }
    }

    /**
     * Change la langue active
     */
    async setLanguage(language) {
        if (!this.apiLanguages.includes(language)) {
            console.warn(`Language ${language} not supported, using ${this.fallbackLanguage}`);
            language = this.fallbackLanguage;
        }

        this.currentLanguage = language;
        localStorage.setItem('warframe-language', language);

        // Charger les traductions si pas déjà en cache
        if (!this.translations[language]) {
            await this.loadTranslations(language);
        }

        // Mettre à jour l'interface
        this.updateInterface();
        
        return language;
    }

    /**
     * Obtient une traduction
     */
    t(key, fallback = null) {
        const current = this.translations[this.currentLanguage];
        if (current && current[key]) {
            return current[key];
        }

        // Fallback vers l'anglais
        const fallbackTrans = this.translations[this.fallbackLanguage];
        if (fallbackTrans && fallbackTrans[key]) {
            return fallbackTrans[key];
        }

        return fallback || key;
    }

    /**
     * Met à jour tous les éléments traduits de l'interface
     */
    updateInterface() {
        // Textes avec data-i18n
        document.querySelectorAll('[data-i18n]').forEach(el => {
            const key = el.getAttribute('data-i18n');
            const translation = this.t(key);
            if (el.tagName === 'INPUT' && el.type === 'text') {
                el.placeholder = translation;
            } else {
                // Préserver les icônes : ne remplacer que le texte, pas les éléments enfants
                const iconElements = el.querySelectorAll('i, .fas, .far, .fab');
                if (iconElements.length > 0) {
                    // Si l'élément contient des icônes, chercher le span de texte
                    const textSpan = el.querySelector('span[data-i18n]') || el.querySelector('span:not([class*="fa"])');
                    if (textSpan) {
                        textSpan.textContent = translation;
                    } else {
                        // Créer un nœud texte après les icônes
                        const textNodes = Array.from(el.childNodes).filter(node => node.nodeType === Node.TEXT_NODE);
                        if (textNodes.length > 0) {
                            textNodes[textNodes.length - 1].textContent = ' ' + translation;
                        }
                    }
                } else {
                    // Pas d'icônes, remplacer normalement
                    el.textContent = translation;
                }
            }
        });

        // Tooltips avec data-i18n-title
        document.querySelectorAll('[data-i18n-title]').forEach(el => {
            const key = el.getAttribute('data-i18n-title');
            const translation = this.t(key);
            el.title = translation;
        });

        // Attributs spéciaux
        document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
            const key = el.getAttribute('data-i18n-placeholder');
            el.placeholder = this.t(key);
        });

        document.querySelectorAll('[data-i18n-aria-label]').forEach(el => {
            const key = el.getAttribute('data-i18n-aria-label');
            el.setAttribute('aria-label', this.t(key));
        });
    }

    /**
     * Obtient la liste des langues supportées avec leurs noms natifs
     */
    getSupportedLanguages() {
        return [
            { code: 'en', name: 'English', native: 'English' },
            { code: 'fr', name: 'French', native: 'Français' },
            { code: 'de', name: 'German', native: 'Deutsch' },
            { code: 'es', name: 'Spanish', native: 'Español' },
            { code: 'it', name: 'Italian', native: 'Italiano' },
            { code: 'ja', name: 'Japanese', native: '日本語' },
            { code: 'ko', name: 'Korean', native: '한국어' },
            { code: 'pl', name: 'Polish', native: 'Polski' },
            { code: 'pt', name: 'Portuguese', native: 'Português' },
            { code: 'ru', name: 'Russian', native: 'Русский' },
            { code: 'zh', name: 'Chinese', native: '中文' },
            { code: 'uk', name: 'Ukrainian', native: 'Українська' }
        ];
    }

    /**
     * Initialise le système de traduction
     */
    async initialize() {
        const savedLanguage = localStorage.getItem('warframe-language') || 'en';
        await this.setLanguage(savedLanguage);
        return this.currentLanguage;
    }
}

// Instance globale
window.translationManager = new TranslationManager();
