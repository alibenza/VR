// Main Application Entry Point
class App {
    constructor() {
        this.initialized = false;
    }

    async init() {
        try {
            // Initialize database
            await db.init();
            console.log('Database initialized');

            // Check authentication
            const isAuthenticated = auth.init();

            if (isAuthenticated) {
                this.showApp();
            } else {
                this.showAuth();
            }

            // Setup auth form
            this.setupAuthForm();

            // Add demo data if empty
            await this.checkAndAddDemoData();

            this.initialized = true;
        } catch (error) {
            console.error('App initialization error:', error);
            utils.showToast('Erreur d\'initialisation: ' + error.message, 'error');
        }
    }

    showAuth() {
        document.getElementById('authScreen').classList.add('active');
        document.getElementById('appScreen').classList.remove('active');
    }

    showApp() {
        document.getElementById('authScreen').classList.remove('active');
        document.getElementById('appScreen').classList.add('active');
        
        // Initialize UI
        ui.init();
    }

    setupAuthForm() {
        const form = document.getElementById('authForm');
        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const email = document.getElementById('authEmail').value;
            const password = document.getElementById('authPassword').value;

            utils.showLoading();

            try {
                await auth.login(email, password);
                utils.hideLoading();
                utils.showToast('Connexion réussie', 'success');
                this.showApp();
            } catch (error) {
                utils.hideLoading();
                utils.showToast('Erreur de connexion: ' + error.message, 'error');
            }
        });
    }

    async checkAndAddDemoData() {
        const sites = await db.getAll('sites');
        
        // Only add demo data if no sites exist
        if (sites.length === 0) {
            await this.addDemoData();
        }
    }

    async addDemoData() {
        try {
            // Add demo sites
            const site1Id = await db.add('sites', {
                nom: 'Usine Pharmaceutique Lyon',
                type: 'Industrie',
                adresse: '123 Avenue de la Chimie, 69007 Lyon',
                voisinage: 'Zone industrielle, proximité autoroute A7',
                anneeMiseService: '2015'
            });

            const site2Id = await db.add('sites', {
                nom: 'Hôtel Renaissance Paris',
                type: 'Hôtel',
                adresse: '45 Rue de Rivoli, 75001 Paris',
                voisinage: 'Centre-ville, proche métro',
                anneeMiseService: '2010'
            });

            const site3Id = await db.add('sites', {
                nom: 'Centre Hospitalier Marseille',
                type: 'Hôpital',
                adresse: '280 Boulevard Sainte-Marguerite, 13009 Marseille',
                voisinage: 'Zone résidentielle',
                anneeMiseService: '1998'
            });

            // Add demo visite for site 1
            const visite1Id = await db.add('visites', {
                siteId: site1Id,
                date: new Date().toISOString().split('T')[0],
                auditeur: auth.getCurrentUser()?.name || 'Auditeur',
                accompagnateurs: 'Directeur HSE, Responsable Production',
                objectif: 'Audit HSE pré-renouvellement',
                perimetre: 'Ensemble des ateliers de production et stockage'
            });

            // Add demo zones
            const zone1Id = await db.add('zones', {
                visiteId: visite1Id,
                nom: 'Atelier Production',
                usage: 'Fabrication médicaments',
                surface: 2500,
                batiment: 'Bâtiment A'
            });

            const zone2Id = await db.add('zones', {
                visiteId: visite1Id,
                nom: 'Stockage Matières Premières',
                usage: 'Stockage produits chimiques',
                surface: 800,
                batiment: 'Bâtiment B'
            });

            // Add demo constats
            const constat1 = {
                visiteId: visite1Id,
                zoneId: zone1Id,
                famille: 'Protection Incendie',
                pointControle: 'Extincteurs présents et vérifiés',
                statut: 'C',
                probabilite: 2,
                gravite: 4,
                maitrise: 3,
                impact: 3,
                preuve: 'Observation',
                commentaire: 'Extincteurs CO2 présents, vérification annuelle à jour'
            };

            const constat2 = {
                visiteId: visite1Id,
                zoneId: zone2Id,
                famille: 'Produits Chimiques & Stockage',
                pointControle: 'Rétention des cuves de stockage',
                statut: 'NC',
                probabilite: 4,
                gravite: 5,
                maitrise: 1,
                impact: 4,
                preuve: 'Observation',
                commentaire: 'Cuve de 5000L sans rétention conforme. Risque de pollution majeure.',
                action: 'Installer bac de rétention 110% volume + détecteur de fuite',
                responsable: 'Responsable HSE',
                echeance: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
                statutAction: 'Ouvert'
            };

            const constat3 = {
                visiteId: visite1Id,
                zoneId: zone1Id,
                famille: 'Ambiances de Travail',
                pointControle: 'Niveau sonore acceptable',
                statut: 'NC',
                probabilite: 3,
                gravite: 3,
                maitrise: 2,
                impact: 2,
                preuve: 'Observation',
                commentaire: 'Bruit élevé sur ligne de conditionnement (>85 dB)',
                action: 'Mesure acoustique + isolation phonique + EPI adaptés',
                responsable: 'Directeur Technique',
                echeance: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
                statutAction: 'En cours'
            };

            const constat4 = {
                visiteId: visite1Id,
                zoneId: zone1Id,
                famille: 'Maîtrise Opérationnelle',
                pointControle: 'État des machines conforme',
                statut: 'C',
                probabilite: 2,
                gravite: 3,
                maitrise: 3,
                impact: 2,
                preuve: 'Document',
                commentaire: 'Vérifications périodiques à jour, maintenance préventive efficace'
            };

            const constat5 = {
                visiteId: visite1Id,
                zoneId: zone2Id,
                famille: 'Sûreté & Malveillance',
                pointControle: 'Contrôle d\'accès zone stockage',
                statut: 'NC',
                probabilite: 3,
                gravite: 4,
                maitrise: 1,
                impact: 3,
                preuve: 'Observation',
                commentaire: 'Zone sensible accessible sans badge. Risque vol/sabotage.',
                action: 'Installer lecteur badge + caméra surveillance',
                responsable: 'Responsable Sécurité',
                echeance: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
                statutAction: 'Ouvert'
            };

            // Score constats
            const scoredConstats = [constat1, constat2, constat3, constat4, constat5].map(c => scoring.scoreConstat(c));

            // Add to database
            for (const constat of scoredConstats) {
                await db.add('constats', constat);
            }

            console.log('Demo data added successfully');
        } catch (error) {
            console.error('Error adding demo data:', error);
        }
    }
}

