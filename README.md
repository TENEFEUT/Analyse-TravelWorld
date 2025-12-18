# 🌍 TravelWorld - Plateforme d'Immigration Intelligente

> Une plateforme complète pour accompagner les utilisateurs dans leurs projets d'immigration grâce à l'intelligence artificielle.

![Next.js](https://img.shields.io/badge/Next.js-15-black)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue)
![Prisma](https://img.shields.io/badge/Prisma-ORM-2D3748)
![License](https://img.shields.io/badge/license-MIT-green)

---

##  Table des matières

- [À propos](#-à-propos)
- [Fonctionnalités](#-fonctionnalités)
- [Technologies](#-technologies)
- [Prérequis](#-prérequis)
- [Installation (Développeurs)](#-installation-développeurs)
- [Configuration](#-configuration)
- [Utilisation](#-utilisation)
- [Structure du projet](#-structure-du-projet)
- [API Routes](#-api-routes)
- [Déploiement](#-déploiement)
- [Contribution](#-contribution)

---

##  À propos

**TravelWorld** est une plateforme SaaS moderne qui aide les utilisateurs à gérer leurs projets d'immigration de A à Z. L'application combine l'intelligence artificielle, l'automatisation et des guides détaillés pour simplifier les procédures complexes d'immigration vers différents pays.

### Pour les non-développeurs

TravelWorld est comme un **assistant personnel d'immigration** qui :
- ✅ Analyse votre profil (éducation, expérience, langues)
- ✅ Recommande les meilleurs pays selon votre situation
- ✅ Crée un dossier personnalisé avec toutes les étapes à suivre
- ✅ Vous guide pas-à-pas dans chaque démarche
- ✅ Répond à vos questions 24/7 grâce à un chatbot IA
- ✅ Centralise tous vos documents au même endroit

---

##  Fonctionnalités

###  Authentification & Profil
- Inscription et connexion sécurisées (JWT)
- Vérification d'email avec Brevo
- Gestion complète du profil utilisateur
- Onglets : Informations personnelles, Éducation, Expérience, Langues

###  Analyse de Faisabilité
- Analyse IA de votre profil complet
- Recommandations de pays personnalisées avec scores
- Justifications détaillées pour chaque destination
- Estimation des coûts et délais

###  Gestion de Dossiers
- Création automatique de dossiers par pays
- **10 pays supportés** : France, Canada, Belgique, Allemagne, USA, Luxembourg, Suisse, Italie, Espagne, Chine
- Étapes et sous-étapes détaillées selon le pays
- Suivi de progression avec statuts
- Upload de preuves et documents

###  Chatbot IA
- Assistant virtuel alimenté par OpenAI GPT
- Réponses personnalisées selon votre profil
- Mode DEMO disponible sans crédits OpenAI
- Historique de conversation

###  Gestion de Documents
- Upload et stockage sécurisé
- Catégorisation automatique
- Téléchargement et partage

###  Interface Utilisateur
- Design Instagram épuré et moderne
- Responsive (mobile, tablette, desktop)
- Thème gradient violet/bleu
- Animations fluides

---

## 🛠 Technologies

### Frontend
- **Next.js 15** - Framework React avec App Router
- **TypeScript** - Typage statique
- **CSS Modules** - Styling avec approche Instagram

### Backend
- **Next.js API Routes** - Backend serverless
- **Prisma ORM** - Gestion de base de données
- **PostgreSQL** - Base de données relationnelle

### Services Externes
- **OpenAI GPT-3.5/4** - Intelligence artificielle
- **Brevo (Sendinblue)** - Envoi d'emails transactionnels
- **Vercel** - Hébergement et déploiement

### Sécurité
- **bcrypt** - Hachage des mots de passe
- **jsonwebtoken** - Authentification JWT
- **Validation côté serveur** - Protection des API

---

##  Prérequis

Avant de commencer, assurez-vous d'avoir installé :

### Obligatoire
- **Node.js** 18.x ou supérieur ([Télécharger](https://nodejs.org/))
- **npm** 9.x ou supérieur (inclus avec Node.js)
- **PostgreSQL** 14.x ou supérieur ([Télécharger](https://www.postgresql.org/download/))

### Optionnel (mais recommandé)
- **Git** pour le contrôle de version
- **VS Code** comme éditeur de code
- Un compte **OpenAI** avec des crédits ([S'inscrire](https://platform.openai.com/))
- Un compte **Brevo** pour les emails ([S'inscrire](https://www.brevo.com/))

---

## 🚀 Installation (Développeurs)

### 1. Cloner le projet

```bash
git clone https://github.com/TENEFEUT/travelworld.git
cd travelworld
```

### 2. Installer les dépendances

```bash
npm install
```

### 3. Créer la base de données PostgreSQL

```bash
# Connectez-vous à PostgreSQL
psql -U postgres

# Créez la base de données
CREATE DATABASE travelworld;

# Quittez psql
\q
```

### 4. Configurer les variables d'environnement

Créez un fichier `.env` à la racine du projet :

```bash
cp .env.example .env
```

Remplissez le fichier `.env` avec vos informations :

```env
# Base de données
DATABASE_URL="postgresql://username:password@localhost:5432/travelworld?schema=public"

# JWT Secret (générez une chaîne aléatoire sécurisée)
JWT_SECRET="votre_secret_jwt_tres_securise_ici"

# OpenAI (Optionnel - utilisez le mode DEMO sans)
OPENAI_API_KEY="sk-proj-votre_cle_api_openai"

# Brevo Email (Optionnel - mode DEBUG sans)
BREVO_API_KEY="xkeysib-votre_cle_api_brevo"
EMAIL_FROM="noreply@votredomaine.com"

# URL de l'application
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

### 5. Initialiser la base de données

```bash
# Générer le client Prisma
npx prisma generate

# Créer les tables
npx prisma db push

# (Optionnel) Seed de données de test
npx prisma db seed
```

### 6. Lancer le serveur de développement

```bash
npm run dev
```

Ouvrez [http://localhost:3000](http://localhost:3000) dans votre navigateur.

---

##  Configuration

### Mode DEMO (Sans OpenAI)

Si vous n'avez pas de crédits OpenAI, activez le mode DEMO :

**Fichier : `/src/app/api/ai/route.ts`**
```typescript
const DEMO_MODE = true; // ← Mettre à true
```

Le chatbot fonctionnera avec des réponses pré-programmées intelligentes.

### Mode DEBUG Email (Sans Brevo)

Si vous n'avez pas configuré Brevo, activez le mode DEBUG :

**Fichier : `/src/lib/email-brevo.ts`**
```typescript
const DEBUG_MODE = true; // ← Mettre à true
```

Les liens de vérification s'afficheront dans la console du terminal.

### Ajouter des crédits OpenAI

1. Allez sur [OpenAI Platform](https://platform.openai.com/account/billing)
2. Ajoutez au minimum **$5-10** de crédits
3. Générez une nouvelle clé API
4. Ajoutez-la dans votre fichier `.env`
5. Redémarrez le serveur

### Configurer Brevo

1. Créez un compte sur [Brevo](https://www.brevo.com/)
2. Générez une clé API sur [Settings > API Keys](https://app.brevo.com/settings/keys/api)
3. Ajoutez un expéditeur vérifié sur [Senders](https://app.brevo.com/senders/list)
4. Ajoutez la clé dans votre `.env`
5. Redémarrez le serveur

---

##  Utilisation

### Pour les utilisateurs

1. **Inscription**
   - Créez un compte avec email et mot de passe
   - Vérifiez votre email (lien dans la console en mode DEBUG)

2. **Complétez votre profil**
   - Ajoutez votre éducation, expérience professionnelle
   - Indiquez vos compétences linguistiques

3. **Faites une analyse de faisabilité**
   - Obtenez des recommandations de pays personnalisées
   - Consultez les scores et justifications

4. **Créez un dossier**
   - Choisissez un pays recommandé
   - Suivez les étapes détaillées avec sous-étapes
   - Uploadez vos documents et preuves

5. **Utilisez le chatbot**
   - Posez vos questions 24/7
   - Obtenez des réponses personnalisées selon votre profil

### Pour les développeurs

#### Commandes utiles

```bash
# Lancer en développement
npm run dev

# Build de production
npm run build

# Lancer en production
npm start

# Linter
npm run lint

# Formater le code
npm run format

# Prisma Studio (interface graphique DB)
npx prisma studio

# Voir les logs Prisma
npx prisma db push --help
```

#### Tests

```bash
# Tests unitaires (si configurés)
npm test

# Tests E2E (si configurés)
npm run test:e2e
```

---

##  Structure du projet

```
travelworld/
├── prisma/
│   ├── schema.prisma          # Schéma de base de données
│   └── seed.ts                # Données de test
├── public/                    # Fichiers statiques
├── src/
│   ├── app/                   # App Router Next.js
│   │   ├── api/               # API Routes
│   │   │   ├── auth/          # Authentification
│   │   │   ├── ai/            # Chatbot IA
│   │   │   ├── analysis/      # Analyse de faisabilité
│   │   │   ├── cases/         # Gestion de dossiers
│   │   │   ├── profile/       # Gestion du profil
│   │   │   └── upload/        # Upload de fichiers
│   │   ├── auth/              # Pages d'authentification
│   │   │   ├── login/
│   │   │   ├── signup/
│   │   │   ├── verify/
│   │   │   └── forgot-password/
│   │   ├── dashboard/         # Tableau de bord
│   │   ├── profil/            # Page profil
│   │   ├── chatbot/           # Page chatbot
│   │   ├── analysis/          # Résultats d'analyse
│   │   ├── case/              # Détails de dossier
│   │   └── layout.tsx         # Layout principal
│   ├── components/            # Composants réutilisables
│   │   ├── Navbar.tsx
│   │   └── profile/
│   │       ├── PersonalInfoTab.tsx
│   │       ├── EducationTab.tsx
│   │       ├── WorkExperienceTab.tsx
│   │       └── LanguagesTab.tsx
│   └── lib/                   # Utilitaires
│       ├── prisma.ts          # Client Prisma
│       ├── auth.ts            # Fonctions d'authentification
│       └── email-brevo.ts     # Envoi d'emails
├── .env                       # Variables d'environnement (à créer)
├── .env.example               # Exemple de variables
├── .gitignore
├── next.config.js
├── package.json
├── tsconfig.json
└── README.md
```

---

##  API Routes

### Authentification
- `POST /api/auth` - Inscription/Connexion
- `GET /api/auth/verify` - Vérification d'email

### Profil
- `GET /api/profile` - Récupérer le profil
- `PUT /api/profile` - Mettre à jour le profil
- `POST /api/profile/education` - Ajouter une formation
- `DELETE /api/profile/education` - Supprimer une formation
- `POST /api/profile/work` - Ajouter une expérience
- `POST /api/profile/languages` - Ajouter une langue

### Analyse
- `POST /api/analysis` - Créer une analyse
- `GET /api/analysis` - Récupérer les analyses

### Dossiers
- `POST /api/cases` - Créer un dossier
- `GET /api/cases` - Récupérer les dossiers
- `PUT /api/cases/:id/steps` - Mettre à jour une étape

### Chatbot
- `POST /api/ai` - Envoyer un message au chatbot

### Upload
- `POST /api/upload` - Upload de fichier

---

##  Déploiement

### Sur Vercel (Recommandé)

1. **Créez un compte sur [Vercel](https://vercel.com/)**

2. **Importez votre projet GitHub**
   ```bash
   git push origin main
   ```

3. **Configurez les variables d'environnement**
   - Allez dans Settings > Environment Variables
   - Ajoutez toutes les variables de votre `.env`

4. **Déployez**
   - Vercel déploie automatiquement à chaque push
   - URL de production générée automatiquement

### Sur d'autres plateformes

#### Docker (Optionnel)

```dockerfile
# Créez un Dockerfile à la racine
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npx prisma generate
RUN npm run build
EXPOSE 3000
CMD ["npm", "start"]
```

```bash
# Build et lancer
docker build -t travelworld .
docker run -p 3000:3000 travelworld
```

---

## 🎨 Personnalisation

### Thème et couleurs

Les couleurs principales sont définies dans les fichiers CSS :
- Gradient : `#667eea` → `#764ba2` (bleu/violet)
- Bleu Instagram : `#0095f6`
- Fond : `#fafafa`
- Bordures : `#dbdbdb`

### Ajouter un nouveau pays

1. Ouvrez `/src/app/api/cases/route.ts`
2. Ajoutez votre pays dans la fonction `getPersonalizedSteps()`
3. Définissez les étapes et sous-étapes
4. Testez la création d'un dossier

---

## 🤝 Contribution

Les contributions sont les bienvenues ! Voici comment contribuer :

1. Forkez le projet
2. Créez une branche (`git checkout -b feature/AmazingFeature`)
3. Committez vos changements (`git commit -m 'Add some AmazingFeature'`)
4. Push vers la branche (`git push origin feature/AmazingFeature`)
5. Ouvrez une Pull Request

### Guidelines

- Suivez les conventions de code TypeScript
- Ajoutez des commentaires pour les fonctions complexes
- Testez vos changements avant de commit
- Mettez à jour la documentation si nécessaire

---

## 📝 License

Ce projet est sous licence MIT. Voir le fichier `LICENSE` pour plus de détails.

---

## 👥 Auteurs

- **Votre Nom <JEFFRICK TENEFEUT>** - *Développeur Principal* - [JEFFRICK](https://github.com/TENEFEUT)

---

## 🙏 Remerciements

- [Next.js](https://nextjs.org/) - Framework React
- [Prisma](https://www.prisma.io/) - ORM moderne
- [OpenAI](https://openai.com/) - Intelligence artificielle
- [Brevo](https://www.brevo.com/) - Service d'emailing
- [Vercel](https://vercel.com/) - Hébergement

---

## 📞 Support

Besoin d'aide ? Voici quelques ressources :

- 📖 [Documentation Next.js](https://nextjs.org/docs)
- 💬 [Issues GitHub](https://github.com/votre-username/travelworld/issues)
- 📧 Email : support@travelworld.com
- 🌐 Site web : https://travelworld.com

---

## 🔄 Changelog

### Version 1.0.0 (2025-01-XX)
- ✨ Lancement initial
- ✅ Authentification complète
- ✅ Gestion de profil
- ✅ Analyse de faisabilité IA
- ✅ 10 pays avec étapes détaillées
- ✅ Chatbot IA
- ✅ Upload de documents
- ✅ Design 

---

**Fait avec ❤️ par l'équipe TravelWorld <jeffrick>**