# tp-dashboard-taverne

Tableau de bord du Maître du Jeu pour La Taverne aux PNJ.

- **back/** : API Node.js / Express (port 3000), PostgreSQL sur Neon, authentification JWT + bcrypt
- **front/** : interface Next.js (port 3001)
- **db/** : scripts SQL

## Prérequis
- Node.js 18 ou plus
- Une base PostgreSQL Neon

## 1. Base de données
Dans la console SQL de Neon, exécuter :
1. `db/personnages.sql` (table des personnages, attention : efface les données existantes)
2. `db/schema.sql` (table des utilisateurs)

## 2. Back
```bash
cd back
npm install
```
Copier `.env.example` en `.env` et remplir :
```
DATABASE_URL=<url Neon>
PORT=3000
FRONT_URL=http://localhost:3001
JWT_SECRET=<clé secrète longue>
```
Générer la clé secrète :
```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```
Créer le compte du Maître du Jeu (mot de passe haché avec bcrypt) :
```bash
npm run creer-mj -- maitre "MotDePasse"
```
Lancer l'API :
```bash
npm start
```

## 3. Front
```bash
cd front
npm install
```
Copier `.env.local.example` en `.env.local`, puis :
```bash
npm run dev
```
Ouvrir http://localhost:3001 et se connecter avec le compte créé.

## Routes de l'API
| Méthode | URL | Accès | Description |
|---|---|---|---|
| POST | /api/auth/login | public | Renvoie un JWT (body : `login`, `motDePasse`) |
| GET | /api/pnj | public | Liste des personnages |
| POST | /api/pnj | JWT requis | Crée un personnage (body : `nom`, `classe`, `niveau`) |

Le JWT s'envoie dans l'en-tête `Authorization: Bearer <token>`.

## Sécurité
- Mots de passe hachés avec bcrypt
- API sans session (JWT)
- Secrets dans `.env`, jamais versionnés
- Requêtes SQL paramétrées
- CORS limité à `http://localhost:3001`