// Initialize app when DOM is ready
document.addEventListener('DOMContentLoaded', async () => {
    const app = new App();
    await app.init();
});

// Handle offline/online events
window.addEventListener('online', () => {
    utils.showToast('Connexion rétablie', 'success');
});

window.addEventListener('offline', () => {
    utils.showToast('Mode hors ligne activé', 'info');
});

// Handle install prompt for PWA
let deferredPrompt;

window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferredPrompt = e;
    
    // Show install toast
    const installToast = document.createElement('div');
    installToast.className = 'toast info';
    installToast.innerHTML = `
        <div class="toast-icon">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                <polyline points="7 10 12 15 17 10"></polyline>
                <line x1="12" y1="15" x2="12" y2="3"></line>
            </svg>
        </div>
        <div class="toast-message">Installer l'application sur votre appareil ?</div>
        <button class="btn btn-primary" id="installBtn" style="margin-left: 1rem; padding: 0.5rem 1rem;">Installer</button>
    `;
    
    document.getElementById('toastContainer').appendChild(installToast);
    
    document.getElementById('installBtn').addEventListener('click', async () => {
        if (deferredPrompt) {
            deferredPrompt.prompt();
            const { outcome } = await deferredPrompt.userChoice;
            console.log(`User response to install prompt: ${outcome}`);
            deferredPrompt = null;
        }
        installToast.remove();
    });
    
    setTimeout(() => {
        installToast.remove();
    }, 10000);
});

window.addEventListener('appinstalled', () => {
    utils.showToast('Application installée avec succès', 'success');
    deferredPrompt = null;
});
