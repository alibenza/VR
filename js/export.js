// Export Manager - Handles Excel/CSV and PDF exports
class ExportManager {
    constructor() {
        this.jspdf = null;
    }

    // Export visite to Excel
    async exportVisite(visiteId) {
        utils.showLoading();

        try {
            const visite = await db.get('visites', visiteId);
            const site = await db.get('sites', visite.siteId);
            const zones = await db.getZonesByVisite(visiteId);
            const constats = await db.getConstatsByVisite(visiteId);

            // Create workbook
            const wb = XLSX.utils.book_new();

            // Sheet 1: Visite Info
            const visiteData = [
                ['RAPPORT DE VISITE'],
                [],
                ['Site', site ? site.nom : 'Inconnu'],
                ['Type', site ? site.type : ''],
                ['Adresse', site ? site.adresse : ''],
                [],
                ['Date de visite', utils.formatDate(visite.date)],
                ['Auditeur', visite.auditeur],
                ['Accompagnateurs', visite.accompagnateurs || ''],
                ['Objectif', visite.objectif || ''],
                ['Périmètre', visite.perimetre || '']
            ];
            const wsInfo = XLSX.utils.aoa_to_sheet(visiteData);
            XLSX.utils.book_append_sheet(wb, wsInfo, 'Informations');

            // Sheet 2: Zones
            if (zones.length > 0) {
                const zonesData = [
                    ['ID', 'Nom', 'Usage', 'Surface (m²)', 'Bâtiment']
                ];
                zones.forEach(zone => {
                    zonesData.push([
                        zone.id,
                        zone.nom,
                        zone.usage || '',
                        zone.surface || '',
                        zone.batiment || ''
                    ]);
                });
                const wsZones = XLSX.utils.aoa_to_sheet(zonesData);
                XLSX.utils.book_append_sheet(wb, wsZones, 'Zones');
            }

            // Sheet 3: Constats
            if (constats.length > 0) {
                const constatsData = [
                    ['ID', 'Famille', 'Point de Contrôle', 'Statut', 'Probabilité', 'Gravité', 'Score Matrice', 'Criticité', 'Maîtrise', 'Impact', 'Score Assureur', 'Preuve', 'Commentaire', 'Action', 'Responsable', 'Échéance', 'Statut Action']
                ];
                constats.forEach(constat => {
                    constatsData.push([
                        constat.id,
                        constat.famille,
                        constat.pointControle,
                        constat.statut,
                        constat.probabilite || '',
                        constat.gravite || '',
                        constat.scoreMatrice || '',
                        constat.criticite || '',
                        constat.maitrise !== null ? constat.maitrise : '',
                        constat.impact || '',
                        constat.scoreAssureur || '',
                        constat.preuve || '',
                        constat.commentaire || '',
                        constat.action || '',
                        constat.responsable || '',
                        constat.echeance ? utils.formatDate(constat.echeance) : '',
                        constat.statutAction || ''
                    ]);
                });
                const wsConstats = XLSX.utils.aoa_to_sheet(constatsData);
                XLSX.utils.book_append_sheet(wb, wsConstats, 'Constats');
            }

            // Sheet 4: Plan d'Actions (NC only)
            const nc = constats.filter(c => c.statut === 'NC');
            if (nc.length > 0) {
                const actionsData = [
                    ['ID', 'Famille', 'Constat', 'Criticité', 'Priorité', 'Action', 'Responsable', 'Échéance', 'Statut']
                ];
                nc.forEach(constat => {
                    actionsData.push([
                        constat.id,
                        constat.famille,
                        constat.pointControle,
                        constat.criticite || '',
                        constat.priorite || '',
                        constat.action || 'À définir',
                        constat.responsable || '',
                        constat.echeance ? utils.formatDate(constat.echeance) : '',
                        constat.statutAction || 'Ouvert'
                    ]);
                });
                const wsActions = XLSX.utils.aoa_to_sheet(actionsData);
                XLSX.utils.book_append_sheet(wb, wsActions, 'Plan d\'Actions');
            }

            // Generate filename
            const filename = `Visite_${site ? site.nom.replace(/\s+/g, '_') : 'Site'}_${utils.formatDate(visite.date).replace(/\//g, '-')}.xlsx`;

            // Write file
            XLSX.writeFile(wb, filename);

            utils.hideLoading();
            utils.showToast('Export Excel réussi', 'success');
        } catch (error) {
            utils.hideLoading();
            utils.showToast('Erreur lors de l\'export: ' + error.message, 'error');
            console.error(error);
        }
    }

