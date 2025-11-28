// WordPress Deployer - Express Server
require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const path = require('path');
const fs = require('fs').promises;
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const app = express();
const PORT = process.env.PORT || 3000;
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';
const DEMO_MODE = process.env.DEMO_MODE === 'true';

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(express.static('public'));

// Simple file-based database for demo
const DB_PATH = path.join(__dirname, 'data', 'database.json');

// Initialize database
async function initDatabase() {
    try {
        await fs.access(DB_PATH);
    } catch {
        const initialData = {
            users: [],
            servers: [],
            sites: []
        };
        await fs.mkdir(path.dirname(DB_PATH), { recursive: true });
        await fs.writeFile(DB_PATH, JSON.stringify(initialData, null, 2));
    }
}

// Read database
async function readDB() {
    try {
        const data = await fs.readFile(DB_PATH, 'utf8');
        return JSON.parse(data);
    } catch (error) {
        console.error('Error reading database:', error);
        return { users: [], servers: [], sites: [] };
    }
}

// Write database
async function writeDB(data) {
    try {
        await fs.writeFile(DB_PATH, JSON.stringify(data, null, 2));
    } catch (error) {
        console.error('Error writing database:', error);
    }
}

// Auth middleware
function authenticateToken(req, res, next) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({ error: 'No token provided' });
    }

    jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err) {
            return res.status(403).json({ error: 'Invalid token' });
        }
        req.user = user;
        next();
    });
}

// Routes

// Authentication
app.post('/api/auth/register', async (req, res) => {
    try {
        const { name, email, password } = req.body;

        const db = await readDB();

        // Check if user exists
        const existingUser = db.users.find(u => u.email === email);
        if (existingUser) {
            return res.status(400).json({ error: 'El usuario ya existe' });
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create user
        const newUser = {
            id: 'user_' + Date.now(),
            name,
            email,
            password: hashedPassword,
            createdAt: new Date().toISOString()
        };

        db.users.push(newUser);
        await writeDB(db);

        // Generate token
        const token = jwt.sign({ id: newUser.id, email: newUser.email }, JWT_SECRET, { expiresIn: '7d' });

        res.json({
            token,
            user: {
                id: newUser.id,
                name: newUser.name,
                email: newUser.email
            }
        });
    } catch (error) {
        console.error('Register error:', error);
        res.status(500).json({ error: 'Error al registrar usuario' });
    }
});

app.post('/api/auth/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        const db = await readDB();

        // Find user
        const user = db.users.find(u => u.email === email);
        if (!user) {
            return res.status(401).json({ error: 'Credenciales inválidas' });
        }

        // Verify password
        const validPassword = await bcrypt.compare(password, user.password);
        if (!validPassword) {
            return res.status(401).json({ error: 'Credenciales inválidas' });
        }

        // Generate token
        const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, { expiresIn: '7d' });

        res.json({
            token,
            user: {
                id: user.id,
                name: user.name,
                email: user.email
            }
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ error: 'Error al iniciar sesión' });
    }
});

// Servers
app.get('/api/servers', authenticateToken, async (req, res) => {
    try {
        const db = await readDB();
        const userServers = db.servers.filter(s => s.userId === req.user.id);

        res.json({ servers: userServers });
    } catch (error) {
        console.error('Error fetching servers:', error);
        res.status(500).json({ error: 'Error al obtener servidores' });
    }
});

app.post('/api/servers', authenticateToken, async (req, res) => {
    try {
        const { name, ip, user, port, sshKey } = req.body;

        const db = await readDB();

        const newServer = {
            id: 'srv_' + Date.now(),
            userId: req.user.id,
            name,
            ip,
            user,
            port,
            sshKey: DEMO_MODE ? '[ENCRYPTED]' : sshKey, // Don't store in demo mode
            status: DEMO_MODE ? 'connected' : 'connecting',
            os: 'Ubuntu 22.04',
            sitesCount: 0,
            createdAt: new Date().toISOString()
        };

        // In production mode, we would test SSH connection here
        if (!DEMO_MODE) {
            // TODO: Test SSH connection using ssh2 library
            // For now, set to connected
            newServer.status = 'connected';
        }

        db.servers.push(newServer);
        await writeDB(db);

        res.json({ server: newServer });
    } catch (error) {
        console.error('Error adding server:', error);
        res.status(500).json({ error: 'Error al añadir servidor' });
    }
});

app.delete('/api/servers/:id', authenticateToken, async (req, res) => {
    try {
        const { id } = req.params;

        const db = await readDB();

        // Check if server belongs to user
        const server = db.servers.find(s => s.id === id && s.userId === req.user.id);
        if (!server) {
            return res.status(404).json({ error: 'Servidor no encontrado' });
        }

        // Remove server
        db.servers = db.servers.filter(s => s.id !== id);

        // Also remove sites on this server
        db.sites = db.sites.filter(s => s.serverId !== id);

        await writeDB(db);

        res.json({ message: 'Servidor eliminado' });
    } catch (error) {
        console.error('Error deleting server:', error);
        res.status(500).json({ error: 'Error al eliminar servidor' });
    }
});

// Sites
app.get('/api/sites', authenticateToken, async (req, res) => {
    try {
        const db = await readDB();
        const userSites = db.sites.filter(s => s.userId === req.user.id);

        res.json({ sites: userSites });
    } catch (error) {
        console.error('Error fetching sites:', error);
        res.status(500).json({ error: 'Error al obtener sitios' });
    }
});

