// UI Manager - Handles all UI rendering and interactions
class UIManager {
    constructor() {
        this.currentView = 'home';
        this.currentVisite = null;
    }

    // Initialize UI
    init() {
        this.setupNavigation();
        this.setupEventListeners();
        this.updateStats();
    }

    // Setup navigation
    setupNavigation() {
        // Menu toggle
        document.getElementById('menuBtn').addEventListener('click', () => {
            document.getElementById('sideMenu').classList.add('active');
        });

        document.getElementById('closeMenuBtn').addEventListener('click', () => {
            document.getElementById('sideMenu').classList.remove('active');
        });

        // Menu items
        document.querySelectorAll('.menu-list a').forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const view = e.currentTarget.dataset.view;
                this.showView(view);
                document.getElementById('sideMenu').classList.remove('active');
            });
        });

        // Logout
        document.getElementById('logoutBtn').addEventListener('click', async () => {
            if (await utils.confirm('Voulez-vous vraiment vous déconnecter ?')) {
                auth.logout();
                this.showAuthScreen();
            }
        });
    }

    // Setup event listeners
    setupEventListeners() {
        // New visit buttons
        document.getElementById('newVisitBtn').addEventListener('click', () => this.showNewVisitForm());
        document.getElementById('addVisitBtn').addEventListener('click', () => this.showNewVisitForm());

        // Add site button
        document.getElementById('addSiteBtn').addEventListener('click', () => this.showNewSiteForm());

        // Sync button
        document.getElementById('syncBtn').addEventListener('click', () => this.syncData());

        // Back to visites
        document.getElementById('backToVisitesBtn').addEventListener('click', () => this.showView('visites'));

        // Export buttons
        document.getElementById('exportVisitBtn').addEventListener('click', () => this.exportCurrentVisite());
        document.getElementById('exportActionsBtn').addEventListener('click', () => this.exportAllActions());

        // Tabs
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const tab = e.currentTarget.dataset.tab;
                this.showTab(tab);
            });
        });

        // Filters
        document.getElementById('filterPriorite')?.addEventListener('change', () => this.filterActions());
        document.getElementById('filterStatut')?.addEventListener('change', () => this.filterActions());
    }

    // Show view
    showView(viewName) {
        // Update menu
        document.querySelectorAll('.menu-list a').forEach(link => {
            link.classList.toggle('active', link.dataset.view === viewName);
        });

        // Update views
        document.querySelectorAll('.view').forEach(view => {
            view.classList.remove('active');
        });

        document.getElementById(`${viewName}View`).classList.add('active');

        // Update title
        const titles = {
            home: 'Accueil',
            sites: 'Sites',
            visites: 'Visites',
            dashboard: 'Dashboard',
            actions: 'Plan d\'Actions'
        };
        document.getElementById('screenTitle').textContent = titles[viewName] || 'App';

        this.currentView = viewName;

        // Load data for view
        switch (viewName) {
            case 'home':
                this.updateStats();
                this.loadRecentVisites();
                break;
            case 'sites':
                this.loadSites();
                break;
            case 'visites':
                this.loadVisites();
                break;
            case 'dashboard':
                this.loadDashboard();
                break;
            case 'actions':
                this.loadAllActions();
                break;
        }
    }

    // Update stats
    async updateStats() {
        const sites = await db.getAll('sites');
        const visites = await db.getAll('visites');
        const constats = await db.getAll('constats');
        const nc = constats.filter(c => c.statut === 'NC');

        document.getElementById('statSites').textContent = sites.length;
        document.getElementById('statVisites').textContent = visites.length;
        document.getElementById('statConstats').textContent = constats.length;
        document.getElementById('statNC').textContent = nc.length;
    }

    // Load recent visites
    async loadRecentVisites() {
        const visites = await db.getAll('visites');
        const recent = visites.sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 5);
        const sites = await db.getAll('sites');

        const container = document.getElementById('recentVisitsList');
        
        if (recent.length === 0) {
            container.innerHTML = '<div class="empty-state"><p>Aucune visite récente</p></div>';
            return;
        }

        container.innerHTML = recent.map(visite => {
            const site = sites.find(s => s.id === visite.siteId);
            return `
                <div class="list-item" data-id="${visite.id}">
                    <div class="list-item-header">
                        <div class="list-item-title">${site ? site.nom : 'Site inconnu'}</div>
                        <span class="badge badge-info">${utils.formatDate(visite.date)}</span>
                    </div>
                    <div class="list-item-meta">
                        <span>Auditeur: ${visite.auditeur}</span>
                    </div>
                </div>
            `;
        }).join('');

        container.querySelectorAll('.list-item').forEach(item => {
            item.addEventListener('click', () => {
                const id = parseInt(item.dataset.id);
                this.showVisiteDetail(id);
            });
        });
    }

    // Load sites
    async loadSites() {
        const sites = await db.getAll('sites');
        const container = document.getElementById('sitesList');

        if (sites.length === 0) {
            container.innerHTML = '<div class="empty-state"><p>Aucun site enregistré</p></div>';
            return;
        }

        container.innerHTML = sites.map(site => `
            <div class="list-item" data-id="${site.id}">
                <div class="list-item-header">
                    <div class="list-item-title">${site.nom}</div>
                    <span class="badge badge-info">${site.type}</span>
                </div>
                <div class="list-item-meta">
                    <span>${site.adresse || ''}</span>
                </div>
            </div>
        `).join('');

        container.querySelectorAll('.list-item').forEach(item => {
            item.addEventListener('click', () => {
                const id = parseInt(item.dataset.id);
                this.showSiteDetail(id);
            });
        });
    }

    // Load visites
    async loadVisites() {
        const visites = await db.getAll('visites');
        const sites = await db.getAll('sites');
        const container = document.getElementById('visitesList');

        if (visites.length === 0) {
            container.innerHTML = '<div class="empty-state"><p>Aucune visite enregistrée</p></div>';
            return;
        }

        const sortedVisites = visites.sort((a, b) => new Date(b.date) - new Date(a.date));

        container.innerHTML = sortedVisites.map(visite => {
            const site = sites.find(s => s.id === visite.siteId);
            return `
                <div class="list-item" data-id="${visite.id}">
                    <div class="list-item-header">
                        <div class="list-item-title">${site ? site.nom : 'Site inconnu'}</div>
                        <span class="badge badge-info">${utils.formatDate(visite.date)}</span>
                    </div>
                    <div class="list-item-meta">
                        <span>Auditeur: ${visite.auditeur}</span>
                        <span>Objectif: ${visite.objectif || 'Non spécifié'}</span>
                    </div>
                </div>
            `;
        }).join('');

        container.querySelectorAll('.list-item').forEach(item => {
            item.addEventListener('click', () => {
                const id = parseInt(item.dataset.id);
                this.showVisiteDetail(id);
            });
        });
    }

    // Show visite detail
    async showVisiteDetail(visiteId) {
        this.currentVisite = await db.get('visites', visiteId);
        const site = await db.get('sites', this.currentVisite.siteId);

        document.getElementById('visiteDetailTitle').textContent = site ? site.nom : 'Visite';
        document.getElementById('visiteDetailView').classList.add('active');
        document.getElementById('visitesView').classList.remove('active');

        // Load tabs
        this.loadVisiteInfo();
        this.loadZones();
        this.loadConstats();
        this.loadVisiteActions();

        // Setup zone and constat buttons
        document.getElementById('addZoneBtn').onclick = () => this.showNewZoneForm();
        document.getElementById('addConstatBtn').onclick = () => this.showNewConstatForm();
    }

    // Show tab
    showTab(tabName) {
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.tab === tabName);
        });

        document.querySelectorAll('.tab-pane').forEach(pane => {
            pane.classList.remove('active');
        });

        document.getElementById(`tab${tabName.charAt(0).toUpperCase() + tabName.slice(1)}`).classList.add('active');
    }

    // Load visite info
    async loadVisiteInfo() {
        const site = await db.get('sites', this.currentVisite.siteId);
        const container = document.getElementById('visiteInfo');

        container.innerHTML = `
            <div class="info-row">
                <div class="info-label">Site</div>
                <div class="info-value">${site ? site.nom : 'Inconnu'}</div>
            </div>
            <div class="info-row">
                <div class="info-label">Date</div>
                <div class="info-value">${utils.formatDate(this.currentVisite.date)}</div>
            </div>
            <div class="info-row">
                <div class="info-label">Auditeur</div>
                <div class="info-value">${this.currentVisite.auditeur}</div>
            </div>
            <div class="info-row">
                <div class="info-label">Accompagnateurs</div>
                <div class="info-value">${this.currentVisite.accompagnateurs || 'Non spécifié'}</div>
            </div>
            <div class="info-row">
                <div class="info-label">Objectif</div>
                <div class="info-value">${this.currentVisite.objectif || 'Non spécifié'}</div>
            </div>
            <div class="info-row">
                <div class="info-label">Périmètre</div>
                <div class="info-value">${this.currentVisite.perimetre || 'Non spécifié'}</div>
            </div>
        `;
    }

    // Show auth screen
    showAuthScreen() {
        document.getElementById('authScreen').classList.add('active');
        document.getElementById('appScreen').classList.remove('active');
    }

    // Show app screen
    showAppScreen() {
        document.getElementById('authScreen').classList.remove('active');
        document.getElementById('appScreen').classList.add('active');
    }

    // Sync data (placeholder)
    async syncData() {
        utils.showLoading();
        await new Promise(resolve => setTimeout(resolve, 1000));
        utils.hideLoading();
        utils.showToast('Synchronisation simulée (mode offline)', 'info');
    }

    // Placeholder methods for forms (to be implemented in next steps)
    showNewSiteForm() {
        // Will be implemented with form modal
        utils.showToast('Formulaire site en développement', 'info');
    }

    showNewVisitForm() {
        utils.showToast('Formulaire visite en développement', 'info');
    }

    showNewZoneForm() {
        utils.showToast('Formulaire zone en développement', 'info');
    }

    showNewConstatForm() {
        utils.showToast('Formulaire constat en développement', 'info');
    }

    showSiteDetail(siteId) {
        utils.showToast('Détail site en développement', 'info');
    }

    async loadZones() {
        const zones = await db.getZonesByVisite(this.currentVisite.id);
        const container = document.getElementById('zonesList');
        
        if (zones.length === 0) {
            container.innerHTML = '<div class="empty-state"><p>Aucune zone définie</p></div>';
            return;
        }

        container.innerHTML = zones.map(zone => `
            <div class="list-item">
                <div class="list-item-title">${zone.nom}</div>
                <div class="list-item-meta">
                    <span>${zone.usage || ''}</span>
                    ${zone.surface ? `<span>${zone.surface} m²</span>` : ''}
                </div>
            </div>
        `).join('');
    }

    async loadConstats() {
        const constats = await db.getConstatsByVisite(this.currentVisite.id);
        const container = document.getElementById('constatsList');
        
        if (constats.length === 0) {
            container.innerHTML = '<div class="empty-state"><p>Aucun constat enregistré</p></div>';
            return;
        }

        container.innerHTML = constats.map(constat => `
            <div class="list-item">
                <div class="list-item-header">
                    <div class="list-item-title">${constat.pointControle}</div>
                    <span class="badge badge-${scoring.getCriticiteColor(constat.criticite)}">${constat.criticite || 'N/A'}</span>
                </div>
                <div class="list-item-meta">
                    <span>Famille: ${constat.famille}</span>
                    <span>Statut: ${constat.statut}</span>
                </div>
            </div>
        `).join('');
    }

    async loadVisiteActions() {
        const constats = await db.getConstatsByVisite(this.currentVisite.id);
        const nc = constats.filter(c => c.statut === 'NC');
        const container = document.getElementById('actionsList');
        
        if (nc.length === 0) {
            container.innerHTML = '<div class="empty-state"><p>Aucune action à traiter</p></div>';
            return;
        }

        container.innerHTML = nc.map(constat => `
            <div class="list-item">
                <div class="list-item-header">
                    <div class="list-item-title">${constat.pointControle}</div>
                    <span class="badge badge-${scoring.getCriticiteColor(constat.criticite)}">${constat.priorite || 'N/A'}</span>
                </div>
                <div class="list-item-meta">
                    <span>Action: ${constat.action || 'À définir'}</span>
                    <span>Statut: ${constat.statutAction || 'Ouvert'}</span>
                </div>
            </div>
        `).join('');
    }

    async loadAllActions() {
        const constats = await db.getAllConstats();
        const nc = constats.filter(c => c.statut === 'NC');
        this.renderActionsList(nc);
    }

    renderActionsList(constats) {
        const container = document.getElementById('allActionsList');
        
        if (constats.length === 0) {
            container.innerHTML = '<div class="empty-state"><p>Aucune action à traiter</p></div>';
            return;
        }

        const sorted = constats.sort((a, b) => (b.scoreMatrice || 0) - (a.scoreMatrice || 0));

        container.innerHTML = sorted.map(constat => `
            <div class="list-item">
                <div class="list-item-header">
                    <div class="list-item-title">${constat.pointControle}</div>
                    <span class="badge badge-${scoring.getCriticiteColor(constat.criticite)}">${constat.priorite || 'N/A'}</span>
                </div>
                <div class="list-item-meta">
                    <span>Famille: ${constat.famille}</span>
                    <span>Score: ${constat.scoreMatrice || 'N/A'}</span>
                    <span>Statut: ${constat.statutAction || 'Ouvert'}</span>
                </div>
            </div>
        `).join('');
    }

    async filterActions() {
        const priorite = document.getElementById('filterPriorite').value;
        const statut = document.getElementById('filterStatut').value;
        
        let constats = await db.getNCConstats();
        
        if (priorite) {
            constats = constats.filter(c => c.criticite === priorite);
        }
        
        if (statut) {
            constats = constats.filter(c => c.statutAction === statut);
        }
        
        this.renderActionsList(constats);
    }

    async loadDashboard() {
        // Will be implemented by dashboard.js
        if (typeof dashboardManager !== 'undefined') {
            await dashboardManager.render();
        }
    }

    async exportCurrentVisite() {
        // Will be implemented by export.js
        if (typeof exportManager !== 'undefined') {
            await exportManager.exportVisite(this.currentVisite.id);
        } else {
            utils.showToast('Export en développement', 'info');
        }
    }

    async exportAllActions() {
        if (typeof exportManager !== 'undefined') {
            await exportManager.exportActions();
        } else {
            utils.showToast('Export en développement', 'info');
        }
    }
}

// Export UI manager instance
const ui = new UIManager();
