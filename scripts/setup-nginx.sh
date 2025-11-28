#!/bin/bash
# NGINX Configuration Script for WordPress
# Configures NGINX server block with SSL support

set -e

# Configuration
DOMAIN=$1
INSTALL_SSL=${2:-"false"}

if [ -z "$DOMAIN" ]; then
    echo "Usage: $0 <domain> [install_ssl]"
    exit 1
fi

# Variables
WEB_ROOT="/var/www/$DOMAIN"
NGINX_CONF="/etc/nginx/sites-available/$DOMAIN"
NGINX_ENABLED="/etc/nginx/sites-enabled/$DOMAIN"

echo "========================================="
echo "NGINX Configuration Script"
echo "========================================="
echo "Domain: $DOMAIN"
echo "SSL: $INSTALL_SSL"
echo "========================================="

# Create NGINX configuration
echo "[1/4] Creating NGINX configuration..."
cat <<EOF | sudo tee $NGINX_CONF > /dev/null
server {
    listen 80;
    server_name $DOMAIN www.$DOMAIN;
    root $WEB_ROOT;
    index index.php index.html;

    access_log /var/log/nginx/${DOMAIN}-access.log;
    error_log /var/log/nginx/${DOMAIN}-error.log;

    # WordPress permalinks
    location / {
        try_files \$uri \$uri/ /index.php?\$args;
    }

    # PHP processing
    location ~ \.php$ {
        include snippets/fastcgi-php.conf;
        fastcgi_pass unix:/var/run/php/php-fpm.sock;
        fastcgi_param SCRIPT_FILENAME \$document_root\$fastcgi_script_name;
        include fastcgi_params;
    }

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;

    # Deny access to hidden files
    location ~ /\. {
        deny all;
    }

    # Deny access to wp-config.php
    location ~* wp-config.php {
        deny all;
    }

    # Cache static files
    location ~* \.(jpg|jpeg|png|gif|ico|css|js|svg|woff|woff2|ttf|eot)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
EOF

# Enable site
echo "[2/4] Enabling site..."
sudo ln -sf $NGINX_CONF $NGINX_ENABLED

# Test NGINX configuration
echo "[3/4] Testing NGINX configuration..."
sudo nginx -t

# Reload NGINX
echo "[4/4] Reloading NGINX..."
sudo systemctl reload nginx

# Install SSL if requested
if [ "$INSTALL_SSL" == "true" ]; then
    echo ""
    echo "========================================="
    echo "Installing SSL Certificate"
    echo "========================================="
    
    # Install certbot if not present
    if ! command -v certbot &> /dev/null; then
        echo "Installing Certbot..."
        sudo apt-get update -qq
        sudo apt-get install -y certbot python3-certbot-nginx > /dev/null 2>&1
    fi
    
    # Obtain SSL certificate
    echo "Obtaining SSL certificate..."
    sudo certbot --nginx -d $DOMAIN -d www.$DOMAIN --non-interactive --agree-tos --register-unsafely-without-email --redirect
    
    echo "SSL certificate installed successfully!"
fi

echo ""
echo "========================================="
echo "NGINX configured successfully!"
echo "Site available at: http://$DOMAIN"
if [ "$INSTALL_SSL" == "true" ]; then
    echo "HTTPS enabled: https://$DOMAIN"
fi
echo "========================================="
