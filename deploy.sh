#!/bin/bash
# Script de instalación rápida para Ubuntu
# Ejecutar con: bash deploy.sh

set -e

echo "========================================="
echo "WordPress Deployer - Instalación Ubuntu"
echo "========================================="

# Colores
GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Verificar si se está ejecutando como root
if [[ $EUID -eq 0 ]]; then
   echo "No ejecutes este script como root/sudo"
   exit 1
fi

# 1. Actualizar sistema
echo -e "${BLUE}[1/7]${NC} Actualizando sistema..."
sudo apt update && sudo apt upgrade -y

# 2. Instalar Node.js
echo -e "${BLUE}[2/7]${NC} Instalando Node.js..."
if ! command -v node &> /dev/null; then
    curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
    sudo apt-get install -y nodejs
fi

# Verificar Node.js
NODE_VERSION=$(node --version)
echo -e "${GREEN}✓${NC} Node.js instalado: $NODE_VERSION"

# 3. Instalar Git
echo -e "${BLUE}[3/7]${NC} Instalando Git..."
sudo apt install git -y

# 4. Instalar PM2
echo -e "${BLUE}[4/7]${NC} Instalando PM2..."
sudo npm install -g pm2

# 5. Crear directorio y clonar (si no existe)
echo -e "${BLUE}[5/7]${NC} Configurando aplicación..."
APP_DIR="/var/www/wordpress-deployer"

if [ ! -d "$APP_DIR" ]; then
    sudo mkdir -p /var/www
    cd /var/www
    
    echo "Introduce la URL de tu repositorio GitHub:"
    read REPO_URL
    
    sudo git clone $REPO_URL wordpress-deployer
    sudo chown -R $USER:$USER $APP_DIR
else
    echo "El directorio ya existe, actualizando..."
    cd $APP_DIR
    git pull origin main
fi

cd $APP_DIR

# 6. Instalar dependencias
echo -e "${BLUE}[6/7]${NC} Instalando dependencias..."
npm install

# 7. Configurar .env
if [ ! -f .env ]; then
    echo -e "${BLUE}[7/7]${NC} Configurando variables de entorno..."
    cp .env.example .env
    
    # Generar JWT secret aleatorio
    JWT_SECRET=$(openssl rand -hex 32)
    sed -i "s/your-super-secret-jwt-key-change-this-in-production/$JWT_SECRET/" .env
    
    echo "¿Quieres usar modo DEMO (sin servidores reales)? [Y/n]"
    read -r DEMO_CHOICE
    if [[ $DEMO_CHOICE =~ ^[Nn]$ ]]; then
        sed -i "s/DEMO_MODE=true/DEMO_MODE=false/" .env
    fi
else
    echo "Archivo .env ya existe, omitiendo..."
fi

# Iniciar con PM2
echo ""
echo "========================================="
echo "Iniciando aplicación con PM2..."
pm2 stop wordpress-deployer 2>/dev/null || true
pm2 delete wordpress-deployer 2>/dev/null || true
pm2 start server.js --name wordpress-deployer
pm2 save

echo ""
echo -e "${GREEN}========================================="
echo "✓ Instalación completada!"
echo "=========================================${NC}"
echo ""
echo "La aplicación está corriendo en:"
echo "  http://localhost:3000"
echo "  http://$(hostname -I | awk '{print $1}'):3000"
echo ""
echo "Comandos útiles:"
echo "  pm2 logs wordpress-deployer  - Ver logs"
echo "  pm2 status                   - Ver estado"
echo "  pm2 restart wordpress-deployer - Reiniciar"
echo ""
echo "Para configurar NGINX y SSL, consulta: DEPLOY-UBUNTU.md"
echo ""
