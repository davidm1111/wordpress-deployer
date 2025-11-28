// WordPress Deployer - Frontend Application Logic

class WPDeployer {
    constructor() {
        this.baseUrl = '';
        this.token = localStorage.getItem('token');
        this.user = JSON.parse(localStorage.getItem('user') || 'null');
        this.servers = [];
        this.sites = [];

        this.init();
    }

    init() {
        // Check authentication
        if (window.location.pathname.includes('dashboard.html') && !this.token) {
            window.location.href = '/login.html';
            return;
        }

        if (window.location.pathname.includes('dashboard.html')) {
            this.loadDashboard();
        }
    }

    async loadDashboard() {
        try {
            await Promise.all([
                this.loadServers(),
                this.loadSites()
            ]);

            this.updateStats();
            this.renderServers();
            this.renderSites();
            this.populateServerDropdowns();
        } catch (error) {
            console.error('Error loading dashboard:', error);
        }
    }

    async loadServers() {
        try {
            const response = await this.fetch('/api/servers');
            this.servers = response.servers || [];
        } catch (error) {
            console.error('Error loading servers:', error);
            this.servers = this.getMockServers();
        }
    }

    async loadSites() {
        try {
            const response = await this.fetch('/api/sites');
            this.sites = response.sites || [];
        } catch (error) {
            console.error('Error loading sites:', error);
            this.sites = this.getMockSites();
        }
    }

    updateStats() {
        document.getElementById('servers-count').textContent = this.servers.length;
        document.getElementById('sites-count').textContent = this.sites.length;

        const activeSites = this.sites.filter(s => s.status === 'active').length;
        document.getElementById('active-sites-count').textContent = activeSites;

        const totalUsage = this.sites.reduce((sum, site) => sum + (site.diskUsage || 0), 0);
        document.getElementById('total-usage').textContent = (totalUsage / 1024).toFixed(1) + ' GB';
    }

    renderServers() {
        const container = document.getElementById('servers-list');

        if (this.servers.length === 0) {
            container.innerHTML = '<p class="text-muted">No hay servidores configurados. Añade tu primer servidor para comenzar.</p>';
            return;
        }

        container.innerHTML = this.servers.map(server => `
      <div class="server-card animate-fade-in">
        <div class="server-header">
          <div>
            <h3 style="margin-bottom: 0.5rem;">${server.name}</h3>
            <p class="text-muted" style="margin: 0; font-size: 0.875rem;">${server.ip}</p>
          </div>
          <div class="server-actions">
            <button class="icon-btn" onclick="app.editServer('${server.id}')" title="Editar">
              <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/>
              </svg>
            </button>
            <button class="icon-btn" onclick="app.deleteServer('${server.id}')" title="Eliminar">
              <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
              </svg>
            </button>
          </div>
        </div>
        
        <div style="display: flex; gap: 1rem; margin-bottom: 1rem;">
          <div class="status-indicator">
            <span class="status-dot ${server.status === 'connected' ? 'active' : 'inactive'}"></span>
            <span style="font-size: 0.875rem; text-transform: capitalize;">${server.status === 'connected' ? 'Conectado' : 'Desconectado'}</span>
          </div>
        </div>
        
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; padding-top: 1rem; border-top: 1px solid var(--color-border);">
          <div>
            <div class="text-muted" style="font-size: 0.75rem;">SISTEMA</div>
            <div style="font-weight: 500;">${server.os || 'Ubuntu 22.04'}</div>
          </div>
          <div>
            <div class="text-muted" style="font-size: 0.75rem;">SITIOS</div>
            <div style="font-weight: 500;">${server.sitesCount || 0}</div>
          </div>
        </div>
      </div>
    `).join('');
    }

