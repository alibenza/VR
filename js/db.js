// IndexedDB Database Manager
class Database {
    constructor() {
        this.db = null;
        this.dbName = 'VisiteRisquesDB';
        this.version = 1;
    }

    async init() {
        return new Promise((resolve, reject) => {
            const request = indexedDB.open(this.dbName, this.version);

            request.onerror = () => reject(request.error);
            request.onsuccess = () => {
                this.db = request.result;
                resolve(this.db);
            };

            request.onupgradeneeded = (event) => {
                const db = event.target.result;

                // Sites Store
                if (!db.objectStoreNames.contains('sites')) {
                    const sitesStore = db.createObjectStore('sites', { keyPath: 'id', autoIncrement: true });
                    sitesStore.createIndex('nom', 'nom', { unique: false });
                    sitesStore.createIndex('type', 'type', { unique: false });
                }

                // Visites Store
                if (!db.objectStoreNames.contains('visites')) {
                    const visitesStore = db.createObjectStore('visites', { keyPath: 'id', autoIncrement: true });
                    visitesStore.createIndex('siteId', 'siteId', { unique: false });
                    visitesStore.createIndex('date', 'date', { unique: false });
                    visitesStore.createIndex('auditeur', 'auditeur', { unique: false });
                }

                // Zones Store
                if (!db.objectStoreNames.contains('zones')) {
                    const zonesStore = db.createObjectStore('zones', { keyPath: 'id', autoIncrement: true });
                    zonesStore.createIndex('visiteId', 'visiteId', { unique: false });
                }

                // Constats Store
                if (!db.objectStoreNames.contains('constats')) {
                    const constatsStore = db.createObjectStore('constats', { keyPath: 'id', autoIncrement: true });
                    constatsStore.createIndex('visiteId', 'visiteId', { unique: false });
                    constatsStore.createIndex('zoneId', 'zoneId', { unique: false });
                    constatsStore.createIndex('statut', 'statut', { unique: false });
                    constatsStore.createIndex('criticite', 'criticite', { unique: false });
                }

                // Photos Store
                if (!db.objectStoreNames.contains('photos')) {
                    const photosStore = db.createObjectStore('photos', { keyPath: 'id', autoIncrement: true });
                    photosStore.createIndex('constatId', 'constatId', { unique: false });
                }

                // Settings Store
                if (!db.objectStoreNames.contains('settings')) {
                    db.createObjectStore('settings', { keyPath: 'key' });
                }
            };
        });
    }

    // Generic CRUD operations
    async add(storeName, data) {
        const tx = this.db.transaction(storeName, 'readwrite');
        const store = tx.objectStore(storeName);
        const request = store.add(data);
        
        return new Promise((resolve, reject) => {
            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });
    }

    async get(storeName, id) {
        const tx = this.db.transaction(storeName, 'readonly');
        const store = tx.objectStore(storeName);
        const request = store.get(id);
        
        return new Promise((resolve, reject) => {
            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });
    }

    async getAll(storeName) {
        const tx = this.db.transaction(storeName, 'readonly');
        const store = tx.objectStore(storeName);
        const request = store.getAll();
        
        return new Promise((resolve, reject) => {
            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });
    }

    async update(storeName, data) {
        const tx = this.db.transaction(storeName, 'readwrite');
        const store = tx.objectStore(storeName);
        const request = store.put(data);
        
        return new Promise((resolve, reject) => {
            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });
    }

    async delete(storeName, id) {
        const tx = this.db.transaction(storeName, 'readwrite');
        const store = tx.objectStore(storeName);
        const request = store.delete(id);
        
        return new Promise((resolve, reject) => {
            request.onsuccess = () => resolve();
            request.onerror = () => reject(request.error);
        });
    }

    async getByIndex(storeName, indexName, value) {
        const tx = this.db.transaction(storeName, 'readonly');
        const store = tx.objectStore(storeName);
        const index = store.index(indexName);
        const request = index.getAll(value);
        
        return new Promise((resolve, reject) => {
            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });
    }

    // Specific methods for business logic
    async getVisitesBysite(siteId) {
        return this.getByIndex('visites', 'siteId', siteId);
    }

    async getZonesByVisite(visiteId) {
        return this.getByIndex('zones', 'visiteId', visiteId);
    }

    async getConstatsByVisite(visiteId) {
        return this.getByIndex('constats', 'visiteId', visiteId);
    }

    async getPhotosByConstat(constatId) {
        return this.getByIndex('photos', 'constatId', constatId);
    }

    async getAllConstats() {
        return this.getAll('constats');
    }

    async getNCConstats() {
        const allConstats = await this.getAllConstats();
        return allConstats.filter(c => c.statut === 'NC');
    }

    // Settings
    async getSetting(key) {
        const setting = await this.get('settings', key);
        return setting ? setting.value : null;
    }

    async setSetting(key, value) {
        return this.update('settings', { key, value });
    }
}

// Reference data
const FAMILLES_RISQUES = [
    'Accès & Périmètre',
    'Infrastructures & Circulation',
    'Gouvernance & Conformité',
    'Maîtrise Opérationnelle',
    'Ambiances de Travail',
    'Produits Chimiques & Stockage',
    'Environnement',
    'Protections & Urgences',
    'Statistiques & REX',
    'Utilités & Énergies',
    'Maintenance & Fiabilité',
    'Sûreté & Malveillance',
    'Protection Incendie',
    'Continuité d\'Activité'
];

const TYPES_SITES = [
    'Industrie',
    'Commerce',
    'Hôpital',
    'Hôtel',
    'Administration',
    'Logistique',
    'Data Center',
    'Autre'
];

const PREUVES = ['Observation', 'Document', 'Entretien'];
const STATUTS_CONSTAT = ['C', 'NC', 'SO'];
const STATUTS_ACTION = ['Ouvert', 'En cours', 'Clos'];

// Export database instance
const db = new Database();
