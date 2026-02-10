// Authentication Manager (Demo mode with localStorage)
class AuthManager {
    constructor() {
        this.currentUser = null;
        this.storageKey = 'visiteRisques_user';
    }

    // Initialize auth state
    init() {
        const savedUser = localStorage.getItem(this.storageKey);
        if (savedUser) {
            this.currentUser = JSON.parse(savedUser);
            return true;
        }
        return false;
    }

    // Login (Demo: any email/password works)
    async login(email, password) {
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                if (email && password) {
                    this.currentUser = {
                        email,
                        name: email.split('@')[0],
                        loginTime: new Date().toISOString()
                    };
                    localStorage.setItem(this.storageKey, JSON.stringify(this.currentUser));
                    resolve(this.currentUser);
                } else {
                    reject(new Error('Email et mot de passe requis'));
                }
            }, 500);
        });
    }

    // Logout
    logout() {
        this.currentUser = null;
        localStorage.removeItem(this.storageKey);
    }

    // Get current user
    getCurrentUser() {
        return this.currentUser;
    }

    // Check if authenticated
    isAuthenticated() {
        return this.currentUser !== null;
    }
}

// Export auth manager instance
const auth = new AuthManager();