    renderSites() {
        const container = document.getElementById('sites-list');

        if (this.sites.length === 0) {
            container.innerHTML = '<p class="text-muted">No hay sitios desplegados. Despliega tu primer sitio WordPress ahora.</p>';
            return;
        }

        container.innerHTML = this.sites.map(site => `
      <div class="site-card animate-fade-in">
        <div class="site-header">
          <div>
            <h3 style="margin-bottom: 0.5rem;">${site.name}</h3>
            <a href="https://${site.domain}" target="_blank" class="text-primary" style="font-size: 0.875rem;">
              ${site.domain}
              <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24" style="display: inline; margin-left: 0.25rem;">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"/>
              </svg>
            </a>
          </div>
          <div class="site-actions">
            <button class="icon-btn" onclick="app.cloneSite('${site.id}')" title="Clonar">
              <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"/>
              </svg>
            </button>
            <button class="icon-btn" onclick="app.manageSite('${site.id}')" title="Gestionar">
              <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"/>
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
              </svg>
            </button>
            <button class="icon-btn" onclick="app.deleteSite('${site.id}')" title="Eliminar">
              <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
              </svg>
            </button>
          </div>
        </div>
        
        <div style="display: flex; gap: 1rem; margin-bottom: 1rem;">
          <span class="badge badge-${site.status === 'active' ? 'success' : site.status === 'deploying' ? 'warning' : 'danger'}">
            ${site.status === 'active' ? 'Activo' : site.status === 'deploying' ? 'Desplegando' : 'Error'}
          </span>
          ${site.ssl ? '<span class="badge badge-success">🔒 SSL</span>' : ''}
        </div>
        
        <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 1rem; padding-top: 1rem; border-top: 1px solid var(--color-border); font-size: 0.875rem;">
          <div>
            <div class="text-muted" style="font-size: 0.75rem;">SERVIDOR</div>
            <div style="font-weight: 500;">${site.serverName || 'N/A'}</div>
          </div>
          <div>
            <div class="text-muted" style="font-size: 0.75rem;">WP VERSION</div>
            <div style="font-weight: 500;">${site.wpVersion || '6.4'}</div>
          </div>
          <div>
            <div class="text-muted" style="font-size: 0.75rem;">ESPACIO</div>
            <div style="font-weight: 500;">${((site.diskUsage || 0) / 1024).toFixed(1)} GB</div>
          </div>
        </div>
      </div>
    `).join('');
    }

    populateServerDropdowns() {
        const deployDropdown = document.getElementById('deploy-server');
        const cloneDropdown = document.getElementById('clone-server');

        const options = this.servers.map(server =>
            `<option value="${server.id}">${server.name} (${server.ip})</option>`
        ).join('');

        if (deployDropdown) {
            deployDropdown.innerHTML = '<option value="">Selecciona un servidor</option>' + options;
        }

        if (cloneDropdown) {
            cloneDropdown.innerHTML = '<option value="">Selecciona un servidor</option>' + options;
        }
    }

    async addServer(serverData) {
        try {
            const response = await this.fetch('/api/servers', {
                method: 'POST',
                body: JSON.stringify(serverData)
            });

            await this.loadServers();
            this.renderServers();
            this.populateServerDropdowns();
            this.updateStats();

            this.showNotification('Servidor añadido correctamente', 'success');
            return response;
        } catch (error) {
            // Demo mode - add mock server
            const newServer = {
                id: 'srv_' + Date.now(),
                ...serverData,
                status: 'connected',
                sitesCount: 0,
                os: 'Ubuntu 22.04'
            };

            this.servers.push(newServer);
            this.renderServers();
            this.populateServerDropdowns();
            this.updateStats();

            this.showNotification('Servidor añadido (modo demo)', 'success');
            return newServer;
        }
    }

    async deploySite(siteData) {
        try {
            const response = await this.fetch('/api/sites/deploy', {
                method: 'POST',
                body: JSON.stringify(siteData)
            });

            await this.loadSites();
            this.renderSites();
            this.updateStats();

            this.showNotification('Sitio desplegado correctamente', 'success');
            return response;
        } catch (error) {
            // Demo mode - add mock site
            const server = this.servers.find(s => s.id === siteData.serverId);
            const newSite = {
                id: 'site_' + Date.now(),
                name: siteData.name,
                domain: siteData.domain,
                status: 'deploying',
                ssl: siteData.installSsl,
                wpVersion: siteData.wpVersion === 'latest' ? '6.4' : siteData.wpVersion,
                serverName: server?.name || 'Unknown',
                serverId: siteData.serverId,
                diskUsage: Math.floor(Math.random() * 2000) + 500,
                createdAt: new Date().toISOString()
            };

            this.sites.push(newSite);

            // Simulate deployment
            setTimeout(() => {
                newSite.status = 'active';
                this.renderSites();
                this.updateStats();
            }, 3000);

            this.renderSites();
            this.updateStats();

            this.showNotification('Desplegando WordPress... (modo demo)', 'success');
            return newSite;
        }
    }

