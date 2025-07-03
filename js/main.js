/**
 * Main Application - Orchestration principale
 */
class WarframeApp {
    constructor() {
        this.allItems = [];
        this.currentItems = [];
        this.displayedItems = 0;
        this.itemsPerPage = 30;
        this.isLoading = false;
        this.intersectionObserver = null;
    }

    /**
     * Initialise l'application
     */
    async initialize() {
        try {
            // Initialiser les gestionnaires
            await this.initializeManagers();
            
            // Configurer les event listeners
            this.setupEventListeners();
            
            // Charger les données initiales
            await this.loadInitialData();
            
            // Configurer le scroll infini
            this.setupInfiniteScroll();
            
            console.log('Warframe Build Optimizer initialized successfully');
        } catch (error) {
            console.error('Failed to initialize application:', error);
            this.showError('Failed to initialize application. Please refresh the page.');
        }
    }

    /**
     * Initialise tous les gestionnaires
     */
    async initializeManagers() {
        // Initialiser le système de traduction
        if (window.translationManager) {
            await window.translationManager.initialize();
        }

        // Initialiser l'UI Manager
        if (window.uiManager) {
            window.uiManager.updateLanguageSelector();
        }

        // Initialiser l'Optimization Manager
        if (window.optimizationManager) {
            window.optimizationManager.initialize();
        }
    }

