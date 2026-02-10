// Dashboard Manager
class DashboardManager {
    constructor() {
        this.charts = {};
    }

    async render() {
        const constats = await db.getAllConstats();
        
        // Update KPIs
        this.updateKPIs(constats);
        
        // Render charts
        this.renderCriticiteChart(constats);
        this.renderFamilleChart(constats);
        this.renderHeatmap(constats);
        this.renderTop10(constats);
    }

    updateKPIs(constats) {
        const nc = constats.filter(c => c.statut === 'NC');
        const critique = constats.filter(c => c.criticite === 'Critique' || c.criticite === 'Catastrophique');
        const actionsWithStatus = nc.filter(c => c.statutAction);
        const actionsClosed = actionsWithStatus.filter(c => c.statutAction === 'Clos');
        const percentClosed = actionsWithStatus.length > 0 
            ? Math.round((actionsClosed.length / actionsWithStatus.length) * 100) 
            : 0;

        document.getElementById('kpiTotalConstats').textContent = constats.length;
        document.getElementById('kpiNC').textContent = nc.length;
        document.getElementById('kpiCritique').textContent = critique.length;
        document.getElementById('kpiActionsClose').textContent = `${percentClosed}%`;
    }

    renderCriticiteChart(constats) {
        const canvas = document.getElementById('criticiteChart');
        const ctx = canvas.getContext('2d');

        // Destroy existing chart if any
        if (this.charts.criticite) {
            this.charts.criticite.destroy();
        }

        const distribution = scoring.getCriticiteDistribution(constats);
        
        const data = {
            labels: Object.keys(distribution),
            datasets: [{
                label: 'Nombre de constats',
                data: Object.values(distribution),
                backgroundColor: [
                    'rgba(239, 68, 68, 0.7)',   // Catastrophique
                    'rgba(239, 68, 68, 0.6)',   // Critique
                    'rgba(245, 158, 11, 0.7)',  // Élevé
                    'rgba(6, 182, 212, 0.7)',   // Modéré
                    'rgba(16, 185, 129, 0.7)'   // Faible
                ],
                borderColor: [
                    'rgb(239, 68, 68)',
                    'rgb(239, 68, 68)',
                    'rgb(245, 158, 11)',
                    'rgb(6, 182, 212)',
                    'rgb(16, 185, 129)'
                ],
                borderWidth: 2
            }]
        };

        this.charts.criticite = new Chart(ctx, {
            type: 'doughnut',
            data: data,
            options: {
                responsive: true,
                maintainAspectRatio: true,
                plugins: {
                    legend: {
                        position: 'bottom'
                    }
                }
            }
        });
    }

    renderFamilleChart(constats) {
        const canvas = document.getElementById('familleChart');
        const ctx = canvas.getContext('2d');

        if (this.charts.famille) {
            this.charts.famille.destroy();
        }

        const distribution = scoring.getFamilleDistribution(constats);
        
        // Sort by count descending and take top 10
        const sorted = Object.entries(distribution)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 10);

        const data = {
            labels: sorted.map(item => item[0]),
            datasets: [{
                label: 'Non-conformités',
                data: sorted.map(item => item[1]),
                backgroundColor: 'rgba(37, 99, 235, 0.7)',
                borderColor: 'rgb(37, 99, 235)',
                borderWidth: 2
            }]
        };

        this.charts.famille = new Chart(ctx, {
            type: 'bar',
            data: data,
            options: {
                responsive: true,
                maintainAspectRatio: true,
                indexAxis: 'y',
                plugins: {
                    legend: {
                        display: false
                    }
                },
                scales: {
                    x: {
                        beginAtZero: true,
                        ticks: {
                            stepSize: 1
                        }
                    }
                }
            }
        });
    }

    renderHeatmap(constats) {
        const container = document.getElementById('heatmapContainer');
        const heatmapData = scoring.getHeatmapData(constats);

        // Create 5x5 grid
        const grid = document.createElement('div');
        grid.className = 'heatmap-grid';

        // Headers
        grid.innerHTML = `
            <div class="heatmap-cell heatmap-header"></div>
            <div class="heatmap-cell heatmap-header">1</div>
            <div class="heatmap-cell heatmap-header">2</div>
            <div class="heatmap-cell heatmap-header">3</div>
            <div class="heatmap-cell heatmap-header">4</div>
            <div class="heatmap-cell heatmap-header">5</div>
        `;

        // Rows (Probabilité from 5 to 1, top to bottom)
        for (let p = 5; p >= 1; p--) {
            grid.innerHTML += `<div class="heatmap-cell heatmap-header">${p}</div>`;
            
            for (let g = 1; g <= 5; g++) {
                const key = `${p}-${g}`;
                const count = heatmapData[key] || 0;
                const score = p * g;
                
                let level = 1;
                if (score >= 21) level = 5;
                else if (score >= 16) level = 4;
                else if (score >= 11) level = 3;
                else if (score >= 6) level = 2;
                
                grid.innerHTML += `
                    <div class="heatmap-cell" data-level="${level}" title="P${p} × G${g} = ${score} (${count} constats)">
                        ${count > 0 ? count : ''}
                    </div>
                `;
            }
        }

        container.innerHTML = '';
        container.appendChild(grid);

        // Add labels
        const labelsDiv = document.createElement('div');
        labelsDiv.style.marginTop = '1rem';
        labelsDiv.style.fontSize = '0.875rem';
        labelsDiv.style.color = 'var(--text-secondary)';
        labelsDiv.innerHTML = `
            <p style="margin-bottom: 0.5rem;"><strong>Axe vertical:</strong> Probabilité (5 = Très probable, 1 = Rare)</p>
            <p><strong>Axe horizontal:</strong> Gravité (1 = Mineure, 5 = Catastrophique)</p>
        `;
        container.appendChild(labelsDiv);
    }

    renderTop10(constats) {
        const container = document.getElementById('top10List');
        const top10 = scoring.getTopRisks(constats, 10);

        if (top10.length === 0) {
            container.innerHTML = '<div class="empty-state"><p>Aucun risque évalué</p></div>';
            return;
        }

        container.innerHTML = top10.map((constat, index) => `
            <div class="list-item">
                <div class="list-item-header">
                    <div class="list-item-title">#${index + 1} - ${constat.pointControle}</div>
                    <span class="badge badge-${scoring.getCriticiteColor(constat.criticite)}">
                        Score: ${constat.scoreMatrice}
                    </span>
                </div>
                <div class="list-item-meta">
                    <span>Famille: ${constat.famille}</span>
                    <span>P: ${constat.probabilite} × G: ${constat.gravite}</span>
                    <span>${constat.criticite}</span>
                </div>
            </div>
        `).join('');
    }
}

// Export dashboard manager instance
const dashboardManager = new DashboardManager();
