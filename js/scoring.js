// Scoring Engine
class ScoringEngine {
    constructor() {
        // Matrix 5x5: Probabilité (1-5) × Gravité (1-5)
        this.matrixLevels = {
            1: { level: 'Faible', color: 'success', range: [1, 5] },
            2: { level: 'Modéré', color: 'info', range: [6, 10] },
            3: { level: 'Élevé', color: 'warning', range: [11, 15] },
            4: { level: 'Critique', color: 'danger', range: [16, 20] },
            5: { level: 'Catastrophique', color: 'danger', range: [21, 25] }
        };

        // Assureur score: (4 - Maîtrise(0-3)) × Impact(1-4) × 2
        this.assureurLevels = {
            1: { level: 'Acceptable', color: 'success', range: [0, 4] },
            2: { level: 'À surveiller', color: 'info', range: [5, 8] },
            3: { level: 'Préoccupant', color: 'warning', range: [9, 16] },
            4: { level: 'Inacceptable', color: 'danger', range: [17, 32] }
        };
    }

    // Calculate Matrix score
    calculateMatrixScore(probabilite, gravite) {
        if (!probabilite || !gravite) return null;
        
        const score = probabilite * gravite;
        let level = null;
        
        for (const [key, value] of Object.entries(this.matrixLevels)) {
            if (score >= value.range[0] && score <= value.range[1]) {
                level = value;
                break;
            }
        }
        
        return {
            score,
            level: level ? level.level : 'Inconnu',
            color: level ? level.color : 'secondary'
        };
    }

    // Calculate Assureur score
    calculateAssureurScore(maitrise, impact) {
        if (maitrise === null || maitrise === undefined || !impact) return null;
        
        const score = (4 - maitrise) * impact * 2;
        let level = null;
        
        for (const [key, value] of Object.entries(this.assureurLevels)) {
            if (score >= value.range[0] && score <= value.range[1]) {
                level = value;
                break;
            }
        }
        
        return {
            score,
            level: level ? level.level : 'Inconnu',
            color: level ? level.color : 'secondary'
        };
    }

    // Get overall criticite level (using Matrix score by default)
    getCriticite(probabilite, gravite) {
        const matrixResult = this.calculateMatrixScore(probabilite, gravite);
        return matrixResult ? matrixResult.level : null;
    }

    // Get priority based on criticite
    getPriorite(criticite) {
        const priorityMap = {
            'Catastrophique': 'P1 - Critique',
            'Critique': 'P1 - Critique',
            'Élevé': 'P2 - Moyenne',
            'Modéré': 'P2 - Moyenne',
            'Faible': 'P3 - Faible',
            'Acceptable': 'P3 - Faible',
            'À surveiller': 'P3 - Faible',
            'Préoccupant': 'P2 - Moyenne',
            'Inacceptable': 'P1 - Critique'
        };
        
        return priorityMap[criticite] || 'P3 - Faible';
    }

    // Apply scoring to constat object
    scoreConstat(constat) {
        const matrixScore = this.calculateMatrixScore(constat.probabilite, constat.gravite);
        const assureurScore = this.calculateAssureurScore(constat.maitrise, constat.impact);
        
        constat.scoreMatrice = matrixScore ? matrixScore.score : null;
        constat.niveauMatrice = matrixScore ? matrixScore.level : null;
        
        constat.scoreAssureur = assureurScore ? assureurScore.score : null;
        constat.niveauAssureur = assureurScore ? assureurScore.level : null;
        
        // Use Matrix level for overall criticite
        constat.criticite = matrixScore ? matrixScore.level : 'Non évalué';
        constat.priorite = this.getPriorite(constat.criticite);
        
        return constat;
    }

    // Get color for badge display
    getCriticiteColor(criticite) {
        const colorMap = {
            'Catastrophique': 'danger',
            'Critique': 'danger',
            'Élevé': 'warning',
            'Modéré': 'info',
            'Faible': 'success',
            'Acceptable': 'success',
            'À surveiller': 'info',
            'Préoccupant': 'warning',
            'Inacceptable': 'danger'
        };
        
        return colorMap[criticite] || 'secondary';
    }

    // Get heatmap data for dashboard
    getHeatmapData(constats) {
        const heatmap = {};
        
        // Initialize 5x5 grid
        for (let p = 1; p <= 5; p++) {
            for (let g = 1; g <= 5; g++) {
                const key = `${p}-${g}`;
                heatmap[key] = 0;
            }
        }
        
        // Count constats in each cell
        constats.forEach(constat => {
            if (constat.probabilite && constat.gravite) {
                const key = `${constat.probabilite}-${constat.gravite}`;
                heatmap[key] = (heatmap[key] || 0) + 1;
            }
        });
        
        return heatmap;
    }

    // Get criticite distribution
    getCriticiteDistribution(constats) {
        const distribution = {
            'Catastrophique': 0,
            'Critique': 0,
            'Élevé': 0,
            'Modéré': 0,
            'Faible': 0
        };
        
        constats.forEach(constat => {
            if (constat.criticite && distribution.hasOwnProperty(constat.criticite)) {
                distribution[constat.criticite]++;
            }
        });
        
        return distribution;
    }

    // Get famille distribution for NC
    getFamilleDistribution(constats) {
        const distribution = {};
        
        constats.filter(c => c.statut === 'NC').forEach(constat => {
            const famille = constat.famille || 'Non classé';
            distribution[famille] = (distribution[famille] || 0) + 1;
        });
        
        return distribution;
    }

    // Get top N risks
    getTopRisks(constats, n = 10) {
        return constats
            .filter(c => c.scoreMatrice)
            .sort((a, b) => b.scoreMatrice - a.scoreMatrice)
            .slice(0, n);
    }
}

// Export scoring engine instance
const scoring = new ScoringEngine();
