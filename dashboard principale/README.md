# Dashboard Principale (PFA)

Application **Next.js** (App Router) dans :

- `PFA/dashboard principale`

## Données

Le dashboard lit le fichier global :

- `PFA/database/all-data.xlsx` (feuille `hexabyte-02022026`)

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
