# AppCorrect

Application web PWA d'aide a la redaction et a l'autocorrection pedagogique pour les eleves du CP a la Terminale.

## Lancer le projet

```bash
npm install
npm run dev
```

## Scripts utiles

- `npm run dev` : lance le serveur Vite.
- `npm run build` : verifie TypeScript puis construit l'application.
- `npm run lint` : execute ESLint.

## Fonctionnalites

- Configuration eleve/professeur/matiere/langue.
- Editeur mobile-first avec page blanche et sauvegarde automatique locale.
- Moteur de correction extensible par niveau scolaire.
- Infobulles pedagogiques sans correction immediate.
- Export PDF A4 avec identite, titre centre et interligne 1.5.
