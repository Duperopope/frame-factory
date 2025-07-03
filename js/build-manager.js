/**
 * Build Manager - Gestionnaire avancé de builds avec interface type Overframe
 */
class BuildManager {
    constructor() {
        this.currentBuild = null;
        this.buildHistory = [];
        this.templates = [];
        this.isOptimizing = false;
        this.optimizationWorkers = [];
        this.maxWorkers = 4;
        this.resultsBuffer = [];
        this.autoSaveInterval = null;
    }

    /**
     * Initialise le gestionnaire de builds
     */
    initialize() {
        this.loadTemplates();
        this.setupEventListeners();
        this.startAutoSave();
        console.log('🔧 Build Manager initialisé');
    }

    /**
     * Crée un nouveau build vide
     */
    createNewBuild() {
        this.currentBuild = {
            id: this.generateBuildId(),
            name: 'Nouveau Build',
            timestamp: Date.now(),
            warframe: null,
            primary: null,
            secondary: null,
            melee: null,
            mods: {
                warframe: Array(10).fill(null),
                primary: Array(8).fill(null),
                secondary: Array(8).fill(null),
                melee: Array(8).fill(null)
            },
            arcanes: {
                warframe: Array(2).fill(null),
                primary: null,
                secondary: null,
                melee: null
            },
            config: {
                contentType: 'general',
                enemyLevel: 150,
                faction: 'mixed',
                simulationCount: 1000000
            },
            stats: {
                ehp: 0,
                dps: 0,
                burstDps: 0,
                sustainedDps: 0,
                score: 0
            },
            notes: '',
            tags: [],
            isTemplate: false,
            isOptimized: false
        };

        this.dispatchBuildUpdate();
        return this.currentBuild;
    }

    /**
     * Charge un build existant
     */
    loadBuild(buildData) {
        if (!buildData || typeof buildData !== 'object') {
            console.error('❌ Données de build invalides');
            return false;
        }

        this.currentBuild = {
            ...this.createNewBuild(),
            ...buildData,
            timestamp: Date.now()
        };

        this.dispatchBuildUpdate();
        console.log('✅ Build chargé:', this.currentBuild.name);
        return true;
    }

    /**
     * Sauvegarde le build actuel
     */
    saveBuild(name = null) {
        if (!this.currentBuild) {
            console.error('❌ Aucun build à sauvegarder');
            return false;
        }

        if (name) {
            this.currentBuild.name = name;
        }

        // Calculer les stats avant sauvegarde
        this.calculateBuildStats();

        // Ajouter à l'historique
        const buildCopy = JSON.parse(JSON.stringify(this.currentBuild));
        this.buildHistory.unshift(buildCopy);

        // Limiter l'historique
        if (this.buildHistory.length > 50) {
            this.buildHistory = this.buildHistory.slice(0, 50);
        }

        // Sauvegarder dans le système de persistance
        if (window.persistenceManager) {
            window.persistenceManager.data.builds.saved.push(buildCopy);
            window.persistenceManager.saveData();
        }

        console.log('💾 Build sauvegardé:', this.currentBuild.name);
        this.dispatchBuildUpdate();
        return true;
    }

    /**
     * Équipe un item (warframe, arme, mod, arcane)
     */
    equipItem(slot, item, subSlot = null) {
        if (!this.currentBuild) {
            this.createNewBuild();
        }

        switch (slot) {
            case 'warframe':
            case 'primary':
            case 'secondary':
            case 'melee':
                this.currentBuild[slot] = item;
                break;

            case 'mod':
                if (subSlot && this.currentBuild.mods[subSlot.category]) {
                    this.currentBuild.mods[subSlot.category][subSlot.index] = item;
                }
                break;

            case 'arcane':
                if (subSlot && this.currentBuild.arcanes[subSlot.category] !== undefined) {
                    if (Array.isArray(this.currentBuild.arcanes[subSlot.category])) {
                        this.currentBuild.arcanes[subSlot.category][subSlot.index] = item;
                    } else {
                        this.currentBuild.arcanes[subSlot.category] = item;
                    }
                }
                break;

            default:
                console.error('❌ Slot invalide:', slot);
                return false;
        }

        // Recalculer les stats
        this.calculateBuildStats();
        this.dispatchBuildUpdate();
        
        console.log('⚡ Item équipé:', slot, item?.name || 'vide');
        return true;
    }

    /**
     * Déséquipe un item
     */
    unequipItem(slot, subSlot = null) {
        return this.equipItem(slot, null, subSlot);
    }

    /**
     * Lance l'optimisation du build actuel
     */
    async startOptimization(config = {}) {
        if (this.isOptimizing) {
            console.warn('⚠️ Optimisation déjà en cours');
            return false;
        }

        if (!this.currentBuild) {
            this.createNewBuild();
        }

        // Mettre à jour la configuration
        this.currentBuild.config = { ...this.currentBuild.config, ...config };

        this.isOptimizing = true;
        this.resultsBuffer = [];

        try {
            console.log('🚀 Démarrage de l\'optimisation...');
            
            // Démarrer les workers d'optimisation
            await this.startOptimizationWorkers();
            
            // Démarrer la mise à jour du leaderboard en temps réel
            this.startRealtimeLeaderboardUpdate();
            
            this.dispatchOptimizationStart();
            return true;
            
        } catch (error) {
            console.error('❌ Erreur lors du démarrage de l\'optimisation:', error);
            this.isOptimizing = false;
            return false;
        }
    }

