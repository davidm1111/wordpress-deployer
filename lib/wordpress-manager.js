// WordPress Management Module
const { Client } = require('ssh2');
const path = require('path');

class WordPressManager {
    constructor(serverConfig) {
        this.server = serverConfig;
        this.conn = new Client();
    }

    async connect() {
        return new Promise((resolve, reject) => {
            this.conn.on('ready', () => resolve())
                .on('error', (err) => reject(err))
                .connect({
                    host: this.server.ip,
                    port: this.server.port || 22,
                    username: this.server.user,
                    privateKey: this.server.sshKey
                });
        });
    }

    async executeCommand(command, sudo = false) {
        return new Promise((resolve, reject) => {
            const cmd = sudo ? `sudo ${command}` : command;

            this.conn.exec(cmd, (err, stream) => {
                if (err) return reject(err);

                let output = '';
                let errorOutput = '';

                stream.on('close', (code) => {
                    if (code === 0) {
                        resolve(output);
                    } else {
                        reject(new Error(errorOutput || `Command failed with code ${code}`));
                    }
                }).on('data', (data) => {
                    output += data.toString();
                }).stderr.on('data', (data) => {
                    errorOutput += data.toString();
                });
            });
        });
    }

    async updateWordPress(domain) {
        try {
            const wpPath = `/var/www/${domain}`;

            // Download latest WordPress
            const commands = [
                `cd ${wpPath}`,
                'wp core update --allow-root || curl -O https://wordpress.org/latest.tar.gz && tar -xzf latest.tar.gz --strip-components=1 && rm latest.tar.gz'
            ];

            for (const cmd of commands) {
                await this.executeCommand(cmd, true);
            }

            return { success: true, message: 'WordPress updated successfully' };
        } catch (error) {
            return { success: false, error: error.message };
        }
    }

    async installPlugin(domain, pluginSlug) {
        try {
            const wpPath = `/var/www/${domain}`;
            await this.executeCommand(`cd ${wpPath} && wp plugin install ${pluginSlug} --activate --allow-root`, true);
            return { success: true, message: `Plugin ${pluginSlug} installed` };
        } catch (error) {
            return { success: false, error: error.message };
        }
    }

    async listPlugins(domain) {
        try {
            const wpPath = `/var/www/${domain}`;
            const output = await this.executeCommand(`cd ${wpPath} && wp plugin list --format=json --allow-root`, true);
            return JSON.parse(output);
        } catch (error) {
            return [];
        }
    }

    async createBackup(domain) {
        try {
            const wpPath = `/var/www/${domain}`;
            const backupDir = `/var/backups/wordpress/${domain}`;
            const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
            const backupName = `backup-${timestamp}`;

            // Create backup directory
            await this.executeCommand(`mkdir -p ${backupDir}`, true);

            // Backup files
            await this.executeCommand(`tar -czf ${backupDir}/${backupName}-files.tar.gz -C ${wpPath} .`, true);

            // Backup database
            const dbName = await this.getDBName(domain);
            if (dbName) {
                await this.executeCommand(`mysqldump ${dbName} | gzip > ${backupDir}/${backupName}-db.sql.gz`, true);
            }

            return {
                success: true,
                backup: {
                    name: backupName,
                    files: `${backupDir}/${backupName}-files.tar.gz`,
                    database: `${backupDir}/${backupName}-db.sql.gz`,
                    timestamp: new Date().toISOString()
                }
            };
        } catch (error) {
            return { success: false, error: error.message };
        }
    }

    async getDBName(domain) {
        try {
            const wpPath = `/var/www/${domain}`;
            const output = await this.executeCommand(`grep "DB_NAME" ${wpPath}/wp-config.php | cut -d "'" -f 4`, true);
            return output.trim();
        } catch (error) {
            return null;
        }
    }

    async getSiteInfo(domain) {
        try {
            const wpPath = `/var/www/${domain}`;

            // Get WordPress version
            let wpVersion = 'Unknown';
            try {
                wpVersion = await this.executeCommand(`cd ${wpPath} && wp core version --allow-root 2>/dev/null`, true);
                wpVersion = wpVersion.trim();
            } catch (e) { }

            // Get site URL
            let siteUrl = `http://${domain}`;
            try {
                siteUrl = await this.executeCommand(`cd ${wpPath} && wp option get siteurl --allow-root 2>/dev/null`, true);
                siteUrl = siteUrl.trim();
            } catch (e) { }

            // Get disk usage
            let diskUsage = 0;
            try {
                const duOutput = await this.executeCommand(`du -sb ${wpPath} | cut -f1`, true);
                diskUsage = parseInt(duOutput.trim());
            } catch (e) { }

            // Get DB size
            let dbSize = 0;
            try {
                const dbName = await this.getDBName(domain);
                if (dbName) {
                    const dbSizeOutput = await this.executeCommand(
                        `mysql -e "SELECT SUM(data_length + index_length) FROM information_schema.TABLES WHERE table_schema = '${dbName}';" | tail -1`,
                        true
                    );
                    dbSize = parseInt(dbSizeOutput.trim() || 0);
                }
            } catch (e) { }

            return {
                version: wpVersion,
                url: siteUrl,
                diskUsage,
                dbSize,
                totalSize: diskUsage + dbSize
            };
        } catch (error) {
            return null;
        }
    }

    async optimizeDatabase(domain) {
        try {
            const dbName = await this.getDBName(domain);
            if (!dbName) {
                throw new Error('Could not determine database name');
            }

            // Optimize all tables
            await this.executeCommand(`mysqlcheck -o ${dbName}`, true);

            return { success: true, message: 'Database optimized' };
        } catch (error) {
            return { success: false, error: error.message };
        }
    }

    async enableSSL(domain) {
        try {
            // Install SSL certificate with Certbot
            const command = `certbot --nginx -d ${domain} -d www.${domain} --non-interactive --agree-tos --register-unsafely-without-email --redirect`;
            await this.executeCommand(command, true);

            return { success: true, message: 'SSL enabled successfully' };
        } catch (error) {
            return { success: false, error: error.message };
        }
    }

    disconnect() {
        this.conn.end();
    }
}

module.exports = WordPressManager;
