# 🚀 Guide de Déploiement - Visite de Risques PWA

Guide complet pour déployer l'application en production sur différentes plateformes.

---

## 📋 Prérequis généraux

- ✅ Toutes les icônes dans `/icons/` (voir icons/README.md)
- ✅ Accès HTTPS (obligatoire pour PWA, sauf localhost)
- ✅ Serveur web configuré pour servir des fichiers statiques
- ✅ Domaine configuré (recommandé)

---

## 🌐 Déploiement rapide (Plateforme cloud gratuite)

### Option 1 : Vercel (Recommandé pour MVP)

**Avantages :** Gratuit, HTTPS automatique, CDN global, déploiement en 2 minutes

```bash
# 1. Installer Vercel CLI
npm i -g vercel

# 2. Se connecter
vercel login

# 3. Déployer depuis le dossier du projet
cd visite-risques
vercel

# Suivre les instructions :
# - Set up and deploy? Yes
# - Scope: Votre compte
# - Link to existing project? No
# - Project name: visite-risques
# - Directory: ./
# - Override settings? No

# 4. L'app est déployée !
# URL fournie : https://visite-risques-xxx.vercel.app
```

**Configuration avancée :**
Créer `vercel.json` :
```json
{
  "rewrites": [
    { "source": "/(.*)", "destination": "/index.html" }
  ],
  "headers": [
    {
      "source": "/sw.js",
      "headers": [
        {
          "key": "Cache-Control",
          "value": "public, max-age=0, must-revalidate"
        }
      ]
    }
  ]
}
```

---

### Option 2 : Netlify

**Avantages :** Interface drag & drop, formulaires intégrés, redirections simples

**Méthode A : Interface web**
1. Aller sur https://app.netlify.com/drop
2. Glisser-déposer le dossier `visite-risques/`
3. L'app est déployée instantanément
4. URL fournie : https://random-name.netlify.app
5. Personnaliser : Site settings → Change site name

**Méthode B : CLI**
```bash
# Installer Netlify CLI
npm i -g netlify-cli

# Se connecter
netlify login

# Déployer
cd visite-risques
netlify deploy --prod

# Publish directory: . (ou appuyer sur Entrée)
```

**Configuration :**
Créer `netlify.toml` :
```toml
[build]
  publish = "."

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200

[[headers]]
  for = "/sw.js"
  [headers.values]
    Cache-Control = "public, max-age=0, must-revalidate"
```

---

### Option 3 : GitHub Pages

**Avantages :** Gratuit avec GitHub, intégration Git

```bash
# 1. Créer un repo GitHub
# - Aller sur github.com, créer un nouveau repo "visite-risques"

# 2. Initialiser Git localement
cd visite-risques
git init
git add .
git commit -m "Initial commit"

# 3. Pousser vers GitHub
git remote add origin https://github.com/VOTRE-USERNAME/visite-risques.git
git branch -M main
git push -u origin main

# 4. Activer GitHub Pages
# - Aller sur le repo → Settings → Pages
# - Source: Deploy from a branch
# - Branch: main, folder: / (root)
# - Save

# 5. L'app est disponible à :
# https://VOTRE-USERNAME.github.io/visite-risques/
```

**Important :** Si l'app n'est pas à la racine du domaine, modifier `manifest.json` :
```json
{
  "start_url": "/visite-risques/",
  "scope": "/visite-risques/"
}
```

---

## 🖥️ Déploiement sur serveur dédié (VPS)

### Option 4 : Serveur Linux + Nginx

**Prérequis :** VPS Ubuntu/Debian avec accès root

```bash
# 1. Connexion SSH
ssh root@votre-serveur.com

# 2. Installer Nginx
apt update
apt install nginx -y

# 3. Créer le dossier web
mkdir -p /var/www/visite-risques
cd /var/www/visite-risques

# 4. Uploader les fichiers (depuis votre machine locale)
# Méthode A : SCP
scp -r visite-risques/* root@votre-serveur.com:/var/www/visite-risques/

# Méthode B : SFTP
sftp root@votre-serveur.com
put -r visite-risques/* /var/www/visite-risques/

# Méthode C : Git
git clone https://github.com/VOTRE-USERNAME/visite-risques.git .

# 5. Configurer Nginx
nano /etc/nginx/sites-available/visite-risques

# Ajouter :
```

**Nginx config :**
```nginx
server {
    listen 80;
    server_name votre-domaine.com www.votre-domaine.com;

    root /var/www/visite-risques;
    index index.html;

    # Cache busting for service worker
    location = /sw.js {
        add_header Cache-Control "public, max-age=0, must-revalidate";
    }

    # Cache static assets
    location ~* \.(js|css|png|jpg|jpeg|gif|svg|ico)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    # SPA fallback
    location / {
        try_files $uri $uri/ /index.html;
    }
}
```

```bash
# 6. Activer le site
ln -s /etc/nginx/sites-available/visite-risques /etc/nginx/sites-enabled/
nginx -t
systemctl reload nginx

# 7. Installer Certbot pour HTTPS (obligatoire PWA)
apt install certbot python3-certbot-nginx -y
certbot --nginx -d votre-domaine.com -d www.votre-domaine.com

# Suivre les instructions, choisir "Redirect HTTP to HTTPS"

# 8. L'app est disponible à https://votre-domaine.com
```

---

### Option 5 : Serveur Apache

