# Dashboard Principale (PFA)

Application **Next.js** (App Router) dans :

- `PFA/dashboard principale`

## Données

Le dashboard lit les donnees selon cet ordre :

1. Prisma/PostgreSQL (source principale en production via `DATABASE_URL`).
2. `PFA/database/all-data.xlsx` (local, feuille `hexabyte-02022026`).
3. `PFA/dashboard principale/data/data.xlsx` (fallback deployable).

### Import du gros fichier Excel vers Prisma

```powershell
cd "c:\Users\yassi\OneDrive\Desktop\PFA\dashboard principale"
npm run db:push
npm run db:import:xlsx
```

Le script `db:import:xlsx` lit `PFA/database/all-data.xlsx` et remplit la table `Incident` de la base Prisma.

### Variables Vercel requises

- `DATABASE_URL`
- `PRISMA_DATABASE_URL`

## Lancer localement

```powershell
cd "c:\Users\yassi\OneDrive\Desktop\PFA\dashboard principale"
npm install
npm run dev
```

Puis ouvrez :

- `http://127.0.0.1:3010/`

Routes :

- `/` — Vue globale
- `/interventions`
- `/performance`
- `/reclamations`
- `/pareto`
- `/offres-produits`
- `/regions`
- `/resolutions-tt`
- `/actions-fsi`
- `/delais-sla`
- `/detail-lignes`

## Notes

- Les filtres sont pilotés par l’URL (`period`, `region`, `offer`, `month`, `mode`).

## Ancienne démo statique (optionnelle)

Les fichiers `index.html`, `styles.css`, `app.js` peuvent rester comme référence, mais le parcours principal est désormais Next.js.
