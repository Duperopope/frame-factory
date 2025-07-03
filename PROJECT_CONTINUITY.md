# FRAME Factory - Guide de Continuité du Projet

## 📊 État Actuel du Projet

### Version Actuelle
- **Version** : v0.1.2 Enhanced
- **URL Production** : https://duperopope.github.io/frame-factory/
- **Statut** : ✅ GitHub Pages déployé et fonctionnel
- **Dernière mise à jour** : 7 janvier 2025

### Tags Git Disponibles
- `v0.1.0` - Release initiale avec architecture modulaire
- `v0.1.1` - GitHub Pages deployment working
- `v0.1.2` - Enhanced Visual Design

---

## 🚨 PROBLÈMES PRIORITAIRES À RÉSOUDRE

### 1. **Icônes FontAwesome Manquantes** 
**Problème** : Les icônes ne s'affichent pas correctement dans l'interface
- **Fichier de référence** : `Warframebuilde01.html` (contient la solution)
- **CDN utilisé** : `https://cdn.jsdelivr.net/npm/@fortawesome/fontawesome-free@6.4.0/css/all.min.css`
- **Exemple problématique** :
  ```html
  <i class="fas fa-search mr-2"></i> <!-- Ne s'affiche pas -->
  ```

### 2. **Icône Manquante dans Codex**
**Problème** : Icône manquante pour "Melee weapon" dans le menu catégories
- **Localisation** : Section Codex > Category Sidebar
- **Icône attendue** : `fas fa-sword` (présente dans Warframebuilde01.html)

### 3. **Algorithme d'Optimisation à Améliorer**
**Problème** : Le système actuel de calcul des builds n'est pas optimal
- **Suggestion utilisateur** : "que ferait un mathématicien avancé ?"
- **Amélioration nécessaire** : Algorithme plus sophistiqué pour l'optimisation des builds

---

## 🏗️ ARCHITECTURE DU PROJET

### Structure des Fichiers
```
├── index.html                 # Point d'entrée principal
├── package.json              # Configuration du projet
├── CHANGELOG.md              # Historique des versions
├── PROJECT_CONTINUITY.md    # Ce document
├── Warframebuilde01.html     # 🎨 RÉFÉRENCE GRAPHIQUE (style payant)
├── css/
│   ├── main.css              # Styles principaux
│   ├── themes.css            # Variables CSS et thèmes
│   └── components.css        # Composants visuels
├── js/
│   ├── main.js              # Orchestration de l'application
│   ├── translations.js      # Système de traduction
│   ├── api.js              # Intégration API Warframe
│   ├── ui.js               # Gestion UI et tooltips
│   └── optimization.js     # Logique d'optimisation des builds
├── locales/                 # Fichiers de traduction (12 langues)
└── archives/               # Sauvegardes des versions précédentes
```

### Modules JavaScript
1. **main.js** - Orchestration et initialisation
2. **translations.js** - Système de traduction dynamique (12 langues)
3. **api.js** - Intégration avec l'API Warframe
4. **ui.js** - Gestion de l'interface utilisateur
5. **optimization.js** - Calculs d'optimisation des builds

---

## 🎨 STYLE GRAPHIQUE - IMPORTANT

### Référence Absolue
- **Fichier** : `Warframebuilde01.html`
- **Statut** : Style graphique professionnel PAYANT
- **Instruction** : RESPECTER ABSOLUMENT ce style
- **Note utilisateur** : "tu vois je t'ai donné une base il faut vraiment que tu respecte le style de mon graphiste je l'ai payé cher"

### Éléments Visuels à Préserver
- Variables CSS pour les thèmes (dark/light)
- Animations et transitions fluides
- Cartes d'items avec effets hover
- Barres de progression avec gradients
- Spinners de chargement animés
- Boutons avec états visuels

---

## 🔧 TÂCHES PRIORITAIRES

### Tâche 1 : Correction des Icônes FontAwesome
**Objectif** : Faire fonctionner les icônes comme dans Warframebuilde01.html

**Actions** :
1. Vérifier le CDN FontAwesome dans `index.html`
2. Comparer avec `Warframebuilde01.html` pour identifier les différences
3. Corriger l'affichage des icônes dans tous les composants
4. Ajouter l'icône manquante pour "Melee weapon" (`fas fa-sword`)

**Fichiers à modifier** :
- `index.html` (vérification CDN)
- Section Codex pour l'icône manquante

### Tâche 2 : Amélioration de l'Algorithme d'Optimisation
**Objectif** : Implémenter un algorithme mathématique avancé

**Approches suggérées** :
- **Algorithmes génétiques** pour l'optimisation multi-objectifs
- **Programmation dynamique** pour les combinaisons de mods
- **Algorithmes de recherche locale** (Hill Climbing, Simulated Annealing)
- **Optimisation par essaims particulaires** (PSO)

