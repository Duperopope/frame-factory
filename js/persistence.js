/**
 * FRAME Factory - Persistence System
 * Système de persistance pour l'IA et les données utilisateur
 */

class PersistenceManager {
    constructor() {
        this.storageKey = 'frameFactory_data';
        this.version = '0.1.5.0';
        this.data = this.loadData();
        this.autoSaveInterval = null;
        this.contributionWorker = null;
        
        // Initialiser l'auto-sauvegarde
        this.startAutoSave();
        
        // Initialiser la contribution passive
        this.startPassiveContribution();
    }

    /**
     * Charger les données depuis localStorage
     */
    loadData() {
        try {
            const stored = localStorage.getItem(this.storageKey);
            if (stored) {
                const data = JSON.parse(stored);
                
                // Vérifier la version pour migration si nécessaire
                if (data.version !== this.version) {
                    return this.migrateData(data);
                }
                
                console.log('✅ Données persistantes chargées:', data);
                return data;
            }
        } catch (error) {
            console.error('❌ Erreur lors du chargement des données:', error);
        }
        
        // Données par défaut
        return this.getDefaultData();
    }

    /**
     * Données par défaut
     */
    getDefaultData() {
        return {
            version: this.version,
            timestamp: Date.now(),
            user: {
                id: this.generateUserId(),
                contributionScore: 0,
                optimizationsRun: 0,
                buildsCreated: 0
            },
            ai: {
                learnedBuilds: [],
                optimizationHistory: [],
                userPreferences: {},
                performanceMetrics: {
                    averageOptimizationTime: 0,
                    successRate: 0,
                    totalCalculations: 0
                }
            },
            builds: {
                saved: [],
                favorites: [],
                shared: []
            },
            settings: {
                autoSave: true,
                contributePassively: true,
                maxStoredBuilds: 100,
                optimizationTimeout: 30000
            },
            cache: {
                warframeData: null,
                lastApiUpdate: 0,
                optimizationResults: {}
            }
        };
    }

    /**
     * Sauvegarder les données
     */
    saveData(data = null) {
        try {
            const dataToSave = data || this.data;
            dataToSave.timestamp = Date.now();
            
            localStorage.setItem(this.storageKey, JSON.stringify(dataToSave));
            console.log('💾 Données sauvegardées:', dataToSave);
            
            // Émettre un événement pour notifier les autres composants
            window.dispatchEvent(new CustomEvent('dataSaved', { detail: dataToSave }));
            
            return true;
        } catch (error) {
            console.error('❌ Erreur lors de la sauvegarde:', error);
            return false;
        }
    }

    /**
     * Démarrer l'auto-sauvegarde
     */
    startAutoSave() {
        if (this.data.settings.autoSave) {
            this.autoSaveInterval = setInterval(() => {
                this.saveData();
            }, 30000); // Sauvegarde toutes les 30 secondes
            
            console.log('🔄 Auto-sauvegarde activée (30s)');
        }
    }

    /**
     * Arrêter l'auto-sauvegarde
     */
    stopAutoSave() {
        if (this.autoSaveInterval) {
            clearInterval(this.autoSaveInterval);
            this.autoSaveInterval = null;
            console.log('⏹️ Auto-sauvegarde arrêtée');
        }
    }

    /**
     * Démarrer la contribution passive
     */
    startPassiveContribution() {
        if (this.data.settings.contributePassively) {
            // Simuler un worker pour la contribution passive
            this.contributionWorker = setInterval(() => {
                this.processPassiveContribution();
            }, 60000); // Contribution toutes les minutes
            
            console.log('🤝 Contribution passive activée');
        }
    }

    /**
     * Traiter la contribution passive
     */
    processPassiveContribution() {
        // Simuler le calcul de builds en arrière-plan
        const contribution = {
            timestamp: Date.now(),
            buildsCalculated: Math.floor(Math.random() * 10) + 1,
            optimizationScore: Math.random() * 100
        };
        
        this.data.user.contributionScore += contribution.buildsCalculated;
        this.data.ai.performanceMetrics.totalCalculations += contribution.buildsCalculated;
        
        console.log('🔄 Contribution passive:', contribution);
        
        // Sauvegarder automatiquement
        this.saveData();
    }

    /**
     * Ajouter un build optimisé à l'IA
     */
    addOptimizedBuild(build) {
        if (!build || !build.warframe || !build.weapons) {
            console.error('❌ Build invalide pour l\'IA');
            return false;
        }
        
        const aiEntry = {
            id: this.generateBuildId(),
            timestamp: Date.now(),
            build: build,
            score: build.score || 0,
            contentType: build.contentType || 'general',
            enemyLevel: build.enemyLevel || 150,
            faction: build.faction || 'mixed'
        };
        
        this.data.ai.learnedBuilds.push(aiEntry);
        this.data.user.buildsCreated++;
        
        // Limiter le nombre de builds stockés
        if (this.data.ai.learnedBuilds.length > this.data.settings.maxStoredBuilds) {
            this.data.ai.learnedBuilds.shift(); // Supprimer le plus ancien
        }
        
        console.log('🧠 Build ajouté à l\'IA:', aiEntry);
        this.saveData();
        return true;
    }

    /**
     * Obtenir les builds similaires de l'IA
     */
    getSimilarBuilds(criteria) {
        const similar = this.data.ai.learnedBuilds.filter(entry => {
            return (
                (!criteria.contentType || entry.contentType === criteria.contentType) &&
                (!criteria.faction || entry.faction === criteria.faction) &&
                (!criteria.enemyLevel || Math.abs(entry.enemyLevel - criteria.enemyLevel) <= 50)
            );
        });
        
        // Trier par score décroissant
        return similar.sort((a, b) => b.score - a.score);
    }

