#!/bin/bash
# WordPress Installation Script for Linux Servers
# This script installs WordPress with NGINX, PHP, and MySQL

set -e

# Configuration
DOMAIN=$1
SITE_NAME=$2
DB_NAME=$3
DB_USER=$4
DB_PASS=$5
WP_VERSION=${6:-"latest"}

if [ -z "$DOMAIN" ] || [ -z "$SITE_NAME" ] || [ -z "$DB_NAME" ]; then
    echo "Usage: $0 <domain> <site_name> <db_name> <db_user> <db_pass> [wp_version]"
    exit 1
fi

# Variables
WEB_ROOT="/var/www/$DOMAIN"
NGINX_CONF="/etc/nginx/sites-available/$DOMAIN"

echo "========================================="
echo "WordPress Installation Script"
echo "========================================="
echo "Domain: $DOMAIN"
echo "Site Name: $SITE_NAME"
echo "Web Root: $WEB_ROOT"
echo "========================================="

# Update system
echo "[1/7] Updating system packages..."
sudo apt-get update -qq

# Install required packages
echo "[2/7] Installing required packages..."
sudo apt-get install -y nginx php-fpm php-mysql php-curl php-gd php-mbstring php-xml php-xmlrpc php-soap php-intl php-zip mysql-server unzip wget > /dev/null 2>&1

# Create web directory
echo "[3/7] Creating web directory..."
sudo mkdir -p $WEB_ROOT
cd $WEB_ROOT

# Download WordPress
echo "[4/7] Downloading WordPress..."
if [ "$WP_VERSION" == "latest" ]; then
    sudo wget -q https://wordpress.org/latest.tar.gz
else
    sudo wget -q https://wordpress.org/wordpress-$WP_VERSION.tar.gz -O latest.tar.gz
fi

sudo tar -xzf latest.tar.gz --strip-components=1
sudo rm latest.tar.gz

# Create MySQL database and user
echo "[5/7] Creating database..."
sudo mysql -e "CREATE DATABASE IF NOT EXISTS $DB_NAME CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"
sudo mysql -e "CREATE USER IF NOT EXISTS '$DB_USER'@'localhost' IDENTIFIED BY '$DB_PASS';"
sudo mysql -e "GRANT ALL PRIVILEGES ON $DB_NAME.* TO '$DB_USER'@'localhost';"
sudo mysql -e "FLUSH PRIVILEGES;"

# Configure WordPress
echo "[6/7] Configuring WordPress..."
sudo cp wp-config-sample.php wp-config.php
sudo sed -i "s/database_name_here/$DB_NAME/" wp-config.php
sudo sed -i "s/username_here/$DB_USER/" wp-config.php
sudo sed -i "s/password_here/$DB_PASS/" wp-config.php

# Generate unique salts
SALT=$(curl -sS https://api.wordpress.org/secret-key/1.1/salt/)
sudo sed -i "/AUTH_KEY/,/NONCE_SALT/d" wp-config.php
echo "$SALT" | sudo tee -a wp-config.php > /dev/null

# Set proper permissions
echo "[7/7] Setting permissions..."
sudo chown -R www-data:www-data $WEB_ROOT
sudo find $WEB_ROOT -type d -exec chmod 755 {} \;
sudo find $WEB_ROOT -type f -exec chmod 644 {} \;

echo "========================================="
echo "WordPress installed successfully!"
echo "Database: $DB_NAME"
echo "User: $DB_USER"
echo "Next: Configure NGINX"
echo "========================================="
