# SUP Herman — Gestion des notes de frais

Application full-stack (NestJS + Next.js + Supabase Postgres/Storage) — Dockerisée

---

## Sommaire

* [Aperçu]
* [Architecture]
* [Prérequis]
* [Installation]
* [Configuration (variables d’environnement)]
* [Lancer le projet en local]
* [Comptes & rôles]
* [Manuel utilisateur]
* [Documentation technique]
* [Tests]
* [Dépannage]
* [Licence]

---

## Aperçu

Application interne de gestion des notes de frais pour **SUP Herman** :

* **Employé** : crée, liste et consulte ses notes de frais.
* **Manager** : valide/refuse les notes, crée des comptes utilisateurs.
* **Comptabilité** : voit les notes validées/traitées, marque “Traitée”.

Technos principales : **NestJS (API)**, **Next.js (Front)**, **Supabase Postgres + Storage**, **JWT**, **RBAC**, **Docker**.

---

## Architecture

```
xfint/
  backend/ (NestJS)
    src/
      modules/ (Auth, Expenses,Health, Userss, Storage)
      common/ (decorators, guards )
      config/ (toutes les configurations configs typeorm & supabase)
      seeds/
      setup/(creations des tables dans la base de données)
  frontend/ (Next.js)
    src/ (pages, UI, appels API...)
 (docker-compose.yml, Dockerfiles)
```

**Backend (NestJS)**

* Authentification JWT, `JwtStrategy`, `JwtAuthGuard`
* Guards: `RolesGuard`, `FirstLoginGuard`
* Décorateurs: `@CurrentUser()`, `@Roles(...)`
* Modules: `AuthModule`, `ExpensesModule`
* ORM: TypeORM (Postgres Supabase)

**Frontend (Next.js)**

* Pages: Connexion, Mes notes, Toutes les notes (manager/compta), Profil, Création de comptes
* UI moderne (Tailwind/shadcn si présent)
* Appels REST vers l’API NestJS

**Base de données (Supabase Postgres)**

* Tables: `users`, `expenses`, `expense_files`, `roles`, `password_reset_tokens`, etc.
* Stockage des pièces: Supabase Storage ou table `expense_files` (bytea) selon config

---

## Prérequis

* **Docker** ≥ 24 + **Docker Compose**
* **Node.js** ≥ 20 (si exécution hors Docker)
* **npm** ou **npm** (selon votre préférence)
* Compte **Supabase** (url + clés) si vous utilisez Supabase managé

---

## Installation

### 1) Cloner le dépôt

```bash
git clone https://github.com/EmmahusOndongo/xFint
cd xFint
```

### 2) Choisir le mode d’exécution

* **Full Docker (recommandé)** : aucune dépendance locale hors Docker.
* **Local** : API/Front en local, BDD Supabase distante (ou locale si vous avez un conteneur Postgres).

---

## Configuration (variables d’environnement)

### Fichier racine `.env`

Créez un fichier `.env` à la racine du Backend (ou utilisez ceux déjà fournis). Adaptez selon vos secrets/envs.

```ini
# ---------- GLOBAL ----------
# Node env
NODE_ENV=development

# ---------- SUPABASE ----------
SUPABASE_URL=https://<your-project>.supabase.co
# Admin Service Role key (garder secret !) pour opérations serveur (ex: storage, upserts)
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI...
# Key publique pour le front si nécessaire
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI...

# ---------- POSTGRES ----------
# Si vous utilisez Supabase Postgres managé, récupérez host/port/db/user/pass
PG_HOST=<host>
PG_PORT=5432
PG_DATABASE=<database>
PG_USER=<user>
PG_PASSWORD=<password>
PG_SSL=true

# ---------- AUTH / JWT ----------
JWT_SECRET=<long-secret-aleatoire>
JWT_EXPIRES_IN=7d
PASSWORD_RESET_TOKEN_EXPIRES_IN_MIN=30

# ---------- FILES / STORAGE ----------
# Mode de stockage des pièces justificatives: "supabase" ou "database"
EXPENSE_FILES_STORAGE_MODE=supabase
SUPABASE_STORAGE_BUCKET=expense-files

# ---------- BACKEND ----------
API_PORT=5000
API_CORS_ORIGIN=http://localhost:3000

# ---------- FRONTEND ----------

Créez un fichier `.env.local` à la racine du Frontend (ou utilisez ceux déjà fournis). Adaptez selon vos secrets/envs.

NEXT_PUBLIC_API_BASE_URL=http://localhost:5000
NEXT_PUBLIC_SUPABASE_URL=${SUPABASE_URL}
NEXT_PUBLIC_SUPABASE_ANON_KEY=${SUPABASE_ANON_KEY}
```

