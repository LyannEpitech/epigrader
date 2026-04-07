# EpiGrader Electron Application

Application desktop EpiGrader basée sur Electron.

## 🚀 Installation rapide

### Pour les utilisateurs Windows

1. Téléchargez `EpiGrader-Setup.exe`
2. Double-cliquez pour lancer l'installateur
3. Suivez les instructions à l'écran
4. Entrez votre clé API Moonshot au premier lancement
5. C'est prêt !

### Version Portable (sans installation)

1. Téléchargez `EpiGrader-Portable.exe`
2. Double-cliquez pour lancer directement
3. Aucune installation nécessaire

## 🛠️ Build depuis les sources

### Prérequis

- Node.js 18+
- npm ou yarn

### Build

```bash
cd electron
npm install
npm run dist:win    # Pour Windows
npm run dist        # Pour la plateforme actuelle
```

### Structure

```
electron/
├── main.js           # Processus principal Electron
├── preload.js        # Script de preload (sécurité)
├── setup.html        # Fenêtre de configuration initiale
├── loading.html      # Écran de chargement
├── package.json      # Configuration Electron
└── assets/           # Icônes et ressources
```

## 📦 Fonctionnalités

- ✅ **Installateur Windows** (.exe) avec wizard
- ✅ **Version portable** (sans installation)
- ✅ **Configuration visuelle** au premier lancement
- ✅ **Auto-démarrage** du backend
- ✅ **Interface moderne** avec HTML/CSS
- ✅ **Sauvegarde sécurisée** de la configuration
- ✅ **Raccourcis** Bureau et Menu Démarrer

## 🔑 Configuration

La configuration est stockée dans :
- Windows: `%APPDATA%/EpiGrader/config.json`

## 📝 License

MIT