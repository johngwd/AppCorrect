# Correcteur Académique

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

- Interface "Notion-meets-Apple" avec en-tete academique compact au scroll.
- Editeur mobile-first avec feuille A4 centrale et barre d'outils flottante.
- Moteur `checkText(text, level, lang)` multilingue et extensible.
- Infobulles pedagogiques animees avec Framer Motion, sans correction immediate.
- Export PDF A4 avec identite, titre centre et interligne 1.5.