    /**
     * Mettre à jour les préférences utilisateur
     */
    updateUserPreferences(preferences) {
        this.data.ai.userPreferences = { ...this.data.ai.userPreferences, ...preferences };
        this.saveData();
        console.log('👤 Préférences utilisateur mises à jour:', preferences);
    }

    /**
     * Enregistrer une optimisation
     */
    recordOptimization(optimization) {
        this.data.ai.optimizationHistory.push({
            timestamp: Date.now(),
            duration: optimization.duration,
            combinationsTested: optimization.combinationsTested,
            bestScore: optimization.bestScore,
            success: optimization.success
        });
        
        this.data.user.optimizationsRun++;
        
        // Mettre à jour les métriques de performance
        this.updatePerformanceMetrics();
        
        this.saveData();
        console.log('📊 Optimisation enregistrée:', optimization);
    }

    /**
     * Mettre à jour les métriques de performance
     */
    updatePerformanceMetrics() {
        const history = this.data.ai.optimizationHistory;
        if (history.length === 0) return;
        
        const totalTime = history.reduce((sum, opt) => sum + opt.duration, 0);
        const successCount = history.filter(opt => opt.success).length;
        
        this.data.ai.performanceMetrics.averageOptimizationTime = totalTime / history.length;
        this.data.ai.performanceMetrics.successRate = (successCount / history.length) * 100;
    }

    /**
     * Exporter les données
     */
    exportData() {
        const exportData = {
            ...this.data,
            exportTimestamp: Date.now(),
            exportVersion: this.version
        };
        
        const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `frame-factory-data-${new Date().toISOString().slice(0, 10)}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        console.log('📤 Données exportées');
    }

    /**
     * Importer les données
     */
    importData(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = (e) => {
                try {
                    const importedData = JSON.parse(e.target.result);
                    
                    // Valider les données importées
                    if (this.validateImportedData(importedData)) {
                        this.data = this.migrateData(importedData);
                        this.saveData();
                        console.log('📥 Données importées avec succès');
                        resolve(this.data);
                    } else {
                        reject(new Error('Données importées invalides'));
                    }
                } catch (error) {
                    reject(error);
                }
            };
            reader.readAsText(file);
        });
    }

    /**
     * Valider les données importées
     */
    validateImportedData(data) {
        return (
            data &&
            typeof data === 'object' &&
            data.version &&
            data.user &&
            data.ai &&
            data.builds
        );
    }

    /**
     * Migrer les données d'une ancienne version
     */
    migrateData(oldData) {
        console.log(`🔄 Migration des données de ${oldData.version} vers ${this.version}`);
        
        const newData = this.getDefaultData();
        
        // Préserver les données importantes
        if (oldData.user) {
            newData.user = { ...newData.user, ...oldData.user };
        }
        
        if (oldData.ai) {
            newData.ai = { ...newData.ai, ...oldData.ai };
        }
        
        if (oldData.builds) {
            newData.builds = { ...newData.builds, ...oldData.builds };
        }
        
        return newData;
    }

    /**
     * Générer un ID utilisateur unique
     */
    generateUserId() {
        return 'user_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }

    /**
     * Générer un ID de build unique
     */
    generateBuildId() {
        return 'build_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }

    /**
     * Nettoyer les données (supprimer les anciennes entrées)
     */
    cleanup() {
        const now = Date.now();
        const maxAge = 30 * 24 * 60 * 60 * 1000; // 30 jours
        
        // Nettoyer l'historique d'optimisation
        this.data.ai.optimizationHistory = this.data.ai.optimizationHistory.filter(
            entry => now - entry.timestamp < maxAge
        );
        
        // Nettoyer le cache
        if (this.data.cache.lastApiUpdate && now - this.data.cache.lastApiUpdate > maxAge) {
            this.data.cache.warframeData = null;
            this.data.cache.lastApiUpdate = 0;
        }
        
        this.saveData();
        console.log('🧹 Nettoyage des données effectué');
    }

    /**
     * Obtenir les statistiques
     */
    getStats() {
        return {
            user: this.data.user,
            ai: {
                learnedBuildsCount: this.data.ai.learnedBuilds.length,
                optimizationHistoryCount: this.data.ai.optimizationHistory.length,
                performanceMetrics: this.data.ai.performanceMetrics
            },
            builds: {
                savedCount: this.data.builds.saved.length,
                favoritesCount: this.data.builds.favorites.length,
                sharedCount: this.data.builds.shared.length
            },
            storage: {
                dataSize: JSON.stringify(this.data).length,
                lastSave: this.data.timestamp
            }
        };
    }

    /**
     * Réinitialiser toutes les données
     */
    reset() {
        if (confirm('⚠️ Êtes-vous sûr de vouloir réinitialiser toutes les données ? Cette action est irréversible.')) {
            localStorage.removeItem(this.storageKey);
            this.data = this.getDefaultData();
            this.saveData();
            console.log('🔄 Données réinitialisées');
            
            // Recharger la page
            window.location.reload();
        }
    }
}

// Instance globale
window.persistenceManager = new PersistenceManager();

// Sauvegarder avant de quitter la page
window.addEventListener('beforeunload', () => {
    if (window.persistenceManager) {
        window.persistenceManager.saveData();
    }
});

console.log('💾 Système de persistance initialisé');