**Considérations** :
- Optimisation multi-critères (DPS, survie, utilité)
- Contraintes de capacité des mods
- Synergies entre équipements
- Performance temps réel

**Fichier principal** : `js/optimization.js`

### Tâche 3 : Respect du Style Graphique
**Objectif** : S'assurer que tous les nouveaux éléments respectent le style payant

**Actions** :
- Utiliser `Warframebuilde01.html` comme référence absolue
- Maintenir la cohérence visuelle
- Préserver les animations et transitions
- Respecter la palette de couleurs

---

## 🌐 DÉPLOIEMENT ET PRODUCTION

### GitHub Pages
- **Repository** : https://github.com/Duperopope/frame-factory
- **URL Live** : https://duperopope.github.io/frame-factory/
- **Workflow** : `.github/workflows/pages.yml`
- **Déploiement** : Automatique sur push vers `main`

### Processus de Déploiement
1. Modifications locales
2. `git add .`
3. `git commit -m "Description"`
4. `git push`
5. GitHub Pages se met à jour automatiquement

---

## 🔗 INTÉGRATIONS EXTERNES

### API Warframe
- **Base URL** : `https://api.warframestat.us`
- **CDN Images** : `https://cdn.warframestat.us/img`
- **Support multilingue** : `?language=fr` (12 langues supportées)
- **Cache** : 5 minutes de timeout

### CDN Externes
- **Tailwind CSS** : `https://cdn.jsdelivr.net/npm/tailwindcss@2.2.19/dist/tailwind.min.css`
- **FontAwesome** : `https://cdn.jsdelivr.net/npm/@fortawesome/fontawesome-free@6.4.0/css/all.min.css`
- **Chart.js** : `https://cdn.jsdelivr.net/npm/chart.js`

---

## 🌍 SYSTÈME DE TRADUCTION

### Langues Supportées (12)
- English, Français, Deutsch, Español, Italiano
- 日本語, 한국어, Polski, Português, Русский, 中文, Українська

### Structure
- **Fichiers** : `locales/{lang}.json`
- **Système** : Traduction dynamique temps réel
- **Fallback** : Anglais par défaut
- **API** : Contenu du jeu depuis l'API Warframe

---

## 🚀 PROCHAINES ÉTAPES RECOMMANDÉES

### Phase 1 : Corrections Immédiates
1. ✅ Corriger les icônes FontAwesome
2. ✅ Ajouter l'icône Melee manquante
3. ✅ Vérifier la cohérence visuelle avec Warframebuilde01.html

### Phase 2 : Amélioration de l'Algorithme
1. 🔄 Rechercher et implémenter un algorithme d'optimisation avancé
2. 🔄 Tester les performances avec de gros datasets
3. 🔄 Optimiser l'interface utilisateur pour les résultats

### Phase 3 : Fonctionnalités Avancées
1. 📋 Builder personnalisé (onglet Builder)
2. 📋 Système de sauvegarde des builds
3. 📋 Partage de builds via URL
4. 📋 Comparaison de builds

---

## 💡 CONSEILS POUR LES FUTURS DÉVELOPPEURS

### Règles Importantes
1. **TOUJOURS** utiliser `Warframebuilde01.html` comme référence visuelle
2. **JAMAIS** modifier le style sans respecter la charte graphique payante
3. **TOUJOURS** tester sur GitHub Pages après les modifications
4. **MAINTENIR** la compatibilité avec les 12 langues

### Debugging
- Utiliser les DevTools pour vérifier le chargement des icônes
- Tester les traductions en changeant de langue
- Vérifier la responsivité sur mobile
- Contrôler les performances de l'API

### Bonnes Pratiques
- Commiter fréquemment avec des messages clairs
- Créer des tags pour les versions importantes
- Maintenir le CHANGELOG.md à jour
- Sauvegarder les versions importantes dans `archives/`

---

## 📞 CONTACT ET RESSOURCES

### Ressources Clés
- **API Documentation** : https://docs.warframestat.us/
- **FontAwesome Icons** : https://fontawesome.com/icons
- **Tailwind CSS** : https://tailwindcss.com/docs

### Fichiers de Référence Critiques
- `Warframebuilde01.html` - Style graphique de référence
- `CHANGELOG.md` - Historique complet des modifications
- `README.md` - Documentation utilisateur

---

**🎯 OBJECTIF PRINCIPAL : Créer le meilleur optimiseur de builds Warframe tout en respectant le style graphique professionnel payant.**

---

*Document créé le 7 janvier 2025 - Version 1.0*
*Dernière mise à jour : v0.1.2 Enhanced*