    /**
     * Configure les event listeners principaux
     */
    setupEventListeners() {
        // Changement de langue
        document.addEventListener('languageChanged', async (e) => {
            await this.handleLanguageChange(e.detail.language);
        });

        // Changement de catégorie
        document.addEventListener('categoryChanged', (e) => {
            this.loadCategory(e.detail.category);
        });

        // Recherche
        const searchInput = document.getElementById('searchInput');
        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                this.handleSearch(e.target.value);
            });
        }

        // Bouton de rafraîchissement des données
        const refreshButton = document.getElementById('refreshData');
        if (refreshButton) {
            refreshButton.addEventListener('click', () => {
                this.refreshData();
            });
        }

        // Gestion des erreurs globales
        window.addEventListener('error', (e) => {
            console.error('Global error:', e.error);
        });

        window.addEventListener('unhandledrejection', (e) => {
            console.error('Unhandled promise rejection:', e.reason);
        });
    }

    /**
     * Charge les données initiales
     */
    async loadInitialData() {
        this.setLoading(true);
        
        try {
            const language = window.translationManager ? 
                window.translationManager.currentLanguage : 'en';
            
            this.allItems = await window.warframeAPI.fetchAllItems(language);
            
            // Mettre à jour les compteurs de catégories
            this.updateCategoryCounts();
            
            // Charger la catégorie par défaut
            this.loadCategory('warframes');
            
            // Mettre à jour l'optimiseur avec les nouvelles données
            if (window.optimizationManager) {
                window.optimizationManager.updateItems(this.allItems);
            }
            
            // Mettre à jour la date de dernière mise à jour
            const lastUpdateEl = document.getElementById('lastUpdate');
            if (lastUpdateEl) {
                lastUpdateEl.textContent = new Date().toLocaleString();
            }
            
        } catch (error) {
            console.error('Failed to load initial data:', error);
            this.showError('Failed to load data from Warframe API');
        } finally {
            this.setLoading(false);
        }
    }

    /**
     * Gère le changement de langue
     */
    async handleLanguageChange(language) {
        this.setLoading(true);
        
        try {
            // Recharger les données dans la nouvelle langue
            this.allItems = await window.warframeAPI.fetchAllItems(language);
            
            // Mettre à jour les compteurs
            this.updateCategoryCounts();
            
            // Recharger la catégorie actuelle
            const currentCategory = window.uiManager ? 
                window.uiManager.currentCategory : 'warframes';
            this.loadCategory(currentCategory);
            
            // Mettre à jour l'optimiseur
            if (window.optimizationManager) {
                window.optimizationManager.updateItems(this.allItems);
            }
            
            // Mettre à jour les options des selects
            this.updateSelectOptions();
            
        } catch (error) {
            console.error('Failed to handle language change:', error);
            this.showError('Failed to load data in the selected language');
        } finally {
            this.setLoading(false);
        }
    }

    /**
     * Met à jour les compteurs de catégories
     */
    updateCategoryCounts() {
        const categories = ['warframes', 'primary', 'secondary', 'melee', 'mods', 'arcanes', 'misc'];
        
        categories.forEach(category => {
            const count = window.warframeAPI.filterByCategory(this.allItems, category).length;
            const element = document.getElementById(`${category}-count`);
            if (element) {
                element.textContent = count;
            }
        });
    }

    /**
     * Charge une catégorie d'items
     */
    loadCategory(category) {
        this.currentItems = window.warframeAPI.filterByCategory(this.allItems, category);
        this.displayedItems = 0;
        
        // Mettre à jour le titre de la catégorie
        this.updateCategoryTitle(category);
        
        // Vider le conteneur
        const container = document.getElementById('itemsContainer');
        if (container) {
            container.innerHTML = '';
        }
        
        // Charger le premier lot d'items
        this.loadMoreItems();
    }

    /**
     * Met à jour le titre de la catégorie
     */
    updateCategoryTitle(category) {
        const titleElement = document.getElementById('currentCategoryTitle');
        if (titleElement && window.translationManager) {
            const titleKey = `category_${category}`;
            const title = window.translationManager.t(titleKey, 
                window.warframeAPI.capitalizeFirst(category));
            titleElement.textContent = title;
            titleElement.setAttribute('data-i18n-title', titleKey);
        }
    }

    /**
     * Charge plus d'items (scroll infini)
     */
    loadMoreItems() {
        const container = document.getElementById('itemsContainer');
        if (!container) return;
        
        const itemsToLoad = this.currentItems.slice(
            this.displayedItems, 
            this.displayedItems + this.itemsPerPage
        );
        
        itemsToLoad.forEach(item => {
            const itemElement = this.createItemElement(item);
            container.appendChild(itemElement);
        });
        
        this.displayedItems += itemsToLoad.length;
    }

    /**
     * Crée un élément d'item
     */
    createItemElement(item) {
        const div = document.createElement('div');
        div.className = 'item-card rounded-lg p-4 cursor-pointer';
        
        const language = window.translationManager ? 
            window.translationManager.currentLanguage : 'en';
        
        const imageUrl = window.warframeAPI.getImageURL(item.imageName);
        const itemName = window.warframeAPI.getLocalizedName(item, language);
        const itemDescription = window.warframeAPI.getLocalizedDescription(item, language);
        
        div.innerHTML = `
            <div class="flex items-center space-x-3">
                <div class="w-12 h-12 rounded-lg overflow-hidden flex-shrink-0">
                    ${imageUrl ? 
                        `<img src="${imageUrl}" alt="${itemName}" class="w-full h-full object-cover" 
                             onerror="this.parentElement.innerHTML='<div class=\\'placeholder-image w-full h-full\\'>?</div>'">` :
                        `<div class="placeholder-image w-full h-full"><i class="fas fa-question"></i></div>`
                    }
                </div>
                <div class="flex-1 min-w-0">
                    <h3 class="font-semibold truncate" title="${itemName}">${itemName}</h3>
                    <p class="text-sm text-secondary">${item.type || item.category || 'Unknown'}</p>
                    ${item.masteryReq ? `<p class="text-xs text-secondary">MR: ${item.masteryReq}</p>` : ''}
                    ${itemDescription ? `<p class="text-xs text-secondary truncate" title="${itemDescription}">${itemDescription}</p>` : ''}
                </div>
            </div>
        `;
        
        // Ajouter un tooltip avec les statistiques
        const stats = window.warframeAPI.getItemStats(item);
        if (Object.keys(stats).length > 0) {
            const statsText = Object.entries(stats)
                .map(([key, value]) => `${key}: ${value}`)
                .join('\n');
            div.setAttribute('data-tooltip', statsText);
        }
        
        return div;
    }

    /**
     * Gère la recherche
     */
    handleSearch(query) {
        if (!query || query.length < 2) {
            // Recharger la catégorie actuelle si la recherche est vide
            const currentCategory = window.uiManager ? 
                window.uiManager.currentCategory : 'warframes';
            this.loadCategory(currentCategory);
            return;
        }

        const language = window.translationManager ? 
            window.translationManager.currentLanguage : 'en';
        
        const currentCategory = window.uiManager ? 
            window.uiManager.currentCategory : 'warframes';
        
        const categoryItems = window.warframeAPI.filterByCategory(this.allItems, currentCategory);
        this.currentItems = window.warframeAPI.searchItems(categoryItems, query, language);
        
        this.displayedItems = 0;
        const container = document.getElementById('itemsContainer');
        if (container) {
            container.innerHTML = '';
        }
        
        this.loadMoreItems();
    }

    /**
     * Configure le scroll infini
     */
    setupInfiniteScroll() {
        const trigger = document.getElementById('loadMoreTrigger');
        if (!trigger) return;

        this.intersectionObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting && 
                    this.displayedItems < this.currentItems.length && 
                    !this.isLoading) {
                    this.loadMoreItems();
                }
            });
        }, {
            rootMargin: '100px'
        });

        this.intersectionObserver.observe(trigger);
    }

    /**
     * Met à jour les options des selects
     */
    updateSelectOptions() {
        if (!window.translationManager) return;

        // Content Type
        const contentTypeSelect = document.getElementById('contentType');
        if (contentTypeSelect) {
            const currentValue = contentTypeSelect.value;
            contentTypeSelect.innerHTML = '';
            
            const contentTypes = [
                { value: 'steel-path', key: 'steel-path' },
                { value: 'eso', key: 'eso' },
                { value: 'arbitration', key: 'arbitration' },
                { value: 'archon-hunt', key: 'archon-hunt' },
                { value: 'general', key: 'general' }
            ];
            
            contentTypes.forEach(opt => {
                const option = document.createElement('option');
                option.value = opt.value;
                option.textContent = window.translationManager.t(opt.key, opt.value);
                if (opt.value === currentValue) option.selected = true;
                contentTypeSelect.appendChild(option);
            });
        }

        // Target Faction
        const targetFactionSelect = document.getElementById('targetFaction');
        if (targetFactionSelect) {
            const currentValue = targetFactionSelect.value;
            targetFactionSelect.innerHTML = '';
            
            const factions = [
                { value: 'grineer', key: 'grineer' },
                { value: 'corpus', key: 'corpus' },
                { value: 'infested', key: 'infested' },
                { value: 'sentient', key: 'sentient' },
                { value: 'corrupted', key: 'corrupted' }
            ];
            
            factions.forEach(opt => {
                const option = document.createElement('option');
                option.value = opt.value;
                option.textContent = window.translationManager.t(opt.key, opt.value);
                if (opt.value === currentValue) option.selected = true;
                targetFactionSelect.appendChild(option);
            });
        }
    }

    /**
     * Rafraîchit les données
     */
    async refreshData() {
        // Vider le cache de l'API
        if (window.warframeAPI) {
            window.warframeAPI.clearCache();
        }
        
        // Recharger les données
        await this.loadInitialData();
        
        // Notification
        if (window.uiManager) {
            const message = window.translationManager ? 
                window.translationManager.t('data_refreshed', 'Data refreshed successfully') : 
                'Data refreshed successfully';
            window.uiManager.showNotification(message, 'success');
        }
    }

    /**
     * Définit l'état de chargement
     */
    setLoading(loading) {
        this.isLoading = loading;
        
        const spinner = document.getElementById('loadingSpinner');
        if (spinner) {
            if (loading) {
                spinner.classList.remove('hidden');
            } else {
                spinner.classList.add('hidden');
            }
        }
    }

    /**
     * Affiche une erreur
     */
    showError(message) {
        if (window.uiManager) {
            window.uiManager.showNotification(message, 'error', 5000);
        } else {
            console.error(message);
            alert(message);
        }
    }

    /**
     * Obtient les informations de debug
     */
    getDebugInfo() {
        return {
            itemsLoaded: this.allItems.length,
            currentItems: this.currentItems.length,
            displayedItems: this.displayedItems,
            currentLanguage: window.translationManager ? 
                window.translationManager.currentLanguage : 'unknown',
            currentTheme: window.uiManager ? 
                window.uiManager.currentTheme : 'unknown',
            cacheInfo: window.warframeAPI ? 
                window.warframeAPI.getCacheInfo() : 'unavailable'
        };
    }
}

// Initialisation de l'application au chargement du DOM
document.addEventListener('DOMContentLoaded', async () => {
    try {
        window.warframeApp = new WarframeApp();
        await window.warframeApp.initialize();
    } catch (error) {
        console.error('Failed to start Warframe Build Optimizer:', error);
    }
});

// Exposer des fonctions utiles pour le debug
window.debugWarframe = () => {
    if (window.warframeApp) {
        console.log('Warframe App Debug Info:', window.warframeApp.getDebugInfo());
    }
};
