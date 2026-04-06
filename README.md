# EpiGrader

Application web d'évaluation automatique des projets Epitech.

## 🎯 Mission

**Input** : Barème de notation + URL repo GitHub  
**Output** : Rapport de notation avec ✅/❌ et justifications LLM

## 🛠 Stack Technique

| Couche | Technologie |
|--------|-------------|
| Frontend | React 18, TypeScript, Vite, Tailwind CSS |
| Backend | Node.js 20, Express, TypeScript |
| Tests | Jest (backend), Vitest (frontend) |
| LLM | Moonshot API (Kimi) |
| CI/CD | GitHub Actions |
| Deploy | Docker + Docker Compose |

## 📁 Structure

```
epigrader/
├── backend/          # API Node.js + Express
├── frontend/         # React + Vite
├── .github/          # GitHub Actions
└── docker-compose.yml
```

## 🚀 Démarrage

### Prérequis
- Node.js 20+
- Docker (optionnel)

### Local
```bash
# Backend
cd backend
npm install
npm run dev

# Frontend (autre terminal)
cd frontend
npm install
npm run dev
```

### Docker
```bash
docker-compose up
```

## 📊 Tests

```bash
# Backend
cd backend && npm test

# Frontend
cd frontend && npm test
```

## 📋 User Stories

1. **US1** : Parser et structurer un barème
2. **US2** : Connexion GitHub avec PAT
3. **US3** : Analyser un repository GitHub
4. **US4** : Générer un rapport de notation
5. **US5** : Éditer et valider la notation
6. **US6** : Exporter le rapport

## 📚 Documentation

- [Cahier des Charges Fonctionnel](EPIGRADER_CDC_FONCTIONNEL.md)
- [Cahier des Charges Technique](EPIGRADER_CDC_TECHNIQUE.md)
- [Index du Projet](EPIGRADER_INDEX.md)

## 📝 License

MIT
