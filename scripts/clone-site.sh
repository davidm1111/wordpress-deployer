#!/bin/bash
# WordPress Site Cloning Script
# Clones an existing WordPress site to a new domain

set -e

# Configuration
SOURCE_DOMAIN=$1
TARGET_DOMAIN=$2
TARGET_DB_NAME=$3
TARGET_DB_USER=$4
TARGET_DB_PASS=$5

if [ -z "$SOURCE_DOMAIN" ] || [ -z "$TARGET_DOMAIN" ] || [ -z "$TARGET_DB_NAME" ]; then
    echo "Usage: $0 <source_domain> <target_domain> <target_db_name> <target_db_user> <target_db_pass>"
    exit 1
fi

# Variables
SOURCE_ROOT="/var/www/$SOURCE_DOMAIN"
TARGET_ROOT="/var/www/$TARGET_DOMAIN"
BACKUP_DIR="/tmp/wp-clone-$(date +%s)"
SOURCE_DB_NAME=$(sudo grep "DB_NAME" $SOURCE_ROOT/wp-config.php | cut -d "'" -f 4)

echo "========================================="
echo "WordPress Site Cloning Script"
echo "========================================="
echo "Source: $SOURCE_DOMAIN (DB: $SOURCE_DB_NAME)"
echo "Target: $TARGET_DOMAIN (DB: $TARGET_DB_NAME)"
echo "========================================="

# Create backup directory
echo "[1/6] Creating temporary directory..."
mkdir -p $BACKUP_DIR

# Copy WordPress files
echo "[2/6] Copying WordPress files..."
sudo cp -r $SOURCE_ROOT $TARGET_ROOT
sudo chown -R www-data:www-data $TARGET_ROOT

# Export source database
echo "[3/6] Exporting source database..."
sudo mysqldump $SOURCE_DB_NAME > $BACKUP_DIR/source.sql

# Create target database
echo "[4/6] Creating target database..."
sudo mysql -e "CREATE DATABASE IF NOT EXISTS $TARGET_DB_NAME CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"
sudo mysql -e "CREATE USER IF NOT EXISTS '$TARGET_DB_USER'@'localhost' IDENTIFIED BY '$TARGET_DB_PASS';"
sudo mysql -e "GRANT ALL PRIVILEGES ON $TARGET_DB_NAME.* TO '$TARGET_DB_USER'@'localhost';"
sudo mysql -e "FLUSH PRIVILEGES;"

# Import to target database and update URLs
echo "[5/6] Importing database and updating URLs..."
sudo mysql $TARGET_DB_NAME < $BACKUP_DIR/source.sql

# Update URLs in database using wp-cli or SQL
sudo mysql $TARGET_DB_NAME -e "UPDATE wp_options SET option_value = replace(option_value, '$SOURCE_DOMAIN', '$TARGET_DOMAIN') WHERE option_name = 'home' OR option_name = 'siteurl';"
sudo mysql $TARGET_DB_NAME -e "UPDATE wp_posts SET guid = replace(guid, '$SOURCE_DOMAIN','$TARGET_DOMAIN');"
sudo mysql $TARGET_DB_NAME -e "UPDATE wp_posts SET post_content = replace(post_content, '$SOURCE_DOMAIN', '$TARGET_DOMAIN');"
sudo mysql $TARGET_DB_NAME -e "UPDATE wp_postmeta SET meta_value = replace(meta_value,'$SOURCE_DOMAIN','$TARGET_DOMAIN');"

# Update wp-config.php
echo "[6/6] Updating wp-config.php..."
sudo sed -i "s/$SOURCE_DB_NAME/$TARGET_DB_NAME/" $TARGET_ROOT/wp-config.php
sudo sed -i "s/username_here/$TARGET_DB_USER/" $TARGET_ROOT/wp-config.php
sudo sed -i "s/password_here/$TARGET_DB_PASS/" $TARGET_ROOT/wp-config.php

# Set proper permissions
sudo chown -R www-data:www-data $TARGET_ROOT
sudo find $TARGET_ROOT -type d -exec chmod 755 {} \;
sudo find $TARGET_ROOT -type f -exec chmod 644 {} \;

# Cleanup
echo "Cleaning up..."
rm -rf $BACKUP_DIR

echo ""
echo "========================================="
echo "Site cloned successfully!"
echo "Source: $SOURCE_DOMAIN"
echo "Target: $TARGET_DOMAIN"
echo "Don't forget to configure NGINX for the new domain!"
echo "========================================="
