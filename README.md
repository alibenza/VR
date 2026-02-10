# 📱 Visite de Risques - PWA pour Assureurs

Application Progressive Web App (PWA) complète pour la collecte et l'analyse de visites de risques assurantielles. Fonctionne en mode **offline** avec synchronisation, scoring automatique, dashboard avancé et exports professionnels.

![Version](https://img.shields.io/badge/version-1.0.0-blue)
![PWA](https://img.shields.io/badge/PWA-ready-green)
![License](https://img.shields.io/badge/license-MIT-green)

---

## ✨ Fonctionnalités

### 🎯 Collecte terrain
- ✅ **Gestion Sites** : Industrie, Commerce, Hôpitaux, Hôtels, Administrations
- ✅ **Visites** : Date, auditeur, accompagnateurs, objectif, périmètre
- ✅ **Zones** : Bâtiments, usages, surfaces
- ✅ **Constats** : Famille de risques, points de contrôle, preuves
- ✅ **Photos** : Capture et stockage local (à implémenter en v1.1)

### 📊 Scoring automatique
- ✅ **Matrice 5×5** : Probabilité (1-5) × Gravité (1-5) → Score 1-25
- ✅ **Score Assureur** : (4 - Maîtrise) × Impact × 2 → Score 0-32
- ✅ **Criticité** : Faible / Modéré / Élevé / Critique / Catastrophique
- ✅ **Priorités** : P1 (Critique) / P2 (Moyenne) / P3 (Faible)

### 📈 Dashboard avancé
- ✅ **KPIs** : Total constats, NC, critiques, % actions closes
- ✅ **Heatmap 5×5** : Visualisation matrice Probabilité × Gravité
- ✅ **Graphiques** : 
  - Répartition par criticité (doughnut)
  - NC par famille de risques (bar chart)
  - Top 10 risques
- ✅ **Filtres** : Par priorité, statut, famille

### 📥 Exports professionnels
- ✅ **Excel (.xlsx)** : 
  - Rapport complet de visite (4 onglets)
  - Plan d'actions consolidé
- ✅ **PDF** : Rapport synthétique avec statistiques
- ✅ **Format** : Données structurées prêtes pour analyse

### 🔒 Sécurité & Offline
- ✅ **Authentification** : Email + mot de passe (mode démo)
- ✅ **Mode offline** : Stockage local IndexedDB
- ✅ **Service Worker** : Cache intelligent
- ✅ **Synchronisation** : Préparé pour sync cloud (à configurer)

---

## 🚀 Installation & Déploiement

### Prérequis
- Serveur web (Apache, Nginx, ou serveur local)
- Navigateur moderne (Chrome, Firefox, Safari, Edge)
- HTTPS (requis pour PWA, sauf localhost)

### Option 1 : Déploiement local (Test)

```bash
# 1. Télécharger le projet
# Extraire l'archive dans un dossier

# 2. Lancer un serveur local
# Option A : Python 3
python -m http.server 8000

# Option B : Node.js (http-server)
npx http-server -p 8000

# Option C : PHP
php -S localhost:8000

# 3. Ouvrir dans le navigateur
# http://localhost:8000
```

### Option 2 : Déploiement sur serveur web

```bash
# 1. Uploader tous les fichiers via FTP/SFTP vers votre serveur
# Structure :
# /var/www/html/visite-risques/
#   ├── index.html
#   ├── manifest.json
#   ├── sw.js
#   ├── css/
#   ├── js/
#   └── icons/ (à créer)

# 2. Configurer HTTPS (obligatoire pour PWA)
# Avec Certbot (Let's Encrypt) :
sudo certbot --nginx -d votre-domaine.com

# 3. Configurer le serveur web
# Nginx : ajouter dans /etc/nginx/sites-available/default
location /visite-risques {
    try_files $uri $uri/ /index.html;
}

# Apache : ajouter dans .htaccess
RewriteEngine On
RewriteCond %{REQUEST_FILENAME} !-f
RewriteRule ^ index.html [QSA,L]
```

### Option 3 : Déploiement Vercel / Netlify (Gratuit)

**Vercel :**
```bash
# 1. Installer Vercel CLI
npm i -g vercel

# 2. Déployer
cd visite-risques
vercel

# Suivre les instructions
```

**Netlify :**
```bash
# 1. Installer Netlify CLI
npm i -g netlify-cli

# 2. Déployer
cd visite-risques
netlify deploy --prod

# Ou glisser-déposer le dossier sur https://app.netlify.com/drop
```

---

## 📱 Installation sur mobile

### Android (Chrome)
1. Ouvrir l'URL de l'app
2. Menu (⋮) → **Ajouter à l'écran d'accueil**
3. L'icône apparaît sur l'écran d'accueil

### iOS (Safari)
1. Ouvrir l'URL de l'app
2. Bouton Partager (⎙) → **Sur l'écran d'accueil**
3. Confirmer

L'application se lance ensuite en mode **standalone** (sans barre d'adresse).

---

## 🎨 Configuration des icônes

Les icônes PWA doivent être créées dans le dossier `icons/` :

```
icons/
  ├── icon-72.png    (72×72)
  ├── icon-96.png    (96×96)
  ├── icon-128.png   (128×128)
  ├── icon-144.png   (144×144)
  ├── icon-152.png   (152×152)
  ├── icon-192.png   (192×192) ← Icône principale
  ├── icon-384.png   (384×384)
  └── icon-512.png   (512×512) ← Splash screen
```

**Générer les icônes :**
- Outil en ligne : [PWA Asset Generator](https://www.pwabuilder.com/imageGenerator)
- Uploader un logo 512×512 PNG avec fond
- Télécharger le pack d'icônes généré

---

## 💾 Structure de données

### Sites
```javascript
{
  id: 1,
  nom: "Usine Pharmaceutique Lyon",
  type: "Industrie", // Industrie, Commerce, Hôpital, Hôtel, Administration
  adresse: "123 Avenue...",
  voisinage: "Zone industrielle...",
  anneeMiseService: "2015"
}
```

### Visites
```javascript
{
  id: 1,
  siteId: 1,
  date: "2026-02-10",
  auditeur: "Jean Dupont",
  accompagnateurs: "Directeur HSE...",
  objectif: "Audit pré-renouvellement",
  perimetre: "Ensemble des ateliers..."
}
```

### Zones
```javascript
{
  id: 1,
  visiteId: 1,
  nom: "Atelier Production",
  usage: "Fabrication médicaments",
  surface: 2500,
  batiment: "Bâtiment A"
}
```

### Constats
```javascript
{
  id: 1,
  visiteId: 1,
  zoneId: 1,
  famille: "Protection Incendie",
  pointControle: "Extincteurs présents",
  statut: "C", // C (Conforme), NC (Non-conforme), SO (Sans Objet)
  
  // Scoring Matrice 5×5
  probabilite: 2, // 1-5
  gravite: 4,     // 1-5
  scoreMatrice: 8, // Auto-calculé
  
  // Scoring Assureur
  maitrise: 3,    // 0-3 (0=aucune, 3=totale)
  impact: 3,      // 1-4
  scoreAssureur: 6, // Auto-calculé
  
  // Évaluation
  criticite: "Élevé", // Auto-calculé
  priorite: "P2 - Moyenne", // Auto-calculé
  
  // Détails
  preuve: "Observation", // Observation, Document, Entretien
  commentaire: "Extincteurs CO2 présents...",
  
  // Actions (si NC)
  action: "Installer bac de rétention...",
  responsable: "Responsable HSE",
  echeance: "2026-03-15",
  statutAction: "Ouvert" // Ouvert, En cours, Clos
}
```

---

## 🔧 Personnalisation

### Modifier les familles de risques
Éditer `js/db.js` ligne 131 :
```javascript
const FAMILLES_RISQUES = [
    'Accès & Périmètre',
    'Infrastructures & Circulation',
    // Ajouter vos familles ici
];
```

### Modifier les types de sites
Éditer `js/db.js` ligne 147 :
```javascript
const TYPES_SITES = [
    'Industrie',
    'Commerce',
    // Ajouter vos types ici
];
```

### Adapter les barèmes de scoring
Éditer `js/scoring.js` lignes 5-20 :
```javascript
this.matrixLevels = {
    1: { level: 'Faible', color: 'success', range: [1, 5] },
    // Modifier les seuils selon vos critères
};
```

### Changer les couleurs
Éditer `css/style.css` lignes 1-11 :
```css
:root {
    --primary-color: #2563eb; /* Votre couleur principale */
    --danger-color: #ef4444;
    /* ... */
}
```

---

## 🔌 Intégration Cloud (Optionnel)

Pour synchroniser les données avec un backend (Supabase, Firebase, ou API custom) :

### 1. Créer une API REST
Points d'entrée recommandés :
```
POST /api/sites
POST /api/visites
POST /api/constats
GET  /api/sync?since=timestamp
```

### 2. Modifier `js/db.js`
Ajouter méthodes de sync :
```javascript
async syncToCloud() {
    const pending = await this.getPendingSync();
    // POST vers votre API
}
```

### 3. Activer Background Sync
Déjà préparé dans `sw.js` ligne 76 :
```javascript
self.addEventListener('sync', event => {
    if (event.tag === 'sync-data') {
        event.waitUntil(syncData());
    }
});
```

---

## 🐛 Dépannage

### L'app ne s'installe pas sur mobile
- ✅ Vérifier que l'app est servie en **HTTPS** (ou localhost)
- ✅ Vérifier que `manifest.json` est accessible
- ✅ Vérifier que les icônes existent dans `/icons/`

### Les données ne persistent pas
- ✅ Vérifier que IndexedDB est activé (Paramètres navigateur)
- ✅ Vérifier la console : `F12` → onglet Application → IndexedDB

### Le Service Worker ne se charge pas
- ✅ Ouvrir DevTools → onglet Application → Service Workers
- ✅ Cliquer sur "Unregister" puis recharger la page
- ✅ Vérifier les erreurs dans la console

### Les exports Excel ne fonctionnent pas
- ✅ Vérifier que le CDN SheetJS est accessible
- ✅ Tester sur une connexion stable
- ✅ Vérifier les popups bloqués

---

## 📚 Technologies utilisées

- **Frontend** : HTML5, CSS3, JavaScript (ES6+)
- **Storage** : IndexedDB (offline-first)
- **PWA** : Service Worker, Web App Manifest
- **Charts** : Chart.js 4.4.0
- **Export** : SheetJS (xlsx) 0.18.5, jsPDF 2.5.1
- **Icons** : SVG inline (Feather Icons style)

---

## 🗺️ Roadmap

### Version 1.1 (À venir)
- [ ] Gestion complète des photos (capture + galerie)
- [ ] Formulaires modaux pour Sites/Visites/Zones/Constats
- [ ] Édition/suppression des entités
- [ ] Recherche et filtres avancés
- [ ] Import Excel de données de référence

### Version 1.2
- [ ] Synchronisation cloud (Supabase/Firebase)
- [ ] Authentification SSO (Google, Microsoft)
- [ ] Partage de rapports par email
- [ ] Templates de visites (industries/ERP)

### Version 2.0
- [ ] Mode collaboratif (multi-auditeurs)
- [ ] Signature numérique
- [ ] Scan QR/NFC pour équipements
- [ ] IA : suggestions d'actions correctives

---

## 📄 Licence

MIT License - Libre d'utilisation, modification et distribution.

---

## 👨‍💻 Support

Pour toute question ou suggestion :
- 📧 support@visite-risques.app
- 📖 Documentation complète : [wiki en ligne]
- 🐛 Rapporter un bug : [GitHub Issues]

---

## 🎓 Données de démonstration

L'application charge automatiquement des **données de démonstration** au premier lancement :
- 3 sites (Usine, Hôtel, Hôpital)
- 1 visite complète avec 5 constats
- Scores automatiques calculés
- Plan d'actions pré-rempli

**Pour réinitialiser :**
1. Ouvrir DevTools (F12)
2. Application → Storage → Clear site data
3. Recharger la page

---

## ⚡ Quick Start (Développeurs)

```bash
# Cloner le projet
git clone https://github.com/votre-org/visite-risques.git
cd visite-risques

# Lancer serveur local
python -m http.server 8000

# Ouvrir http://localhost:8000
# Login démo : n'importe quel email/mot de passe

# Tester sur mobile (même réseau WiFi)
# Trouver votre IP locale : ipconfig / ifconfig
# http://192.168.x.x:8000
```

---

**Prêt pour le terrain ! 🚀**
