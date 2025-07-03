/**
 * FRAME Factory - Vrai Moteur d'Optimisation
 * Calculs mathématiques réels pour l'optimisation de builds Warframe
 */

class OptimizationEngine {
    constructor() {
        this.isOptimizing = false;
        this.optimizationStartTime = 0;
        this.totalCombinations = 0;
        this.testedCombinations = 0;
        this.bestBuilds = [];
        this.currentBestScore = 0;
        
        // Données Warframe pour les calculs
        this.warframeStats = {};
        this.weaponStats = {};
        this.modStats = {};
        
        // Paramètres d'optimisation
        this.optimizationParams = {
            contentType: 'general',
            enemyLevel: 150,
            targetFaction: 'grineer',
            maxIterations: 1000000,
            convergenceThreshold: 0.001
        };
    }

    /**
     * Initialiser les données de base pour les calculs
     */
    initializeGameData(items) {
        this.parseWarframeData(items);
        this.parseWeaponData(items);
        this.parseModData(items);
        console.log('🎮 Données Warframe initialisées pour les calculs');
    }

    /**
     * Parser les données Warframe
     */
    parseWarframeData(items) {
        const warframes = items.filter(item => item.category === 'Warframes');
        
        warframes.forEach(warframe => {
            this.warframeStats[warframe.name] = {
                health: this.extractStat(warframe, 'health', 100),
                shield: this.extractStat(warframe, 'shield', 100),
                armor: this.extractStat(warframe, 'armor', 100),
                energy: this.extractStat(warframe, 'energy', 100),
                sprintSpeed: this.extractStat(warframe, 'sprintSpeed', 1.0),
                abilities: warframe.abilities || []
            };
        });
    }

    /**
     * Parser les données d'armes
     */
    parseWeaponData(items) {
        const weapons = items.filter(item => 
            ['Primary', 'Secondary', 'Melee'].includes(item.category)
        );
        
        weapons.forEach(weapon => {
            this.weaponStats[weapon.name] = {
                damage: this.extractDamage(weapon),
                critChance: this.extractStat(weapon, 'criticalChance', 0.1),
                critMultiplier: this.extractStat(weapon, 'criticalMultiplier', 2.0),
                statusChance: this.extractStat(weapon, 'procChance', 0.1),
                fireRate: this.extractStat(weapon, 'fireRate', 1.0),
                accuracy: this.extractStat(weapon, 'accuracy', 100),
                reload: this.extractStat(weapon, 'reloadTime', 2.0),
                magazine: this.extractStat(weapon, 'magazineSize', 30),
                category: weapon.category,
                weaponType: weapon.type
            };
        });
    }

    /**
     * Parser les données de mods
     */
    parseModData(items) {
        const mods = items.filter(item => item.category === 'Mods');
        
        mods.forEach(mod => {
            this.modStats[mod.name] = {
                polarity: mod.polarity || 'None',
                capacity: mod.baseDrain || 0,
                maxRank: mod.fusionLimit || 0,
                effects: this.parseModEffects(mod),
                type: this.determineModType(mod)
            };
        });
    }

    /**
     * Extraire une statistique d'un item
     */
    extractStat(item, statName, defaultValue) {
        if (!item.stats) return defaultValue;
        
        const stat = item.stats.find(s => 
            s.name.toLowerCase().includes(statName.toLowerCase())
        );
        
        return stat ? parseFloat(stat.value) : defaultValue;
    }

    /**
     * Extraire les dégâts d'une arme
     */
    extractDamage(weapon) {
        if (!weapon.stats) return { impact: 10, puncture: 10, slash: 10 };
        
        const damage = {
            impact: this.extractStat(weapon, 'impact', 0),
            puncture: this.extractStat(weapon, 'puncture', 0),
            slash: this.extractStat(weapon, 'slash', 0),
            heat: this.extractStat(weapon, 'heat', 0),
            cold: this.extractStat(weapon, 'cold', 0),
            electric: this.extractStat(weapon, 'electric', 0),
            toxin: this.extractStat(weapon, 'toxin', 0)
        };
        
        // Si pas de dégâts spécifiques, utiliser le total
        const totalDamage = this.extractStat(weapon, 'damage', 30);
        if (damage.impact + damage.puncture + damage.slash === 0) {
            damage.impact = totalDamage * 0.4;
            damage.puncture = totalDamage * 0.3;
            damage.slash = totalDamage * 0.3;
        }
        
        return damage;
    }

