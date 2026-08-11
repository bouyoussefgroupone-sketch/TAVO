# TAVO — V1 locale

TAVO est un catalogue visuel mobile-first de plats et d’expériences culinaires. Le client découvre d’abord un plat, choisit un restaurant partenaire, consulte son menu TAVO, puis peut commander uniquement après validation de sa présence physique. Aucun compte client ni paiement en ligne n’est utilisé.

## Installation et lancement

Prérequis : Node.js 22 ou plus récent.

```bash
npm install
copy .env.example .env.local
npm run db:migrate
npm run db:seed
npm run dev
```

Ouvrir [http://localhost:3000](http://localhost:3000). L’entrée Wallet simulée est disponible sur [http://localhost:3000/wallet](http://localhost:3000/wallet).

Pour recréer intégralement la base locale :

```bash
npm run db:reset
npm run db:migrate
npm run db:seed
```

## Comptes de développement

| Rôle | Email | Mot de passe | Périmètre |
|---|---|---|---|
| Admin | `admin@tavo.local` | `TavoAdmin!2026` | Global |
| Manager | `manager.rabat@tavo.local` | `TavoManager!2026` | Rabat · Agdal |
| Partner | `partner.noya@tavo.local` | `TavoPartner!2026` | Atelier Noya |

Connexion : [http://localhost:3000/login](http://localhost:3000/login). Les routes `/admin`, `/manager` et `/partner` sont aussi protégées côté serveur.

## Parcours et architecture

- `/`, `/search`, `/dish/[slug]`, `/restaurant/[slug]`, `/collection/[slug]` : catalogue dynamique issu de PostgreSQL local.
- `/crown` et `/crown/[slug]` : univers Crown curaté et offres par restaurant.
- `/wallet` : entrée/deep-link locale. `lib/wallet.ts` définit la frontière d’intégration des futurs passes signés.
- `/api/presence/check` : contrôle ponctuel distance/rayon/précision et émission d’une autorisation opaque, courte et limitée au restaurant.
- `/api/orders` : panier complet, visite anonyme temporaire, références `G001-01`, `G001-02`, instantanés de lignes immuables et retour de validation.
- `/api/professional` : opérations Admin, Manager et Partner avec contrôle de rôle et de périmètre côté serveur.
- `/api/media` : stockage local derrière un adaptateur remplaçable.

La base locale utilise PGlite et les migrations SQL de `migrations/`. Le schéma reste PostgreSQL standard pour permettre le passage à une base managée. Les mots de passe sont hachés avec bcrypt, les sessions professionnelles sont opaques et stockées dans des cookies `httpOnly`.

## Règles de confidentialité

- Aucun compte, profil, PII ou fingerprint client.
- La navigation seule ne crée aucune visite.
- Aucune position ou trajectoire client n’est conservée ; seules les coordonnées fixes des restaurants existent dans le schéma.
- Une visite anonyme, limitée au restaurant et expirante, n’est créée qu’au premier ordre.
- Chaque soumission crée une nouvelle commande immuable ; seuls ses statuts opérationnels peuvent évoluer avec audit.

Le contrôle `DEV · PRÉSENCE` est activé uniquement par `NEXT_PUBLIC_ENABLE_GEO_SIMULATOR=true`. Il doit être désactivé en production. Même en simulation, le serveur émet l’autorisation exigée par la soumission.

## Vérification

```bash
npm test
npm run lint
npm run build
```

Les tests couvrent notamment la géolocalisation, l’expiration et la portée des autorisations, les rôles, le périmètre Manager, la relation plat/restaurants, la limite de deux plats mis en avant, l’archivage sûr, les séquences de visite/commande, l’immutabilité, les propositions, la facturation et les invariants de confidentialité.

## Passage futur en production

Il restera à fournir : un dépôt GitHub privé, un projet Vercel et ses variables d’environnement, une URL PostgreSQL managée compatible avec les migrations, un adaptateur de stockage objet et ses clés, puis les comptes/certificats Apple Developer et Google Wallet nécessaires à la signature réelle des passes. Aucun pass Wallet signé n’est prétendu dans cette V1 locale.
