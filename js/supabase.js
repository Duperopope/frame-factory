/**
 * Supabase Integration - Base de données réelle pour FRAME Factory
 */

class SupabaseManager {
    constructor() {
        // Configuration Supabase
        this.supabaseUrl = 'https://bqravllzmgkigfwrekfg.supabase.co';
        this.supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJxcmF2bGx6bWdraWdmd3Jla2ZnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTE1MTE5NDcsImV4cCI6MjA2NzA4Nzk0N30.x4eUTG0cv4oRoRdJqnkkcOOFClueKbm_U3JNPQ-srkA';
        
        this.client = null;
        this.isConnected = false;
        this.userId = null;
        
        this.initializeSupabase();
    }

    /**
     * Initialiser Supabase
     */
    async initializeSupabase() {
        try {
            // Charger la librairie Supabase depuis CDN
            if (!window.supabase) {
                await this.loadSupabaseLibrary();
            }

            // Créer le client Supabase
            this.client = window.supabase.createClient(this.supabaseUrl, this.supabaseKey);
            
            // Générer ou récupérer l'ID utilisateur
            this.userId = this.getUserId();
            
            this.isConnected = true;
            console.log('✅ Supabase connecté:', this.supabaseUrl);
            
            // Tester la connexion
            await this.testConnection();
            
        } catch (error) {
            console.error('❌ Erreur Supabase:', error);
            this.isConnected = false;
        }
    }

    /**
     * Charger la librairie Supabase
     */
    loadSupabaseLibrary() {
        return new Promise((resolve, reject) => {
            if (window.supabase) {
                resolve();
                return;
            }

            const script = document.createElement('script');
            script.src = 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.39.0/dist/umd/supabase.min.js';
            script.onload = () => resolve();
            script.onerror = () => reject(new Error('Impossible de charger Supabase'));
            document.head.appendChild(script);
        });
    }

    /**
     * Tester la connexion
     */
    async testConnection() {
        try {
            const { data, error } = await this.client
                .from('builds')
                .select('count')
                .limit(1);
                
            if (error) {
                console.warn('⚠️ Tables pas encore créées, création automatique...');
                await this.createTables();
            } else {
                console.log('✅ Connexion Supabase testée avec succès');
            }
        } catch (error) {
            console.error('❌ Test de connexion échoué:', error);
        }
    }

    /**
     * Créer les tables nécessaires
     */
    async createTables() {
        // Note: En production, les tables seraient créées via l'interface Supabase
        // Ici on simule la structure pour le développement
        console.log('📋 Structure des tables Supabase:');
        console.log(`
        CREATE TABLE builds (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            user_id TEXT NOT NULL,
            warframe TEXT NOT NULL,
            primary_weapon JSONB,
            secondary_weapon JSONB,
            melee_weapon JSONB,
            mods JSONB,
            arcanes JSONB,
            score REAL NOT NULL,
            dps BIGINT,
            ehp BIGINT,
            content_type TEXT,
            enemy_level INTEGER,
            target_faction TEXT,
            optimization_seed TEXT,
            created_at TIMESTAMP DEFAULT NOW(),
            updated_at TIMESTAMP DEFAULT NOW()
        );

        CREATE TABLE leaderboard (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            build_id UUID REFERENCES builds(id),
            rank INTEGER NOT NULL,
            score REAL NOT NULL,
            content_type TEXT,
            updated_at TIMESTAMP DEFAULT NOW()
        );

        CREATE TABLE user_stats (
            user_id TEXT PRIMARY KEY,
            builds_created INTEGER DEFAULT 0,
            optimizations_run INTEGER DEFAULT 0,
            contribution_score INTEGER DEFAULT 0,
            last_active TIMESTAMP DEFAULT NOW()
        );
        `);
    }

    /**
     * Obtenir ou générer un ID utilisateur
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
     * Sauvegarder un build optimisé
     */
    async saveBuild(buildData) {
        if (!this.isConnected) {
            console.error('❌ Supabase non connecté');
            return null;
        }

        try {
            const build = {
                user_id: this.userId,
                warframe: buildData.warframe,
                primary_weapon: buildData.primaryWeapon,
                secondary_weapon: buildData.secondaryWeapon,
                melee_weapon: buildData.meleeWeapon,
                mods: buildData.mods,
                arcanes: buildData.arcanes,
                score: buildData.score,
                dps: buildData.dps,
                ehp: buildData.ehp,
                content_type: buildData.contentType,
                enemy_level: buildData.enemyLevel,
                target_faction: buildData.targetFaction,
                optimization_seed: buildData.optimizationSeed
            };

            const { data, error } = await this.client
                .from('builds')
                .insert([build])
                .select();

            if (error) {
                console.error('❌ Erreur sauvegarde build:', error);
                return null;
            }

            console.log('✅ Build sauvegardé:', data[0]);
            
            // Mettre à jour les stats utilisateur
            await this.updateUserStats('builds_created');
            
            // Mettre à jour le leaderboard
            await this.updateLeaderboard(data[0]);
            
            return data[0];
        } catch (error) {
            console.error('❌ Erreur lors de la sauvegarde:', error);
            return null;
        }
    }

