# TAVO — prototype local

Prototype interactif haute fidélité du catalogue visuel TAVO. Cette étape utilise uniquement des données de démonstration et ne contient volontairement ni base de données, ni authentification, ni géolocalisation réelle, ni facturation.

## Lancer en local

Prérequis : Node.js 22 ou plus récent.

```bash
npm install
npm run dev
```

Ouvrir [http://localhost:3000](http://localhost:3000).

## Parcours principaux

- `/wallet` — entrée simulée depuis Wallet
- `/` — accueil et découverte
- `/search` — recherche et catégories
- `/collection/frais-et-vif` — collection éditoriale
- `/dish/cesar-signature` — détail et offres multi-restaurants
- `/restaurant/atelier-noya` — menu, simulation de présence et commandes G001-01 / G001-02
- `/crown` — univers Crown
- `/crown/la-table-apres-minuit` — détail d’une expérience Crown
- `/partner`, `/manager`, `/admin` — interfaces professionnelles représentatives

Dans la page restaurant, le contrôle discret `DEV · PRÉSENCE` permet de passer de l’état extérieur à l’état sur place.

## Vérification

```bash
npm run lint
npm run build
```

Le développement du backend V1 reste bloqué jusqu’à l’instruction exacte prévue dans le brief.
