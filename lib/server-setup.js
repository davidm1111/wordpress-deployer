// Server Setup and Auto-Configuration Module
const { Client } = require('ssh2');

class ServerSetup {
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

    async checkRequirements() {
        const checks = {
            nginx: false,
            php: false,
            mysql: false,
            certbot: false,
            os: null,
            disk: null,
            ram: null
        };

        try {
            // Check NGINX
            try {
                await this.executeCommand('which nginx');
                checks.nginx = true;
            } catch (e) { }

            // Check PHP
            try {
                const phpVersion = await this.executeCommand('php --version');
                checks.php = phpVersion.includes('PHP') ? phpVersion.split('\n')[0] : false;
            } catch (e) { }

            // Check MySQL
            try {
                await this.executeCommand('which mysql');
                checks.mysql = true;
            } catch (e) { }

            // Check Certbot
            try {
                await this.executeCommand('which certbot');
                checks.certbot = true;
            } catch (e) { }

            // Get OS info
            try {
                checks.os = await this.executeCommand('cat /etc/os-release | grep PRETTY_NAME');
            } catch (e) { }

            // Get disk space
            try {
                checks.disk = await this.executeCommand('df -h / | tail -1');
            } catch (e) { }

            // Get RAM
            try {
                checks.ram = await this.executeCommand('free -h | grep Mem');
            } catch (e) { }

            return checks;
        } catch (error) {
            throw new Error(`Failed to check requirements: ${error.message}`);
        }
    }

    async autoInstallRequirements(onProgress) {
        const steps = [
            {
                name: 'Updating system packages',
                command: 'DEBIAN_FRONTEND=noninteractive apt-get update -qq'
            },
            {
                name: 'Installing NGINX',
                command: 'DEBIAN_FRONTEND=noninteractive apt-get install -y nginx'
            },
            {
                name: 'Installing PHP and extensions',
                command: 'DEBIAN_FRONTEND=noninteractive apt-get install -y php-fpm php-mysql php-curl php-gd php-mbstring php-xml php-xmlrpc php-soap php-intl php-zip'
            },
            {
                name: 'Installing MySQL',
                command: 'DEBIAN_FRONTEND=noninteractive apt-get install -y mysql-server'
            },
            {
                name: 'Installing Certbot',
                command: 'DEBIAN_FRONTEND=noninteractive apt-get install -y certbot python3-certbot-nginx'
            },
            {
                name: 'Starting NGINX',
                command: 'systemctl start nginx && systemctl enable nginx'
            },
            {
                name: 'Starting MySQL',
                command: 'systemctl start mysql && systemctl enable mysql'
            },
            {
                name: 'Creating web directory',
                command: 'mkdir -p /var/www && chown -R www-data:www-data /var/www'
            },
            {
                name: 'Configuring firewall',
                command: 'ufw allow 80/tcp && ufw allow 443/tcp && ufw --force enable'
            }
        ];

        const results = [];

        for (let i = 0; i < steps.length; i++) {
            const step = steps[i];

            if (onProgress) {
                onProgress({
                    step: i + 1,
                    total: steps.length,
                    message: step.name,
                    percentage: Math.round(((i + 1) / steps.length) * 100)
                });
            }

            try {
                const output = await this.executeCommand(step.command, true);
                results.push({
                    step: step.name,
                    success: true,
                    output: output.substring(0, 200) // Limit output
                });
            } catch (error) {
                results.push({
                    step: step.name,
                    success: false,
                    error: error.message
                });
            }
        }

        return results;
    }

    async getServerStats() {
        try {
            const stats = {};

            // CPU Usage
            stats.cpu = await this.executeCommand("top -bn1 | grep 'Cpu(s)' | awk '{print $2}' | cut -d'%' -f1");

            // Memory Usage
            const memInfo = await this.executeCommand("free | grep Mem | awk '{print $3/$2 * 100.0}'");
            stats.memory = parseFloat(memInfo).toFixed(2);

            // Disk Usage
            const diskInfo = await this.executeCommand("df -h / | tail -1 | awk '{print $5}' | cut -d'%' -f1");
            stats.disk = diskInfo.trim();

            // Uptime
            stats.uptime = await this.executeCommand("uptime -p");

            // Site count
            try {
                const siteCount = await this.executeCommand("ls -1 /var/www/ | wc -l");
                stats.sites = parseInt(siteCount.trim());
            } catch (e) {
                stats.sites = 0;
            }

            return stats;
        } catch (error) {
            throw new Error(`Failed to get server stats: ${error.message}`);
        }
    }

    async testConnection() {
        try {
            await this.connect();
            const result = await this.executeCommand('echo "Connection successful"');
            this.disconnect();
            return result.includes('successful');
        } catch (error) {
            return false;
        }
    }

    disconnect() {
        this.conn.end();
    }
}

module.exports = ServerSetup;