    /**
     * Récupérer le leaderboard
     */
    async getLeaderboard(contentType = null, limit = 100) {
        if (!this.isConnected) {
            console.error('❌ Supabase non connecté');
            return [];
        }

        try {
            let query = this.client
                .from('builds')
                .select(`
                    id,
                    warframe,
                    primary_weapon,
                    secondary_weapon,
                    melee_weapon,
                    score,
                    dps,
                    ehp,
                    content_type,
                    enemy_level,
                    target_faction,
                    created_at
                `)
                .order('score', { ascending: false })
                .limit(limit);

            if (contentType) {
                query = query.eq('content_type', contentType);
            }

            const { data, error } = await query;

            if (error) {
                console.error('❌ Erreur récupération leaderboard:', error);
                return [];
            }

            console.log(`✅ Leaderboard récupéré: ${data.length} builds`);
            return data;
        } catch (error) {
            console.error('❌ Erreur lors de la récupération:', error);
            return [];
        }
    }

    /**
     * Mettre à jour le leaderboard
     */
    async updateLeaderboard(build) {
        try {
            // Récupérer le classement actuel pour ce type de contenu
            const { data: currentLeaderboard } = await this.client
                .from('builds')
                .select('id, score')
                .eq('content_type', build.content_type)
                .order('score', { ascending: false })
                .limit(100);

            // Calculer le rang du nouveau build
            const rank = currentLeaderboard.findIndex(b => b.score < build.score) + 1;
            
            if (rank > 0 && rank <= 100) {
                console.log(`🏆 Build classé #${rank} dans le leaderboard`);
                
                // Émettre un événement pour mettre à jour l'interface
                window.dispatchEvent(new CustomEvent('leaderboardUpdated', {
                    detail: { build, rank }
                }));
            }
        } catch (error) {
            console.error('❌ Erreur mise à jour leaderboard:', error);
        }
    }

    /**
     * Mettre à jour les statistiques utilisateur
     */
    async updateUserStats(statType) {
        try {
            const { data, error } = await this.client
                .from('user_stats')
                .upsert([{
                    user_id: this.userId,
                    [statType]: 1,
                    last_active: new Date().toISOString()
                }], {
                    onConflict: 'user_id',
                    ignoreDuplicates: false
                });

            if (error) {
                console.error('❌ Erreur mise à jour stats:', error);
            }
        } catch (error) {
            console.error('❌ Erreur stats utilisateur:', error);
        }
    }

    /**
     * Récupérer les builds de l'utilisateur
     */
    async getUserBuilds(limit = 50) {
        if (!this.isConnected) return [];

        try {
            const { data, error } = await this.client
                .from('builds')
                .select('*')
                .eq('user_id', this.userId)
                .order('created_at', { ascending: false })
                .limit(limit);

            if (error) {
                console.error('❌ Erreur récupération builds utilisateur:', error);
                return [];
            }

            return data;
        } catch (error) {
            console.error('❌ Erreur builds utilisateur:', error);
            return [];
        }
    }

    /**
     * Rechercher des builds similaires
     */
    async findSimilarBuilds(criteria) {
        if (!this.isConnected) return [];

        try {
            let query = this.client
                .from('builds')
                .select('*')
                .order('score', { ascending: false })
                .limit(20);

            if (criteria.warframe) {
                query = query.eq('warframe', criteria.warframe);
            }
            if (criteria.contentType) {
                query = query.eq('content_type', criteria.contentType);
            }
            if (criteria.targetFaction) {
                query = query.eq('target_faction', criteria.targetFaction);
            }

            const { data, error } = await query;

            if (error) {
                console.error('❌ Erreur recherche builds similaires:', error);
                return [];
            }

            return data;
        } catch (error) {
            console.error('❌ Erreur recherche similaire:', error);
            return [];
        }
    }

    /**
     * Obtenir les statistiques globales
     */
    async getGlobalStats() {
        if (!this.isConnected) return null;

        try {
            const { data: buildsCount } = await this.client
                .from('builds')
                .select('id', { count: 'exact' });

            const { data: usersCount } = await this.client
                .from('user_stats')
                .select('user_id', { count: 'exact' });

            const { data: topBuild } = await this.client
                .from('builds')
                .select('score')
                .order('score', { ascending: false })
                .limit(1);

            return {
                totalBuilds: buildsCount?.length || 0,
                totalUsers: usersCount?.length || 0,
                topScore: topBuild?.[0]?.score || 0,
                lastUpdate: new Date().toISOString()
            };
        } catch (error) {
            console.error('❌ Erreur stats globales:', error);
            return null;
        }
    }

    /**
     * Supprimer un build
     */
    async deleteBuild(buildId) {
        if (!this.isConnected) return false;

        try {
            const { error } = await this.client
                .from('builds')
                .delete()
                .eq('id', buildId)
                .eq('user_id', this.userId); // Sécurité: seulement ses propres builds

            if (error) {
                console.error('❌ Erreur suppression build:', error);
                return false;
            }

            console.log('✅ Build supprimé:', buildId);
            return true;
        } catch (error) {
            console.error('❌ Erreur lors de la suppression:', error);
            return false;
        }
    }

    /**
     * Vérifier le statut de la connexion
     */
    getConnectionStatus() {
        return {
            connected: this.isConnected,
            url: this.supabaseUrl,
            userId: this.userId
        };
    }
}

// Instance globale
window.supabaseManager = new SupabaseManager();

console.log('🗄️ Supabase Manager initialisé');