> Des fichiers présents dans le repo (ex: `supabase.config.ts`, `typeorm.config.ts`, `auth.config.ts`, etc.) lisent ces variables. Assurez-vous que les clés **JWT** et **Service Role** ne soient **jamais** commitées.

### Variables Docker

Si vous utilisez `docker-compose.yml`, un fichier `infra/docker/.env` peut surcharger des valeurs pour prod/staging.

---

## Lancer le projet en local

### Option A — Docker (recommandé)

1. **D démarrer l’infra + xfint**

```bash
docker-compose up --build
```

2. **Services attendus**

* API NestJS : [http://localhost:5000](http://localhost:5000)
* Front Next.js : [http://localhost:3000](http://localhost:3000)
* (Optionnel) Postgres local : [http://localhost:5432](http://localhost:5432) (si vous ne pointez pas Supabase)

3. **Migrations & buckets**

* Si nécessaire, le `entrypoint` du backend exécute les migrations TypeORM.
* Créez le bucket Supabase `expense-files` (si non créé automatiquement) via dashboard Supabase.

### Option B — Local (Node)

**Backend**

```bash
cd xfint/backend
npm i           # ou npm i
npm start:dev   # ou npm run start:dev
# API sur http://localhost:5000
```

**Frontend**

```bash
cd ../frontend
npm i           # ou npm i
npm dev         # ou npm run dev
# Front sur http://localhost:3000
```

---

## Comptes & rôles

Rôles pris en charge : **employee**, **manager**, **accounting**.

* **Création de comptes** : via Page 6 (réservée **Manager**).
* **Première connexion** : l’utilisateur reçoit un mot de passe temporaire (ou un lien de set-password) → redirection *first login* → définition du mot de passe personnel (guard `FirstLoginGuard`).
* **Gestion des droits** : via `RolesGuard` et décorateur `@Roles('manager')` etc.

---

## Manuel utilisateur

### Page 1 — Connexion

* Saisir *email + mot de passe*.
* Si “première connexion” → un écran vous demandera de définir un mot de passe personnel.

### Page 2 — Mes notes de frais (Employé/Manager/Comptabilité)

* Tableau listant vos notes : **titre**, **statut** (Créée, Validée, Refusée, Traitée), **date de soumission**.
* Cliquer sur une ligne pour ouvrir la **modale de détails** (titre, justificatifs, date, statut, commentaire).

### Page 3 — Créer une note

* Formulaire : **titre**, **commentaire**, **pièces justificatives** (une ou plusieurs).
* Enregistrer pour créer la note avec statut **Créée**.

### Page 4 — Notes de tous les employés

* Pour **Manager** : voir toutes les notes, bouton **Valider** / **Refuser**.
* Pour **Comptabilité** : voir seulement **Validées** et **Traitées**, bouton **Marquer comme “Traitée”**.

### Page 5 — Profil

* Affiche **email** et **rôle** de l’utilisateur connecté.

### Page 6 — Création de comptes (Manager)

* Créer un utilisateur : **email** + **rôle** (Employé/Manager/Comptabilité).
* L’utilisateur définira son mot de passe lors de sa première connexion.

---

## Documentation technique

### Authentification & sécurité

* **JWT**: `Authorization: Bearer <token>`

  * `JwtStrategy` + `JwtAuthGuard` protègent les routes.
* **First login**: `FirstLoginGuard` force la mise à jour du mot de passe si `user.first_login = true`.
* **RBAC**: `@Roles('manager' | 'accounting' | 'employee')` + `RolesGuard`.

### Entités principales (extrait)

* **User**: `id`, `email (unique)`, `role (enum)`, `password_hash`, `first_login`, `created_at`
* **Expense**: `id`, `title`, `comment`, `status (enum: created|approved|rejected|processed)`, `submitted_at`, `user_id (FK)`
* **ExpenseFile**: `id`, `expense_id (FK)`, `filename`, `mime_type`, `size`, `storage_key` (si Supabase Storage), **ou** `file_bytes (bytea)` si stockage base

> Les fichiers sont stockés soit dans **Supabase Storage** (recommandé), soit directement en base (`bytea`), selon `EXPENSE_FILES_STORAGE_MODE`.

### Endpoints API (exemples)

**Auth**

* `POST /auth/login` → { token, user }
* `POST /auth/set-password` (first login)
* `GET  /auth/me` → profil utilisateur courant

**Expenses (Employé)**

* `GET  /expenses/my` → liste des notes de l’utilisateur
* `POST /expenses` → créer une note (multipart, fichiers)
* `GET  /expenses/:id` → détails
* `GET  /expenses/:id/files/:fileId/download` → téléchargement

**Expenses (Manager)**

* `GET  /expenses` → toutes les notes
* `PATCH /expenses/:id/approve` → statut = Validée
* `PATCH /expenses/:id/reject` → statut = Refusée

**Expenses (Comptabilité)**

* `GET  /expenses?status=approved,processed`
* `PATCH /expenses/:id/process` → statut = Traitée

**Users (Manager)**

* `POST /users` → création d’un compte (email + rôle)
* `GET  /users` → liste (si nécessaire)

> Les guards et rôles protègent chaque route. Voir `auth.controller.ts`, `auth.service.ts`, `expenses.controller.ts`, `expenses.service.ts`, `roles.guard.ts`, etc.

### Upload & fichiers

* **Frontend** : formulaire multipart (drag\&drop ou input file).
* **Backend** : Multer (ou Fastify multipart) → selon `EXPENSE_FILES_STORAGE_MODE` :

  * **supabase** : upload vers bucket `expense-files`, `storage_key` stocké en DB.
  * **database** : enregistrement du binaire en `bytea`.

### TypeORM & migrations

* Config : `typeorm.config.ts`
* Migrations (exemple) :

```bash
npm typeorm migration:run   # depuis xfint/backend
# ou npm run typeorm -- migration:run
```

### Configuration Supabase

* `supabase.config.ts` expose deux clients :

  * **Admin** (Service Role) pour opérations serveur
  * **Anon** pour opérations publiques (si nécessaire côté front)
* Créer le **bucket** `expense-files` et, si besoin, ajuster les **policies**.

---

## Tests

**API (E2E/unit)**

```bash
cd xfint/backend
npm test       # unit
npm test:e2e   # e2e
```

**Collection Postman**

* Un fichier `postman_collection.json` (à ajouter) peut être importé pour tester `auth`, `expenses`, `users`.
* Renseignez les variables d’environnement `baseUrl`, `token`.

---

## Dépannage

* **401 / 403** : vérifiez le header `Authorization: Bearer <token>` et les **rôles** de l’utilisateur.
* **CORS** : mettez à jour `API_CORS_ORIGIN` (ex: `http://localhost:3000`) et redémarrez l’API.
* **Upload fichiers** : assurez-vous que `SUPABASE_SERVICE_ROLE_KEY` est valide et que le bucket existe.
* **Migrations** : lancez `migration:run` et vérifiez les variables Postgres (`PG_*`).
* **First login** : si bloqué, vérifiez la valeur `first_login` dans `users` et utilisez `/auth/set-password`.

---

## Licence

Usage interne SUP Herman. © 2025 SUP Herman — Tous droits réservés.

---