    /**
     * Parser les effets d'un mod
     */
    parseModEffects(mod) {
        const effects = {};
        
        if (mod.levelStats) {
            mod.levelStats.forEach(levelStat => {
                levelStat.stats.forEach(stat => {
                    const effectName = this.normalizeEffectName(stat.stat);
                    effects[effectName] = parseFloat(stat.value) || 0;
                });
            });
        }
        
        return effects;
    }

    /**
     * Normaliser le nom d'un effet
     */
    normalizeEffectName(statName) {
        const normalizations = {
            'damage': 'baseDamage',
            'critical chance': 'critChance',
            'critical damage': 'critMultiplier',
            'status chance': 'statusChance',
            'fire rate': 'fireRate',
            'multishot': 'multishot',
            'health': 'health',
            'shield': 'shield',
            'armor': 'armor',
            'energy': 'energy'
        };
        
        const normalized = statName.toLowerCase();
        return normalizations[normalized] || normalized.replace(/\s+/g, '');
    }

    /**
     * Déterminer le type d'un mod
     */
    determineModType(mod) {
        const name = mod.name.toLowerCase();
        
        if (name.includes('serration') || name.includes('hornet') || name.includes('pressure')) {
            return 'baseDamage';
        }
        if (name.includes('split chamber') || name.includes('barrel diffusion')) {
            return 'multishot';
        }
        if (name.includes('point strike') || name.includes('true steel')) {
            return 'critChance';
        }
        if (name.includes('vital sense') || name.includes('organ shatter')) {
            return 'critMultiplier';
        }
        if (name.includes('vitality') || name.includes('redirection')) {
            return 'survivability';
        }
        
        return 'utility';
    }

    /**
     * Calculer le DPS d'une arme avec des mods
     */
    calculateWeaponDPS(weaponName, mods, enemyLevel, faction) {
        const weapon = this.weaponStats[weaponName];
        if (!weapon) return 0;
        
        // Appliquer les modificateurs des mods
        const modifiedStats = this.applyModsToWeapon(weapon, mods);
        
        // Calculer les dégâts de base
        const baseDamage = this.calculateBaseDamage(modifiedStats.damage);
        
        // Appliquer les multiplicateurs de critique
        const critMultiplier = this.calculateCriticalMultiplier(
            modifiedStats.critChance,
            modifiedStats.critMultiplier
        );
        
        // Appliquer les effets de statut
        const statusMultiplier = this.calculateStatusMultiplier(
            modifiedStats.statusChance,
            faction
        );
        
        // Calculer le DPS final
        const dps = baseDamage * 
                   critMultiplier * 
                   statusMultiplier * 
                   modifiedStats.fireRate * 
                   modifiedStats.multishot *
                   this.getFactionMultiplier(modifiedStats.damage, faction) *
                   this.getArmorReduction(enemyLevel, faction);
        
        return Math.round(dps);
    }

    /**
     * Appliquer les mods à une arme
     */
    applyModsToWeapon(weapon, mods) {
        const modified = JSON.parse(JSON.stringify(weapon));
        modified.multishot = 1.0;
        
        mods.forEach(modName => {
            const mod = this.modStats[modName];
            if (!mod) return;
            
            Object.entries(mod.effects).forEach(([effect, value]) => {
                switch (effect) {
                    case 'baseDamage':
                        Object.keys(modified.damage).forEach(damageType => {
                            modified.damage[damageType] *= (1 + value / 100);
                        });
                        break;
                    case 'critChance':
                        modified.critChance += value / 100;
                        break;
                    case 'critMultiplier':
                        modified.critMultiplier += value / 100;
                        break;
                    case 'statusChance':
                        modified.statusChance += value / 100;
                        break;
                    case 'fireRate':
                        modified.fireRate *= (1 + value / 100);
                        break;
                    case 'multishot':
                        modified.multishot += value / 100;
                        break;
                }
            });
        });
        
        return modified;
    }