app.post('/api/sites/deploy', authenticateToken, async (req, res) => {
    try {
        const { serverId, name, domain, wpVersion, installSsl } = req.body;

        const db = await readDB();

        // Verify server exists and belongs to user
        const server = db.servers.find(s => s.id === serverId && s.userId === req.user.id);
        if (!server) {
            return res.status(404).json({ error: 'Servidor no encontrado' });
        }

        const newSite = {
            id: 'site_' + Date.now(),
            userId: req.user.id,
            serverId,
            serverName: server.name,
            name,
            domain,
            wpVersion: wpVersion === 'latest' ? '6.4' : wpVersion,
            ssl: installSsl,
            status: 'deploying',
            diskUsage: 0,
            createdAt: new Date().toISOString()
        };

        db.sites.push(newSite);

        // Update server sites count
        server.sitesCount = (server.sitesCount || 0) + 1;

        await writeDB(db);

        // In production mode, trigger deployment script
        if (!DEMO_MODE) {
            // TODO: Execute deployment script via SSH
            // const WordPressDeployer = require('./lib/wordpress-deployer');
            // await WordPressDeployer.deploy(server, newSite);

            // For now, simulate deployment
            setTimeout(async () => {
                const db = await readDB();
                const site = db.sites.find(s => s.id === newSite.id);
                if (site) {
                    site.status = 'active';
                    site.diskUsage = Math.floor(Math.random() * 2000) + 500;
                    await writeDB(db);
                }
            }, 5000);
        } else {
            // Demo mode - instant deployment
            setTimeout(async () => {
                const db = await readDB();
                const site = db.sites.find(s => s.id === newSite.id);
                if (site) {
                    site.status = 'active';
                    site.diskUsage = Math.floor(Math.random() * 2000) + 500;
                    await writeDB(db);
                }
            }, 3000);
        }

        res.json({ site: newSite });
    } catch (error) {
        console.error('Error deploying site:', error);
        res.status(500).json({ error: 'Error al desplegar sitio' });
    }
});

app.post('/api/sites/clone', authenticateToken, async (req, res) => {
    try {
        const { sourceId, name, domain, serverId } = req.body;

        const db = await readDB();

        // Verify source site
        const sourceSite = db.sites.find(s => s.id === sourceId && s.userId === req.user.id);
        if (!sourceSite) {
            return res.status(404).json({ error: 'Sitio fuente no encontrado' });
        }

        // Verify target server
        const server = db.servers.find(s => s.id === serverId && s.userId === req.user.id);
        if (!server) {
            return res.status(404).json({ error: 'Servidor no encontrado' });
        }

        const clonedSite = {
            id: 'site_' + Date.now(),
            userId: req.user.id,
            serverId,
            serverName: server.name,
            name,
            domain,
            wpVersion: sourceSite.wpVersion,
            ssl: sourceSite.ssl,
            status: 'deploying',
            diskUsage: sourceSite.diskUsage,
            clonedFrom: sourceId,
            createdAt: new Date().toISOString()
        };

        db.sites.push(clonedSite);

        // Update server sites count
        server.sitesCount = (server.sitesCount || 0) + 1;

        await writeDB(db);

        // In production mode, trigger cloning script
        if (!DEMO_MODE) {
            // TODO: Execute cloning script via SSH
            // const SiteCloner = require('./lib/site-cloner');
            // await SiteCloner.clone(sourceSite, clonedSite, server);

            setTimeout(async () => {
                const db = await readDB();
                const site = db.sites.find(s => s.id === clonedSite.id);
                if (site) {
                    site.status = 'active';
                    await writeDB(db);
                }
            }, 5000);
        } else {
            // Demo mode
            setTimeout(async () => {
                const db = await readDB();
                const site = db.sites.find(s => s.id === clonedSite.id);
                if (site) {
                    site.status = 'active';
                    await writeDB(db);
                }
            }, 2000);
        }

        res.json({ site: clonedSite });
    } catch (error) {
        console.error('Error cloning site:', error);
        res.status(500).json({ error: 'Error al clonar sitio' });
    }
});

app.delete('/api/sites/:id', authenticateToken, async (req, res) => {
    try {
        const { id } = req.params;

        const db = await readDB();

        // Check if site belongs to user
        const site = db.sites.find(s => s.id === id && s.userId === req.user.id);
        if (!site) {
            return res.status(404).json({ error: 'Sitio no encontrado' });
        }

        // Update server sites count
        const server = db.servers.find(s => s.id === site.serverId);
        if (server) {
            server.sitesCount = Math.max(0, (server.sitesCount || 0) - 1);
        }

        // Remove site
        db.sites = db.sites.filter(s => s.id !== id);

        await writeDB(db);

        res.json({ message: 'Sitio eliminado' });
    } catch (error) {
        console.error('Error deleting site:', error);
        res.status(500).json({ error: 'Error al eliminar sitio' });
    }
});

// Serve frontend
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Start server
async function start() {
    await initDatabase();

    app.listen(PORT, () => {
        console.log(`
╔════════════════════════════════════════════════════════╗
║                                                        ║
║   ⚡ WordPress Deployer Server                         ║
║                                                        ║
║   Server running on: http://localhost:${PORT}        ║
║   Mode: ${DEMO_MODE ? 'DEMO' : 'PRODUCTION'}                                   ║
║                                                        ║
║   Open http://localhost:${PORT} in your browser        ║
║                                                        ║
╚════════════════════════════════════════════════════════╝
    `);
    });
}

start().catch(console.error);
