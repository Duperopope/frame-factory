# 🚀 Guide de déploiement GitHub Pages

Ce guide vous explique comment créer un repository GitHub et déployer votre application FRAME Factory en ligne.

## 📋 Étapes de déploiement

### 1. Créer un repository GitHub

1. **Aller sur GitHub** : https://github.com
2. **Cliquer sur "New repository"** (bouton vert)
3. **Configurer le repository** :
   - **Repository name** : `frame-factory` (ou le nom de votre choix)
   - **Description** : `FRAME Factory - Advanced Warframe Build Optimizer`
   - **Public** : ✅ (nécessaire pour GitHub Pages gratuit)
   - **Add README** : ❌ (nous en avons déjà un)
   - **Add .gitignore** : ❌ (nous en avons déjà un)
   - **Choose a license** : MIT License (recommandé)

4. **Cliquer sur "Create repository"**

### 2. Connecter votre projet local au repository

```bash
# Ajouter l'origine remote (remplacez USERNAME par votre nom d'utilisateur GitHub)
git remote add origin https://github.com/USERNAME/frame-factory.git

# Renommer la branche principale en 'main' (standard GitHub)
git branch -M main

# Pousser le code vers GitHub
git push -u origin main
```

### 3. Activer GitHub Pages

1. **Aller dans les Settings** de votre repository
2. **Scroll vers "Pages"** dans le menu de gauche
3. **Configurer la source** :
   - **Source** : Deploy from a branch
   - **Branch** : main
   - **Folder** : / (root)
4. **Cliquer sur "Save"**

### 4. Activer GitHub Actions (déploiement automatique)

1. **Aller dans l'onglet "Actions"** de votre repository
2. **Cliquer sur "I understand my workflows, enable them"**
3. Le workflow `.github/workflows/deploy.yml` sera automatiquement détecté

### 5. Configurer les permissions

1. **Settings** → **Actions** → **General**
2. **Workflow permissions** : 
   - ✅ Read and write permissions
   - ✅ Allow GitHub Actions to create and approve pull requests

## 🌐 Accès à votre application

Une fois déployée, votre application sera accessible à :
```
https://USERNAME.github.io/frame-factory/
```

## 🔄 Déploiement automatique

Chaque fois que vous poussez du code vers la branche `main`, GitHub Actions :
1. **Détecte automatiquement** les changements
2. **Déploie la nouvelle version** sur GitHub Pages
3. **Met à jour** votre site en ligne

## 📝 Commandes Git utiles

```bash
# Ajouter tous les fichiers modifiés
git add .

# Créer un commit avec un message
git commit -m "Description des changements"

# Pousser vers GitHub (déclenchera le déploiement)
git push origin main

# Vérifier le statut
git status

# Voir l'historique des commits
git log --oneline
```

## 🛠️ Développement local

Pour tester localement avant de déployer :

```bash
# Démarrer le serveur de développement
python server.py

# Ou utiliser le serveur Python simple
python -m http.server 8000
```

Puis ouvrir : http://localhost:8000

## 🔧 Résolution de problèmes

### Problème : GitHub Pages ne se met pas à jour
- **Solution** : Vérifiez l'onglet "Actions" pour voir si le déploiement a échoué
- **Attendre** : Le déploiement peut prendre 5-10 minutes

### Problème : Erreur 404 sur GitHub Pages
- **Vérifiez** que le fichier `index.html` est à la racine du repository
- **Vérifiez** que GitHub Pages est configuré sur la branche `main`

### Problème : Les traductions ne fonctionnent pas en ligne
- **Normal** : Les fichiers JSON se chargent correctement via HTTPS sur GitHub Pages
- **Test** : Vérifiez la console du navigateur pour les erreurs

## 🎯 Fonctionnalités après déploiement

✅ **Interface complète** avec toutes les fonctionnalités  
✅ **Traductions** en 11 langues  
✅ **Thèmes** clair/sombre  
✅ **Responsive design** sur mobile et desktop  
✅ **API Warframe** en temps réel  
✅ **Optimisation de builds** fonctionnelle  

## 📊 Monitoring

Après déploiement, vous pouvez :
- **Voir les statistiques** dans GitHub Insights
- **Suivre les déploiements** dans l'onglet Actions
- **Gérer les issues** et feedback des utilisateurs

---

**Votre application FRAME Factory sera maintenant accessible au monde entier ! 🌍**