    /**
     * Calculer les dégâts de base
     */
    calculateBaseDamage(damage) {
        return Object.values(damage).reduce((total, dmg) => total + dmg, 0);
    }

    /**
     * Calculer le multiplicateur de critique
     */
    calculateCriticalMultiplier(critChance, critMultiplier) {
        // Formule Warframe pour les critiques
        const clampedChance = Math.min(critChance, 1.0);
        const orangeCrits = Math.max(0, critChance - 1.0);
        const redCrits = Math.max(0, critChance - 2.0);
        
        return 1 + 
               (clampedChance * (critMultiplier - 1)) +
               (orangeCrits * critMultiplier) +
               (redCrits * critMultiplier);
    }

    /**
     * Calculer le multiplicateur de statut
     */
    calculateStatusMultiplier(statusChance, faction) {
        // Effets de statut moyens selon la faction
        const statusEffects = {
            'grineer': 1.3,  // Corrosion efficace
            'corpus': 1.2,   // Magnétique + Toxine
            'infested': 1.4, // Slash + Heat
            'sentient': 1.1, // Résistance aux statuts
            'corrupted': 1.25
        };
        
        const baseMultiplier = statusEffects[faction] || 1.2;
        return 1 + (statusChance * (baseMultiplier - 1));
    }

    /**
     * Obtenir le multiplicateur de faction
     */
    getFactionMultiplier(damage, faction) {
        // Multiplicateurs de dégâts par type contre chaque faction
        const multipliers = {
            'grineer': {
                'puncture': 1.5,
                'slash': 0.75,
                'impact': 0.75,
                'corrosive': 1.75
            },
            'corpus': {
                'impact': 1.5,
                'puncture': 0.5,
                'magnetic': 1.75,
                'toxin': 1.5
            },
            'infested': {
                'slash': 1.25,
                'heat': 1.25,
                'gas': 1.75
            }
        };
        
        const factionMults = multipliers[faction] || {};
        let totalDamage = 0;
        let weightedDamage = 0;
        
        Object.entries(damage).forEach(([type, value]) => {
            totalDamage += value;
            weightedDamage += value * (factionMults[type] || 1.0);
        });
        
        return totalDamage > 0 ? weightedDamage / totalDamage : 1.0;
    }

    /**
     * Calculer la réduction d'armure
     */
    getArmorReduction(enemyLevel, faction) {
        // Formule d'armure Warframe
        const baseArmor = {
            'grineer': 500,
            'corpus': 50,
            'infested': 0,
            'corrupted': 400,
            'sentient': 200
        };
        
        const armor = baseArmor[faction] || 100;
        const leveledArmor = armor * (1 + Math.pow(enemyLevel - 1, 1.75) * 0.005);
        
        // Réduction de dégâts par l'armure
        return 300 / (300 + leveledArmor);
    }

    /**
     * Calculer l'EHP (Effective Health Points) d'une Warframe
     */
    calculateWarframeEHP(warframeName, mods) {
        const warframe = this.warframeStats[warframeName];
        if (!warframe) return 0;
        
        const modifiedStats = this.applyModsToWarframe(warframe, mods);
        
        // EHP = (Health + Shield) * (1 + Armor / 300)
        const armorMultiplier = 1 + modifiedStats.armor / 300;
        const ehp = (modifiedStats.health + modifiedStats.shield) * armorMultiplier;
        
        return Math.round(ehp);
    }

    /**
     * Appliquer les mods à une Warframe
     */
    applyModsToWarframe(warframe, mods) {
        const modified = JSON.parse(JSON.stringify(warframe));
        
        mods.forEach(modName => {
            const mod = this.modStats[modName];
            if (!mod) return;
            
            Object.entries(mod.effects).forEach(([effect, value]) => {
                switch (effect) {
                    case 'health':
                        modified.health *= (1 + value / 100);
                        break;
                    case 'shield':
                        modified.shield *= (1 + value / 100);
                        break;
                    case 'armor':
                        modified.armor *= (1 + value / 100);
                        break;
                    case 'energy':
                        modified.energy *= (1 + value / 100);
                        break;
                }
            });
        });
        
        return modified;
    }