    /**
     * Arrête l'optimisation
     */
    stopOptimization() {
        if (!this.isOptimizing) return;

        this.isOptimizing = false;
        
        // Arrêter les workers
        this.optimizationWorkers.forEach(worker => {
            if (worker.terminate) {
                worker.terminate();
            }
        });
        this.optimizationWorkers = [];

        // Traiter les résultats finaux
        this.processOptimizationResults();
        
        console.log('⏹️ Optimisation arrêtée');
        this.dispatchOptimizationStop();
    }

    /**
     * Démarre les workers d'optimisation
     */
    async startOptimizationWorkers() {
        const workerCount = Math.min(this.maxWorkers, navigator.hardwareConcurrency || 4);
        
        for (let i = 0; i < workerCount; i++) {
            try {
                // Simuler un worker d'optimisation
                const worker = this.createOptimizationWorker(i);
                this.optimizationWorkers.push(worker);
            } catch (error) {
                console.warn('⚠️ Impossible de créer le worker', i, ':', error);
            }
        }

        console.log('👷 Workers d\'optimisation démarrés:', this.optimizationWorkers.length);
    }

    /**
     * Crée un worker d'optimisation simulé
     */
    createOptimizationWorker(workerId) {
        const worker = {
            id: workerId,
            isRunning: true,
            combinationsTested: 0,
            bestScore: 0,
            interval: null
        };

        // Simuler le travail d'optimisation
        worker.interval = setInterval(() => {
            if (!this.isOptimizing) {
                clearInterval(worker.interval);
                return;
            }

            // Simuler des tests de combinaisons
            const batchSize = Math.floor(Math.random() * 1000) + 500;
            worker.combinationsTested += batchSize;

            // Simuler la découverte de meilleurs builds
            if (Math.random() < 0.1) { // 10% de chance de trouver un meilleur build
                const score = Math.random() * 1000000 + worker.bestScore;
                if (score > worker.bestScore) {
                    worker.bestScore = score;
                    
                    // Créer un build optimisé
                    const optimizedBuild = this.generateOptimizedBuild(score);
                    this.addOptimizationResult(optimizedBuild);
                }
            }

            // Mettre à jour les statistiques
            this.updateOptimizationStats();

        }, 100 + Math.random() * 200); // Intervalle variable

        return worker;
    }

    /**
     * Génère un build optimisé simulé
     */
    generateOptimizedBuild(score) {
        const build = JSON.parse(JSON.stringify(this.currentBuild));
        
        build.id = this.generateBuildId();
        build.name = `Optimisé ${new Date().toLocaleTimeString()}`;
        build.timestamp = Date.now();
        build.isOptimized = true;
        build.stats.score = Math.round(score);
        
        // Simuler des stats améliorées
        build.stats.dps = Math.round(score * 0.8 + Math.random() * score * 0.4);
        build.stats.ehp = Math.round(score * 0.6 + Math.random() * score * 0.3);
        build.stats.burstDps = Math.round(build.stats.dps * 1.5);
        build.stats.sustainedDps = Math.round(build.stats.dps * 0.7);

        return build;
    }

    /**
     * Ajoute un résultat d'optimisation
     */
    addOptimizationResult(build) {
        this.resultsBuffer.push(build);
        
        // Trier par score décroissant
        this.resultsBuffer.sort((a, b) => b.stats.score - a.stats.score);
        
        // Limiter le buffer
        if (this.resultsBuffer.length > 100) {
            this.resultsBuffer = this.resultsBuffer.slice(0, 100);
        }

        // Ajouter au leaderboard
        if (window.leaderboardManager) {
            window.leaderboardManager.addBuild(build);
        }

        this.dispatchOptimizationResult(build);
    }

    /**
     * Met à jour les statistiques d'optimisation
     */
    updateOptimizationStats() {
        const totalCombinations = this.optimizationWorkers.reduce(
            (sum, worker) => sum + worker.combinationsTested, 0
        );
        
        const bestScore = Math.max(
            ...this.optimizationWorkers.map(worker => worker.bestScore),
            0
        );

        this.dispatchOptimizationProgress({
            totalCombinations,
            bestScore,
            resultsCount: this.resultsBuffer.length,
            workersActive: this.optimizationWorkers.filter(w => w.isRunning).length
        });
    }

    /**
     * Démarre la mise à jour temps réel du leaderboard
     */
    startRealtimeLeaderboardUpdate() {
        if (window.leaderboardManager) {
            window.leaderboardManager.startAutoUpdate(30000); // 30 secondes
        }
    }

