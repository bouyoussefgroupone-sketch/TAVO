# TAVO

TAVO est un catalogue visuel mobile-first de plats et d’expériences culinaires. Le client découvre un plat, choisit un restaurant, consulte son menu TAVO et peut commander uniquement après validation serveur de sa présence physique. Aucun compte client ni paiement en ligne n’est utilisé.

## Développement local

Prérequis : Node.js 22 ou plus récent.

```bash
npm install
copy .env.example .env.local
npm run db:migrate
npm run db:seed
npm run dev
```

Application : [http://localhost:3000](http://localhost:3000)

Pass TAVO et ajout Google Wallet (mode test) : [http://localhost:3000/wallet](http://localhost:3000/wallet)

Connexion professionnelle : [http://localhost:3000/login](http://localhost:3000/login)

Sans `DATABASE_URL`, TAVO utilise PGlite dans `DATABASE_PATH`. Sans `BLOB_READ_WRITE_TOKEN`, les médias sont stockés sous `MEDIA_ROOT`. Ces données locales et `.env.local` sont ignorées par Git.

Comptes de démonstration locaux :

| Rôle | Email | Mot de passe |
|---|---|---|
| Admin | `admin@tavo.local` | `TavoAdmin!2026` |
| Manager | `manager.rabat@tavo.local` | `TavoManager!2026` |
| Partner | `partner.noya@tavo.local` | `TavoPartner!2026` |

Ces identifiants ne sont jamais créés lorsque `DATABASE_URL` cible PostgreSQL.

## Base de données et initialisation

```bash
npm run db:migrate
npm run db:seed
npm test
```

Le schéma SQL de `migrations/` fonctionne avec PGlite local et PostgreSQL managé. En production, `DATABASE_URL` sélectionne le pool PostgreSQL. `vercel-build` applique uniquement les migrations manquantes avant le build.

L’initialisation d’une base de production vide exige temporairement `TAVO_ALLOW_PRODUCTION_SEED=true`, `TAVO_BOOTSTRAP_ADMIN_EMAIL` et `TAVO_BOOTSTRAP_ADMIN_PASSWORD`. Elle refuse une base non vide, ne crée aucun Manager/Partner de démonstration et ne doit être exécutée qu’une fois. Les deux variables de bootstrap doivent ensuite être retirées.

## Architecture Vercel

- Vercel héberge l’application Next.js et fournit les déploiements Preview/Production.
- Neon, provisionné via Vercel Marketplace, fournit PostgreSQL managé.
- Vercel Blob conserve les images publiques de catalogue via l’adaptateur `MediaStorage`.
- Les sessions professionnelles et autorisations de présence restent opaques, expirantes, `httpOnly` et contrôlées côté serveur.
- Aucune position client brute, trajectoire ou identité client n’est persistée.

Variables persistantes Vercel nécessaires : `DATABASE_URL`, `BLOB_READ_WRITE_TOKEN`. `DATABASE_POOL_MAX` est optionnelle. `NEXT_PUBLIC_ENABLE_GEO_SIMULATOR` doit rester absente ou à `false` dans Preview et Production.

## Git et déploiements

GitHub est la source de vérité :

```text
branche non-main → push GitHub → Vercel Preview
main             → push GitHub → Vercel Production
```

Les changements applicatifs doivent être commités et poussés depuis Git ; aucune modification de source ne doit être faite uniquement dans Vercel. Le domaine Vercel HTTPS est utilisé jusqu’à la configuration ultérieure du domaine final.

## Vérification

```bash
npm test
npm run lint
npm run build
npm audit --omit=dev
```

Les tests couvrent notamment rôles/périmètres, géolocalisation, autorisations expirantes, limite de deux plats mis en avant, relations plat/restaurants, archivage sûr, visites anonymes, séquences `G001-01`/`G001-02`, immutabilité, propositions, facturation et confidentialité.

## Wallet

`/wallet` génère côté serveur un lien Google Wallet signé pour le pass générique TAVO de test. Le compte de service Google Wallet doit être configuré uniquement dans les variables d’environnement du serveur ; aucune clé privée n’est exposée au navigateur ni versionnée.