**Configuration Apache :**
```apache
<VirtualHost *:80>
    ServerName votre-domaine.com
    ServerAlias www.votre-domaine.com
    DocumentRoot /var/www/visite-risques

    <Directory /var/www/visite-risques>
        Options -Indexes +FollowSymLinks
        AllowOverride All
        Require all granted
    </Directory>

    # Service Worker no-cache
    <Files "sw.js">
        Header set Cache-Control "public, max-age=0, must-revalidate"
    </Files>

    ErrorLog ${APACHE_LOG_DIR}/visite-risques-error.log
    CustomLog ${APACHE_LOG_DIR}/visite-risques-access.log combined
</VirtualHost>
```

**Fichier .htaccess :**
```apache
RewriteEngine On
RewriteCond %{REQUEST_FILENAME} !-f
RewriteCond %{REQUEST_FILENAME} !-d
RewriteRule ^ index.html [QSA,L]

# Service Worker no-cache
<Files "sw.js">
    Header set Cache-Control "public, max-age=0, must-revalidate"
</Files>
```

```bash
# Activer mod_rewrite et headers
a2enmod rewrite headers
systemctl reload apache2

# HTTPS avec Certbot
certbot --apache -d votre-domaine.com
```

---

## 🐳 Déploiement avec Docker

**Dockerfile :**
```dockerfile
FROM nginx:alpine

# Copier les fichiers
COPY . /usr/share/nginx/html/

# Configuration Nginx pour SPA
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
```

**nginx.conf :**
```nginx
server {
    listen 80;
    server_name localhost;
    root /usr/share/nginx/html;
    index index.html;

    location = /sw.js {
        add_header Cache-Control "public, max-age=0, must-revalidate";
    }

    location / {
        try_files $uri $uri/ /index.html;
    }
}
```

**Commandes :**
```bash
# Build
docker build -t visite-risques .

# Run
docker run -d -p 80:80 --name visite-risques visite-risques

# Avec HTTPS (via reverse proxy Traefik/Nginx Proxy Manager)
docker run -d \
  -p 80:80 \
  -e VIRTUAL_HOST=votre-domaine.com \
  -e LETSENCRYPT_HOST=votre-domaine.com \
  -e LETSENCRYPT_EMAIL=admin@votre-domaine.com \
  --name visite-risques \
  visite-risques
```

---

## ☁️ Déploiement Cloud (Production)

### Option 6 : AWS S3 + CloudFront

```bash
# 1. Créer un bucket S3
aws s3 mb s3://visite-risques-app

# 2. Configurer pour hébergement web
aws s3 website s3://visite-risques-app \
  --index-document index.html \
  --error-document index.html

# 3. Uploader les fichiers
aws s3 sync . s3://visite-risques-app \
  --exclude ".git/*" \
  --cache-control "public, max-age=31536000" \
  --metadata-directive REPLACE

# 4. Service Worker sans cache
aws s3 cp sw.js s3://visite-risques-app/sw.js \
  --cache-control "public, max-age=0, must-revalidate" \
  --metadata-directive REPLACE

# 5. Configurer CloudFront pour HTTPS
# Via console AWS : CloudFront → Create distribution
# Origin: votre-bucket.s3.amazonaws.com
# Viewer Protocol Policy: Redirect HTTP to HTTPS
# Custom SSL: Request certificate (ACM)
```

---

### Option 7 : Google Cloud Storage + CDN

```bash
# 1. Créer un bucket
gsutil mb gs://visite-risques-app

# 2. Configurer pour web
gsutil web set -m index.html -e index.html gs://visite-risques-app

# 3. Upload
gsutil -m rsync -r -d . gs://visite-risques-app

# 4. Rendre public
gsutil iam ch allUsers:objectViewer gs://visite-risques-app

# 5. Activer CDN via console Cloud
```

---

## 🔒 Configuration HTTPS (Obligatoire PWA)

### Let's Encrypt (Gratuit)

```bash
# Ubuntu/Debian
apt install certbot python3-certbot-nginx
certbot --nginx -d votre-domaine.com

# CentOS/RHEL
yum install certbot python3-certbot-nginx
certbot --nginx -d votre-domaine.com

# Renouvellement automatique (déjà configuré)
certbot renew --dry-run
```

### Cloudflare (Gratuit + CDN)

1. Ajouter votre domaine sur Cloudflare
2. Changer les nameservers chez votre registrar
3. SSL/TLS → Full (strict)
4. CDN activé automatiquement

---

## 📊 Post-déploiement

### 1. Tester la PWA
- https://web.dev/measure/
- Lighthouse (DevTools)
- PWA Builder : https://www.pwabuilder.com/

### 2. Monitorer
```bash
# Logs Nginx
tail -f /var/log/nginx/access.log

# Logs Apache
tail -f /var/log/apache2/access.log
```

### 3. Analyser
- Google Analytics (ajouter dans index.html)
- Plausible (privacy-friendly)
- Sentry pour les erreurs

---

## 🔄 Mise à jour

```bash
# Git
git pull origin main

# Redémarrer le serveur (si nécessaire)
systemctl reload nginx

# Docker
docker build -t visite-risques .
docker stop visite-risques
docker rm visite-risques
docker run -d -p 80:80 --name visite-risques visite-risques

# Vercel/Netlify
# Push vers Git → déploiement automatique
```

---

## 🆘 Dépannage

### HTTPS ne fonctionne pas
- Vérifier les DNS (propagation peut prendre 24h)
- Tester : `curl -I https://votre-domaine.com`
- Renouveler le certificat : `certbot renew`

### Service Worker ne se met pas à jour
- Incrémenter `CACHE_NAME` dans `sw.js`
- Vider le cache : DevTools → Application → Clear storage

### L'app ne s'installe pas
- Vérifier HTTPS actif
- Vérifier manifest.json accessible
- Vérifier icônes présentes

---

**Votre PWA est maintenant en production ! 🎉**