    // Export all actions to Excel
    async exportActions() {
        utils.showLoading();

        try {
            const constats = await db.getNCConstats();
            const visites = await db.getAll('visites');
            const sites = await db.getAll('sites');

            if (constats.length === 0) {
                utils.hideLoading();
                utils.showToast('Aucune action à exporter', 'info');
                return;
            }

            // Sort by score descending
            const sorted = constats.sort((a, b) => (b.scoreMatrice || 0) - (a.scoreMatrice || 0));

            const actionsData = [
                ['ID', 'Site', 'Date Visite', 'Famille', 'Constat', 'Criticité', 'Priorité', 'Score', 'Action', 'Responsable', 'Échéance', 'Statut']
            ];

            sorted.forEach(constat => {
                const visite = visites.find(v => v.id === constat.visiteId);
                const site = visite ? sites.find(s => s.id === visite.siteId) : null;

                actionsData.push([
                    constat.id,
                    site ? site.nom : 'Inconnu',
                    visite ? utils.formatDate(visite.date) : '',
                    constat.famille,
                    constat.pointControle,
                    constat.criticite || '',
                    constat.priorite || '',
                    constat.scoreMatrice || '',
                    constat.action || 'À définir',
                    constat.responsable || '',
                    constat.echeance ? utils.formatDate(constat.echeance) : '',
                    constat.statutAction || 'Ouvert'
                ]);
            });

            const wb = XLSX.utils.book_new();
            const ws = XLSX.utils.aoa_to_sheet(actionsData);
            XLSX.utils.book_append_sheet(wb, ws, 'Plan d\'Actions');

            const filename = `Plan_Actions_${new Date().toISOString().split('T')[0]}.xlsx`;
            XLSX.writeFile(wb, filename);

            utils.hideLoading();
            utils.showToast('Export des actions réussi', 'success');
        } catch (error) {
            utils.hideLoading();
            utils.showToast('Erreur lors de l\'export: ' + error.message, 'error');
            console.error(error);
        }
    }

    // Export visite to PDF
    async exportVisiteToPDF(visiteId) {
        utils.showLoading();

        try {
            // Note: jsPDF basic implementation
            // For production, consider using jsPDF with autoTable plugin
            const visite = await db.get('visites', visiteId);
            const site = await db.get('sites', visite.siteId);
            const constats = await db.getConstatsByVisite(visiteId);

            const { jsPDF } = window.jspdf;
            const doc = new jsPDF();

            let y = 20;

            // Title
            doc.setFontSize(18);
            doc.text('RAPPORT DE VISITE', 105, y, { align: 'center' });
            y += 15;

            // Site info
            doc.setFontSize(12);
            doc.text(`Site: ${site ? site.nom : 'Inconnu'}`, 20, y);
            y += 10;
            doc.text(`Date: ${utils.formatDate(visite.date)}`, 20, y);
            y += 10;
            doc.text(`Auditeur: ${visite.auditeur}`, 20, y);
            y += 15;

            // Statistics
            const nc = constats.filter(c => c.statut === 'NC');
            doc.setFontSize(14);
            doc.text('Synthèse', 20, y);
            y += 10;
            doc.setFontSize(11);
            doc.text(`Total constats: ${constats.length}`, 20, y);
            y += 7;
            doc.text(`Non-conformités: ${nc.length}`, 20, y);
            y += 7;
            doc.text(`Conformes: ${constats.filter(c => c.statut === 'C').length}`, 20, y);
            y += 15;

            // Constats list (simplified)
            if (nc.length > 0 && y < 250) {
                doc.setFontSize(14);
                doc.text('Non-Conformités', 20, y);
                y += 10;
                doc.setFontSize(10);

                nc.slice(0, 10).forEach((constat, index) => {
                    if (y > 270) return; // Avoid overflow
                    doc.text(`${index + 1}. ${constat.pointControle} (${constat.criticite || 'N/A'})`, 20, y);
                    y += 7;
                });

                if (nc.length > 10) {
                    doc.text(`... et ${nc.length - 10} autres non-conformités`, 20, y);
                }
            }

            // Save PDF
            const filename = `Rapport_${site ? site.nom.replace(/\s+/g, '_') : 'Site'}_${utils.formatDate(visite.date).replace(/\//g, '-')}.pdf`;
            doc.save(filename);

            utils.hideLoading();
            utils.showToast('Export PDF réussi', 'success');
        } catch (error) {
            utils.hideLoading();
            utils.showToast('Erreur lors de l\'export PDF: ' + error.message, 'error');
            console.error(error);
        }
    }
}

// Export export manager instance
const exportManager = new ExportManager();
