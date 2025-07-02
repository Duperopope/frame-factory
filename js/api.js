/**
 * Warframe API Manager - Gestion complète de l'API avec support multilingue
 */
class WarframeAPI {
    constructor() {
        this.baseURL = 'https://api.warframestat.us';
        this.cdnURL = 'https://cdn.warframestat.us/img';
        this.cache = new Map();
        this.cacheTimeout = 5 * 60 * 1000; // 5 minutes
    }

    /**
     * Récupère tous les items avec support de langue
     */
    async fetchAllItems(language = 'en') {
        const cacheKey = `allItems-${language}`;
        const cached = this.cache.get(cacheKey);
        
        // Vérifier le cache
        if (cached && Date.now() - cached.timestamp < this.cacheTimeout) {
            return cached.data;
        }

        try {
            const response = await fetch(`${this.baseURL}/items?language=${language}`);
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }
            
            const items = await response.json();
            
            // Mettre en cache
            this.cache.set(cacheKey, {
                data: items,
                timestamp: Date.now()
            });
            
            return items;
        } catch (error) {
            console.error('Failed to fetch items:', error);
            
            // Fallback vers le cache expiré si disponible
            if (cached) {
                console.warn('Using expired cache data');
                return cached.data;
            }
            
            // Fallback vers l'anglais si ce n'est pas déjà le cas
            if (language !== 'en') {
                console.warn(`Falling back to English for items`);
                return await this.fetchAllItems('en');
            }
            
            return [];
        }
    }

    /**
     * Récupère les données de marché (si disponible)
     */
    async fetchMarketData(language = 'en') {
        const cacheKey = `market-${language}`;
        const cached = this.cache.get(cacheKey);
        
        if (cached && Date.now() - cached.timestamp < this.cacheTimeout) {
            return cached.data;
        }

        try {
            const response = await fetch(`${this.baseURL}/rivens?language=${language}`);
            if (!response.ok) throw new Error('Market data not available');
            
            const data = await response.json();
            this.cache.set(cacheKey, {
                data: data,
                timestamp: Date.now()
            });
            
            return data;
        } catch (error) {
            console.warn('Market data not available:', error);
            return null;
        }
    }

    /**
     * Obtient l'URL d'une image
     */
    getImageURL(imageName) {
        if (!imageName) return null;
        return `${this.cdnURL}/${imageName}`;
    }

    /**
     * Obtient le nom localisé d'un item
     */
    getLocalizedName(item, language = 'en') {
        // Priorité : nom localisé > nom par défaut > 'Unknown'
        if (item.localizedName && item.localizedName[language]) {
            return item.localizedName[language];
        }
        return item.name || 'Unknown';
    }

    /**
     * Obtient la description localisée d'un item
     */
    getLocalizedDescription(item, language = 'en') {
        if (item.localizedDescription && item.localizedDescription[language]) {
            return item.localizedDescription[language];
        }
        return item.description || '';
    }

    /**
     * Filtre les items par catégorie
     */
    filterByCategory(items, category) {
        return items.filter(item => {
            if (category === 'warframes') {
                return item.category === 'Warframes' && !this.isCosmetic(item);
            }
            if (category === 'primary') {
                return item.category === 'Primary' && !this.isCosmetic(item);
            }
            if (category === 'secondary') {
                return item.category === 'Secondary' && !this.isCosmetic(item);
            }
            if (category === 'melee') {
                return item.category === 'Melee' && !this.isCosmetic(item);
            }
            if (category === 'mods') {
                return item.category === 'Mods' && !this.isCosmetic(item);
            }
            if (category === 'arcanes') {
                return item.category === 'Arcanes' && !this.isCosmetic(item);
            }
            if (category === 'misc') {
                return !['Warframes', 'Primary', 'Secondary', 'Melee', 'Mods', 'Arcanes'].includes(item.category);
            }
            return false;
        });
    }

    /**
     * Détermine si un item est cosmétique
     */
    isCosmetic(item) {
        const cosmeticKeywords = [
            'Skin', 'Syandana', 'Sigil', 'Ephemera', 'Armor', 'Helmet',
            'Decoration', 'Glyph', 'Emblem', 'Color', 'Palette'
        ];
        
        return cosmeticKeywords.some(keyword => 
            item.name?.includes(keyword) || 
            item.type?.includes(keyword) ||
            item.productCategory?.includes(keyword) ||
            item.category?.includes(keyword)
        );
    }

    /**
     * Recherche d'items par nom
     */
    searchItems(items, query, language = 'en') {
        if (!query || query.length < 2) return items;
        
        const searchTerm = query.toLowerCase();
        return items.filter(item => {
            const name = this.getLocalizedName(item, language).toLowerCase();
            const description = this.getLocalizedDescription(item, language).toLowerCase();
            const type = (item.type || '').toLowerCase();
            
            return name.includes(searchTerm) || 
                   description.includes(searchTerm) || 
                   type.includes(searchTerm);
        });
    }

    /**
     * Obtient les statistiques d'un item
     */
    getItemStats(item) {
        const stats = {};
        
        if (item.damage) {
            stats.damage = item.damage;
        }
        
        if (item.criticalChance) {
            stats.criticalChance = item.criticalChance;
        }
        
        if (item.criticalMultiplier) {
            stats.criticalMultiplier = item.criticalMultiplier;
        }
        
        if (item.statusChance) {
            stats.statusChance = item.statusChance;
        }
        
        if (item.fireRate) {
            stats.fireRate = item.fireRate;
        }
        
        if (item.masteryReq) {
            stats.masteryReq = item.masteryReq;
        }
        
        return stats;
    }

    /**
     * Vide le cache
     */
    clearCache() {
        this.cache.clear();
    }

    /**
     * Obtient les informations de cache
     */
    getCacheInfo() {
        const info = {};
        for (const [key, value] of this.cache.entries()) {
            info[key] = {
                size: JSON.stringify(value.data).length,
                age: Date.now() - value.timestamp,
                expired: Date.now() - value.timestamp > this.cacheTimeout
            };
        }
        return info;
    }

    /**
     * Capitalise la première lettre
     */
    capitalizeFirst(str) {
        return str.charAt(0).toUpperCase() + str.slice(1);
    }
}

// Instance globale
window.warframeAPI = new WarframeAPI();
