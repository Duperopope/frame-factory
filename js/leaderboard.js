/**
 * Leaderboard Manager - Système de classement partagé via GitHub
 */
class LeaderboardManager {
    constructor() {
        this.leaderboardUrl = 'data/leaderboard.json';
        this.sessionId = this.generateSessionId();
        this.cache = null;
        this.lastFetch = 0;
        this.cacheTimeout = 30000; // 30 secondes
        this.updateInterval = null;
        this.pendingBuilds = [];
    }

    /**
     * Génère un ID de session unique
     */
    generateSessionId() {
        return 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }

    /**
     * Charge le leaderboard depuis GitHub
     */
    async loadLeaderboard(forceRefresh = false) {
        const now = Date.now();
        
        // Utiliser le cache si disponible et récent
        if (!forceRefresh && this.cache && (now - this.lastFetch) < this.cacheTimeout) {
            return this.cache;
        }

        try {
            const response = await fetch(this.leaderboardUrl + '?t=' + now);
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }
            
            const data = await response.json();
            this.cache = data;
            this.lastFetch = now;
            
            console.log('📊 Leaderboard chargé:', data.totalBuilds, 'builds');
            return data;
        } catch (error) {
            console.error('❌ Erreur lors du chargement du leaderboard:', error);
            
            // Retourner le cache si disponible
            if (this.cache) {
                console.warn('🔄 Utilisation du cache local');
                return this.cache;
            }
            
            // Retourner une structure vide
            return {
                version: "1.0.0",
                totalBuilds: 0,
                builds: [],
                stats: { totalOptimizations: 0, averageScore: 0, topScore: 0, uniqueUsers: 0 }
            };
        }
    }

    /**
     * Ajoute un build au leaderboard local (en attente de synchronisation)
     */
    addBuild(build) {
        if (!this.validateBuild(build)) {
            console.error('❌ Build invalide:', build);
            return false;
        }

        const buildEntry = {
            id: this.generateBuildId(),
            sessionId: this.sessionId,
            timestamp: Date.now(),
            score: build.score || 0,
            warframe: build.warframe || 'Unknown',
            primary: build.primary || null,
            secondary: build.secondary || null,
            melee: build.melee || null,
            mods: build.mods || [],
            arcanes: build.arcanes || [],
            config: {
                contentType: build.contentType || 'general',
                enemyLevel: build.enemyLevel || 150,
                faction: build.faction || 'mixed'
            },
            stats: build.stats || {},
            user: {
                id: this.getUserId(),
                anonymous: true
            }
        };

        this.pendingBuilds.push(buildEntry);
        
        // Mettre à jour le cache local
        if (this.cache) {
            this.cache.builds.push(buildEntry);
            this.cache.builds.sort((a, b) => b.score - a.score);
            
            // Limiter à maxBuilds
            const maxBuilds = this.cache.metadata?.maxBuilds || 1000;
            if (this.cache.builds.length > maxBuilds) {
                this.cache.builds = this.cache.builds.slice(0, maxBuilds);
            }
            
            this.cache.totalBuilds = this.cache.builds.length;
            this.updateStats();
        }

        console.log('✅ Build ajouté au leaderboard local:', buildEntry);
        
        // Déclencher l'événement de mise à jour
        this.dispatchLeaderboardUpdate();
        
        return buildEntry;
    }

    /**
     * Valide un build avant ajout
     */
    validateBuild(build) {
        return (
            build &&
            typeof build === 'object' &&
            typeof build.score === 'number' &&
            build.score >= 0 &&
            build.warframe &&
            typeof build.warframe === 'string'
        );
    }

    /**
     * Met à jour les statistiques du leaderboard
     */
    updateStats() {
        if (!this.cache || !this.cache.builds) return;

        const builds = this.cache.builds;
        const scores = builds.map(b => b.score).filter(s => s > 0);
        
        this.cache.stats = {
            totalOptimizations: builds.length,
            averageScore: scores.length > 0 ? scores.reduce((a, b) => a + b, 0) / scores.length : 0,
            topScore: scores.length > 0 ? Math.max(...scores) : 0,
            uniqueUsers: new Set(builds.map(b => b.user.id)).size
        };
        
        this.cache.lastUpdated = new Date().toISOString();
    }

    /**
     * Obtient les meilleurs builds par catégorie
     */
    getTopBuilds(category = 'all', limit = 10) {
        if (!this.cache || !this.cache.builds) return [];

        let builds = this.cache.builds;
        
        // Filtrer par catégorie si spécifié
        if (category !== 'all') {
            builds = builds.filter(build => {
                switch (category) {
                    case 'warframe':
                        return build.warframe && !build.primary && !build.secondary && !build.melee;
                    case 'primary':
                        return build.primary;
                    case 'secondary':
                        return build.secondary;
                    case 'melee':
                        return build.melee;
                    case 'mixed':
                        return (build.primary || build.secondary || build.melee);
                    default:
                        return true;
                }
            });
        }
        
        return builds.slice(0, limit);
    }

    /**
     * Recherche des builds
     */
    searchBuilds(query, filters = {}) {
        if (!this.cache || !this.cache.builds) return [];

        const searchTerm = query.toLowerCase();
        let results = this.cache.builds.filter(build => {
            // Recherche textuelle
            const matchesText = !query || 
                build.warframe.toLowerCase().includes(searchTerm) ||
                (build.primary && build.primary.toLowerCase().includes(searchTerm)) ||
                (build.secondary && build.secondary.toLowerCase().includes(searchTerm)) ||
                (build.melee && build.melee.toLowerCase().includes(searchTerm));

            // Filtres
            const matchesFilters = Object.entries(filters).every(([key, value]) => {
                if (!value) return true;
                
                switch (key) {
                    case 'contentType':
                        return build.config.contentType === value;
                    case 'faction':
                        return build.config.faction === value;
                    case 'minScore':
                        return build.score >= value;
                    case 'maxScore':
                        return build.score <= value;
                    default:
                        return true;
                }
            });

            return matchesText && matchesFilters;
        });

        return results.sort((a, b) => b.score - a.score);
    }

    /**
     * Démarre la mise à jour automatique
     */
    startAutoUpdate(interval = 60000) {
        this.stopAutoUpdate();
        
        this.updateInterval = setInterval(async () => {
            try {
                await this.loadLeaderboard(true);
                this.dispatchLeaderboardUpdate();
            } catch (error) {
                console.warn('⚠️ Erreur lors de la mise à jour automatique:', error);
            }
        }, interval);
        
        console.log('🔄 Mise à jour automatique du leaderboard activée');
    }

    /**
     * Arrête la mise à jour automatique
     */
    stopAutoUpdate() {
        if (this.updateInterval) {
            clearInterval(this.updateInterval);
            this.updateInterval = null;
        }
    }

    /**
     * Déclenche un événement de mise à jour
     */
    dispatchLeaderboardUpdate() {
        window.dispatchEvent(new CustomEvent('leaderboardUpdated', {
            detail: {
                leaderboard: this.cache,
                pendingBuilds: this.pendingBuilds.length
            }
        }));
    }

    /**
     * Génère un ID de build unique
     */
    generateBuildId() {
        return 'build_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }

    /**
     * Obtient l'ID utilisateur (anonyme)
     */
    getUserId() {
        let userId = localStorage.getItem('frameFactory_userId');
        if (!userId) {
            userId = 'user_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
            localStorage.setItem('frameFactory_userId', userId);
        }
        return userId;
    }

    /**
     * Exporte les builds en attente pour synchronisation
     */
    exportPendingBuilds() {
        return {
            sessionId: this.sessionId,
            timestamp: Date.now(),
            builds: this.pendingBuilds
        };
    }

    /**
     * Marque les builds comme synchronisés
     */
    markBuildsSynced(buildIds) {
        this.pendingBuilds = this.pendingBuilds.filter(build => 
            !buildIds.includes(build.id)
        );
        console.log('✅ Builds synchronisés:', buildIds.length);
    }

    /**
     * Obtient les statistiques du leaderboard
     */
    getStats() {
        return this.cache?.stats || {
            totalOptimizations: 0,
            averageScore: 0,
            topScore: 0,
            uniqueUsers: 0
        };
    }

    /**
     * Réinitialise le cache
     */
    clearCache() {
        this.cache = null;
        this.lastFetch = 0;
        console.log('🗑️ Cache du leaderboard vidé');
    }
}

// Instance globale
window.leaderboardManager = new LeaderboardManager();

console.log('📊 Gestionnaire de leaderboard initialisé');