    async cloneSiteData(cloneData) {
        try {
            const response = await this.fetch('/api/sites/clone', {
                method: 'POST',
                body: JSON.stringify(cloneData)
            });

            await this.loadSites();
            this.renderSites();
            this.updateStats();

            this.showNotification('Sitio clonado correctamente', 'success');
            return response;
        } catch (error) {
            // Demo mode - clone site
            const sourceSite = this.sites.find(s => s.id === cloneData.sourceId);
            const server = this.servers.find(s => s.id === cloneData.serverId);

            const clonedSite = {
                id: 'site_' + Date.now(),
                name: cloneData.name,
                domain: cloneData.domain,
                status: 'active',
                ssl: sourceSite.ssl,
                wpVersion: sourceSite.wpVersion,
                serverName: server?.name || 'Unknown',
                serverId: cloneData.serverId,
                diskUsage: sourceSite.diskUsage,
                createdAt: new Date().toISOString()
            };

            this.sites.push(clonedSite);
            this.renderSites();
            this.updateStats();

            this.showNotification('Sitio clonado (modo demo)', 'success');
            return clonedSite;
        }
    }

    cloneSite(siteId) {
        const site = this.sites.find(s => s.id === siteId);
        if (!site) return;

        document.getElementById('clone-source-id').value = siteId;
        document.getElementById('clone-source-name').value = site.name;
        document.getElementById('clone-new-name').value = 'Copia de ' + site.name;

        openModal('clone-site');
    }

    async deleteServer(serverId) {
        if (!confirm('¿Estás seguro de que quieres eliminar este servidor?')) {
            return;
        }

        try {
            await this.fetch(`/api/servers/${serverId}`, {
                method: 'DELETE'
            });

            await this.loadServers();
            this.renderServers();
            this.populateServerDropdowns();
            this.updateStats();

            this.showNotification('Servidor eliminado', 'success');
        } catch (error) {
            // Demo mode
            this.servers = this.servers.filter(s => s.id !== serverId);
            this.renderServers();
            this.populateServerDropdowns();
            this.updateStats();

            this.showNotification('Servidor eliminado (modo demo)', 'success');
        }
    }

    async deleteSite(siteId) {
        if (!confirm('¿Estás seguro de que quieres eliminar este sitio? Esta acción no se puede deshacer.')) {
            return;
        }

        try {
            await this.fetch(`/api/sites/${siteId}`, {
                method: 'DELETE'
            });

            await this.loadSites();
            this.renderSites();
            this.updateStats();

            this.showNotification('Sitio eliminado', 'success');
        } catch (error) {
            // Demo mode
            this.sites = this.sites.filter(s => s.id !== siteId);
            this.renderSites();
            this.updateStats();

            this.showNotification('Sitio eliminado (modo demo)', 'success');
        }
    }

    editServer(serverId) {
        this.showNotification('Funcionalidad de edición próximamente', 'info');
    }

    manageSite(siteId) {
        this.showNotification('Panel de gestión próximamente', 'info');
    }