    /**
     * Traite les résultats finaux d'optimisation
     */
    processOptimizationResults() {
        if (this.resultsBuffer.length > 0) {
            // Prendre le meilleur build
            const bestBuild = this.resultsBuffer[0];
            
            // Proposer de l'adopter
            this.dispatchOptimizationComplete({
                bestBuild,
                totalResults: this.resultsBuffer.length,
                allResults: this.resultsBuffer.slice(0, 10) // Top 10
            });
        }
    }

    /**
     * Adopte un build optimisé
     */
    adoptOptimizedBuild(build) {
        this.loadBuild(build);
        this.saveBuild(`${build.name} (Adopté)`);
        console.log('✅ Build optimisé adopté:', build.name);
    }

    /**
     * Calcule les statistiques du build
     */
    calculateBuildStats() {
        if (!this.currentBuild) return;

        // Simulation simple des stats
        let ehp = 1000;
        let dps = 1000;

        // Facteurs basés sur les équipements
        if (this.currentBuild.warframe) ehp *= 1.5;
        if (this.currentBuild.primary) dps *= 2;
        if (this.currentBuild.secondary) dps *= 1.3;
        if (this.currentBuild.melee) dps *= 1.8;

        // Facteurs basés sur les mods
        Object.values(this.currentBuild.mods).forEach(modArray => {
            if (Array.isArray(modArray)) {
                const modCount = modArray.filter(mod => mod !== null).length;
                ehp *= (1 + modCount * 0.1);
                dps *= (1 + modCount * 0.15);
            }
        });

        // Facteurs basés sur les arcanes
        Object.values(this.currentBuild.arcanes).forEach(arcane => {
            if (arcane) {
                if (Array.isArray(arcane)) {
                    const arcaneCount = arcane.filter(a => a !== null).length;
                    ehp *= (1 + arcaneCount * 0.05);
                    dps *= (1 + arcaneCount * 0.08);
                } else {
                    ehp *= 1.05;
                    dps *= 1.08;
                }
            }
        });

        // Appliquer la configuration
        const levelMultiplier = Math.log10(this.currentBuild.config.enemyLevel + 1);
        ehp *= levelMultiplier;
        dps *= levelMultiplier;

        // Mettre à jour les stats
        this.currentBuild.stats = {
            ehp: Math.round(ehp),
            dps: Math.round(dps),
            burstDps: Math.round(dps * 1.5),
            sustainedDps: Math.round(dps * 0.7),
            score: Math.round((ehp * 0.3 + dps * 0.7) * Math.random() * 0.2 + (ehp * 0.3 + dps * 0.7) * 0.8)
        };
    }

    /**
     * Sauvegarde automatique
     */
    startAutoSave() {
        this.autoSaveInterval = setInterval(() => {
            if (this.currentBuild && this.currentBuild.name !== 'Nouveau Build') {
                this.saveBuild();
            }
        }, 60000); // Toutes les minutes
    }

    /**
     * Génère un ID de build unique
     */
    generateBuildId() {
        return 'build_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }

    /**
     * Charge les templates
     */
    loadTemplates() {
        const saved = localStorage.getItem('frameFactory_templates');
        if (saved) {
            try {
                this.templates = JSON.parse(saved);
            } catch (error) {
                console.error('❌ Erreur lors du chargement des templates:', error);
                this.templates = [];
            }
        }
    }

    /**
     * Sauvegarde les templates
     */
    saveTemplates() {
        localStorage.setItem('frameFactory_templates', JSON.stringify(this.templates));
    }

    /**
     * Configure les event listeners
     */
    setupEventListeners() {
        // Écouter les événements de leaderboard
        window.addEventListener('leaderboardUpdated', (e) => {
            this.dispatchEvent('leaderboardSync', e.detail);
        });
    }

    /**
     * Déclenche un événement personnalisé
     */
    dispatchEvent(type, detail = {}) {
        window.dispatchEvent(new CustomEvent(`buildManager_${type}`, { detail }));
    }

    /**
     * Raccourcis pour les événements
     */
    dispatchBuildUpdate() {
        this.dispatchEvent('buildUpdated', { build: this.currentBuild });
    }

    dispatchOptimizationStart() {
        this.dispatchEvent('optimizationStarted', { build: this.currentBuild });
    }

    dispatchOptimizationStop() {
        this.dispatchEvent('optimizationStopped', { results: this.resultsBuffer });
    }

    dispatchOptimizationResult(build) {
        this.dispatchEvent('optimizationResult', { build, buffer: this.resultsBuffer });
    }

    dispatchOptimizationProgress(stats) {
        this.dispatchEvent('optimizationProgress', stats);
    }

    dispatchOptimizationComplete(results) {
        this.dispatchEvent('optimizationComplete', results);
    }

    /**
     * Nettoyage
     */
    destroy() {
        this.stopOptimization();
        
        if (this.autoSaveInterval) {
            clearInterval(this.autoSaveInterval);
        }

        if (window.leaderboardManager) {
            window.leaderboardManager.stopAutoUpdate();
        }
    }
}

// Instance globale
window.buildManager = new BuildManager();

console.log('🔧 Gestionnaire de builds initialisé');