    /**
     * Calculer le score global d'un build
     */
    calculateBuildScore(build, params) {
        const weaponDPS = this.calculateWeaponDPS(
            build.primaryWeapon,
            build.primaryMods,
            params.enemyLevel,
            params.targetFaction
        );
        
        const warframeEHP = this.calculateWarframeEHP(
            build.warframe,
            build.warframeMods
        );
        
        // Score pondéré selon le type de contenu
        const weights = this.getContentWeights(params.contentType);
        
        const score = (weaponDPS * weights.dps + warframeEHP * weights.survivability) / 
                     (weights.dps + weights.survivability);
        
        return Math.round(score);
    }

    /**
     * Obtenir les poids selon le type de contenu
     */
    getContentWeights(contentType) {
        const weights = {
            'steel-path': { dps: 0.7, survivability: 0.3 },
            'eso': { dps: 0.9, survivability: 0.1 },
            'arbitration': { dps: 0.6, survivability: 0.4 },
            'archon-hunt': { dps: 0.8, survivability: 0.2 },
            'general': { dps: 0.75, survivability: 0.25 }
        };
        
        return weights[contentType] || weights.general;
    }

    /**
     * Générer des builds aléatoirement pour l'optimisation
     */
    generateRandomBuild(availableItems) {
        const warframes = Object.keys(this.warframeStats);
        const weapons = Object.keys(this.weaponStats);
        const mods = Object.keys(this.modStats);
        
        if (warframes.length === 0 || weapons.length === 0 || mods.length === 0) {
            return null;
        }
        
        return {
            warframe: warframes[Math.floor(Math.random() * warframes.length)],
            primaryWeapon: weapons[Math.floor(Math.random() * weapons.length)],
            secondaryWeapon: weapons[Math.floor(Math.random() * weapons.length)],
            meleeWeapon: weapons[Math.floor(Math.random() * weapons.length)],
            warframeMods: this.selectRandomMods(mods, 8),
            primaryMods: this.selectRandomMods(mods, 8),
            secondaryMods: this.selectRandomMods(mods, 8),
            meleeMods: this.selectRandomMods(mods, 8)
        };
    }

    /**
     * Sélectionner des mods aléatoires
     */
    selectRandomMods(availableMods, count) {
        const selected = [];
        const shuffled = [...availableMods].sort(() => 0.5 - Math.random());
        
        for (let i = 0; i < Math.min(count, shuffled.length); i++) {
            selected.push(shuffled[i]);
        }
        
        return selected;
    }

    /**
     * Démarrer l'optimisation réelle
     */
    async startRealOptimization(params, availableItems, progressCallback) {
        this.isOptimizing = true;
        this.optimizationStartTime = Date.now();
        this.testedCombinations = 0;
        this.bestBuilds = [];
        this.currentBestScore = 0;
        this.optimizationParams = params;
        
        console.log('🚀 Démarrage de l\'optimisation réelle avec', Object.keys(this.warframeStats).length, 'Warframes');
        
        // Optimisation par algorithme génétique
        const populationSize = 100;
        const generations = 50;
        
        // Population initiale
        let population = [];
        for (let i = 0; i < populationSize; i++) {
            const build = this.generateRandomBuild(availableItems);
            if (build) {
                build.score = this.calculateBuildScore(build, params);
                population.push(build);
            }
        }
        
        // Évolution génétique
        for (let generation = 0; generation < generations && this.isOptimizing; generation++) {
            // Évaluer la population
            population.forEach(build => {
                build.score = this.calculateBuildScore(build, params);
                this.testedCombinations++;
            });
            
            // Trier par score
            population.sort((a, b) => b.score - a.score);
            
            // Garder les meilleurs
            if (population[0].score > this.currentBestScore) {
                this.currentBestScore = population[0].score;
                this.bestBuilds = population.slice(0, 10);
                
                console.log(`🏆 Nouveau meilleur score: ${this.currentBestScore} (Génération ${generation})`);
            }
            
            // Callback de progression
            if (progressCallback) {
                progressCallback({
                    generation,
                    totalGenerations: generations,
                    bestScore: this.currentBestScore,
                    testedCombinations: this.testedCombinations
                });
            }
            
            // Créer nouvelle génération
            const newPopulation = [];
            
            // Élitisme: garder les 20% meilleurs
            const eliteCount = Math.floor(populationSize * 0.2);
            newPopulation.push(...population.slice(0, eliteCount));
            
            // Reproduction et mutation
            while (newPopulation.length < populationSize) {
                const parent1 = this.selectParent(population);
                const parent2 = this.selectParent(population);
                const child = this.crossover(parent1, parent2);
                this.mutate(child, availableItems);
                newPopulation.push(child);
            }
            
            population = newPopulation;
            
            // Pause pour ne pas bloquer l'interface
            await new Promise(resolve => setTimeout(resolve, 10));
        }
        
        this.isOptimizing = false;
        
        console.log(`✅ Optimisation terminée: ${this.testedCombinations} builds testés`);
        return this.bestBuilds;
    }