    async fetch(url, options = {}) {
        const headers = {
            'Content-Type': 'application/json',
            ...options.headers
        };

        if (this.token) {
            headers['Authorization'] = `Bearer ${this.token}`;
        }

        const response = await fetch(this.baseUrl + url, {
            ...options,
            headers
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        return response.json();
    }

    showNotification(message, type = 'info') {
        // Simple notification (could be replaced with a toast library)
        const colors = {
            success: '#10b981',
            error: '#ef4444',
            warning: '#f59e0b',
            info: '#06b6d4'
        };

        const notification = document.createElement('div');
        notification.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      background: ${colors[type]};
      color: white;
      padding: 1rem 1.5rem;
      border-radius: 0.5rem;
      box-shadow: 0 10px 25px rgba(0,0,0,0.3);
      z-index: 9999;
      animation: slideIn 0.3s ease;
      font-weight: 500;
    `;
        notification.textContent = message;

        document.body.appendChild(notification);

        setTimeout(() => {
            notification.style.animation = 'fadeOut 0.3s ease';
            setTimeout(() => notification.remove(), 300);
        }, 3000);
    }

    getMockServers() {
        return [
            {
                id: 'srv_1',
                name: 'Servidor Principal',
                ip: '192.168.1.100',
                status: 'connected',
                os: 'Ubuntu 22.04',
                sitesCount: 2
            },
            {
                id: 'srv_2',
                name: 'VPS Producción',
                ip: '45.67.89.123',
                status: 'connected',
                os: 'Ubuntu 20.04',
                sitesCount: 1
            }
        ];
    }

    getMockSites() {
        return [
            {
                id: 'site_1',
                name: 'Mi Blog Personal',
                domain: 'miblog.com',
                status: 'active',
                ssl: true,
                wpVersion: '6.4',
                serverName: 'Servidor Principal',
                serverId: 'srv_1',
                diskUsage: 1250
            },
            {
                id: 'site_2',
                name: 'Tienda Online',
                domain: 'mitienda.com',
                status: 'active',
                ssl: true,
                wpVersion: '6.4',
                serverName: 'Servidor Principal',
                serverId: 'srv_1',
                diskUsage: 3500
            },
            {
                id: 'site_3',
                name: 'Portfolio Cliente',
                domain: 'cliente.com',
                status: 'active',
                ssl: true,
                wpVersion: '6.3',
                serverName: 'VPS Producción',
                serverId: 'srv_2',
                diskUsage: 890
            }
        ];
    }
}

// Initialize app
const app = new WPDeployer();

// Global functions for HTML onclick handlers
function showSection(section) {
    // Hide all sections
    document.querySelectorAll('.dashboard-section').forEach(s => s.style.display = 'none');

    // Update nav
    document.querySelectorAll('.sidebar-link').forEach(link => link.classList.remove('active'));
    event.target.classList.add('active');

    // Show selected section
    const sectionMap = {
        'overview': 'overview-section',
        'servers': 'servers-section',
        'sites': 'sites-section'
    };

    const sectionId = sectionMap[section];
    if (sectionId) {
        document.getElementById(sectionId).style.display = 'block';
    }

    // Update page title
    const titles = {
        'overview': 'Vista General',
        'servers': 'Servidores',
        'sites': 'Sitios WordPress'
    };

    document.getElementById('page-title').textContent = titles[section];
}

function openModal(modalName) {
    const modal = document.getElementById(modalName + '-modal');
    if (modal) {
        modal.classList.add('active');
    }
}

function closeModal(modalName) {
    const modal = document.getElementById(modalName + '-modal');
    if (modal) {
        modal.classList.remove('active');
    }
}

function handleAddServer(event) {
    event.preventDefault();

    const serverData = {
        name: document.getElementById('server-name').value,
        ip: document.getElementById('server-ip').value,
        user: document.getElementById('server-user').value,
        port: parseInt(document.getElementById('server-port').value),
        sshKey: document.getElementById('server-key').value
    };

    app.addServer(serverData);
    closeModal('add-server');
    event.target.reset();
}

function handleDeployWordPress(event) {
    event.preventDefault();

    const siteData = {
        serverId: document.getElementById('deploy-server').value,
        name: document.getElementById('site-name').value,
        domain: document.getElementById('site-domain').value,
        wpVersion: document.getElementById('wp-version').value,
        installSsl: document.getElementById('install-ssl').checked
    };

    app.deploySite(siteData);
    closeModal('deploy-wordpress');
    event.target.reset();
}

function handleCloneSite(event) {
    event.preventDefault();

    const cloneData = {
        sourceId: document.getElementById('clone-source-id').value,
        name: document.getElementById('clone-new-name').value,
        domain: document.getElementById('clone-new-domain').value,
        serverId: document.getElementById('clone-server').value
    };

    app.cloneSiteData(cloneData);
    closeModal('clone-site');
    event.target.reset();
}

function logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/login.html';
}

// Close modals on background click
document.addEventListener('click', (e) => {
    if (e.target.classList.contains('modal')) {
        e.target.classList.remove('active');
    }
});