    /**
     * Sélectionner un parent pour la reproduction (sélection par tournoi)
     */
    selectParent(population) {
        const tournamentSize = 5;
        const tournament = [];
        
        for (let i = 0; i < tournamentSize; i++) {
            const randomIndex = Math.floor(Math.random() * population.length);
            tournament.push(population[randomIndex]);
        }
        
        tournament.sort((a, b) => b.score - a.score);
        return tournament[0];
    }

    /**
     * Croisement de deux builds
     */
    crossover(parent1, parent2) {
        return {
            warframe: Math.random() < 0.5 ? parent1.warframe : parent2.warframe,
            primaryWeapon: Math.random() < 0.5 ? parent1.primaryWeapon : parent2.primaryWeapon,
            secondaryWeapon: Math.random() < 0.5 ? parent1.secondaryWeapon : parent2.secondaryWeapon,
            meleeWeapon: Math.random() < 0.5 ? parent1.meleeWeapon : parent2.meleeWeapon,
            warframeMods: this.crossoverMods(parent1.warframeMods, parent2.warframeMods),
            primaryMods: this.crossoverMods(parent1.primaryMods, parent2.primaryMods),
            secondaryMods: this.crossoverMods(parent1.secondaryMods, parent2.secondaryMods),
            meleeMods: this.crossoverMods(parent1.meleeMods, parent2.meleeMods)
        };
    }

    /**
     * Croisement de listes de mods
     */
    crossoverMods(mods1, mods2) {
        const result = [];
        const maxLength = Math.max(mods1.length, mods2.length);
        
        for (let i = 0; i < maxLength; i++) {
            if (i < mods1.length && i < mods2.length) {
                result.push(Math.random() < 0.5 ? mods1[i] : mods2[i]);
            } else if (i < mods1.length) {
                result.push(mods1[i]);
            } else if (i < mods2.length) {
                result.push(mods2[i]);
            }
        }
        
        return result;
    }

    /**
     * Mutation d'un build
     */
    mutate(build, availableItems) {
        const mutationRate = 0.1;
        const mods = Object.keys(this.modStats);
        
        if (Math.random() < mutationRate) {
            // Muter un mod aléatoire
            const modTypes = ['warframeMods', 'primaryMods', 'secondaryMods', 'meleeMods'];
            const randomType = modTypes[Math.floor(Math.random() * modTypes.length)];
            const modList = build[randomType];
            
            if (modList.length > 0) {
                const randomIndex = Math.floor(Math.random() * modList.length);
                modList[randomIndex] = mods[Math.floor(Math.random() * mods.length)];
            }
        }
    }

    /**
     * Arrêter l'optimisation
     */
    stopOptimization() {
        this.isOptimizing = false;
    }

    /**
     * Obtenir les statistiques d'optimisation
     */
    getOptimizationStats() {
        return {
            isOptimizing: this.isOptimizing,
            testedCombinations: this.testedCombinations,
            bestScore: this.currentBestScore,
            bestBuilds: this.bestBuilds,
            elapsedTime: Date.now() - this.optimizationStartTime
        };
    }
}

// Instance globale
window.optimizationEngine = new OptimizationEngine();

console.log('🧮 Moteur d\'optimisation réel initialisé');
