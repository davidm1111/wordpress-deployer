# Guía de Instalación en Servidor Ubuntu con GitHub

## 📋 Requisitos del Servidor

- Ubuntu 20.04 o superior
- Acceso SSH al servidor
- Permisos sudo
- Puerto 3000 (o el que elijas) abierto en el firewall

## 🔧 Paso 1: Subir el Código a GitHub

### En tu PC Windows (carpeta local):

```bash
# 1. Inicializar repositorio Git
cd C:\Users\David\Downloads\wordpress-deployer
git init

# 2. Agregar todos los archivos
git add .

# 3. Hacer commit inicial
git commit -m "Initial commit: WordPress Deployer Platform"

# 4. Crear repositorio en GitHub
# Ve a https://github.com/new
# Nombre: wordpress-deployer
# Descripción: WordPress deployment platform similar to Ploi.io
# Visibilidad: Private (recomendado) o Public

# 5. Conectar con GitHub y subir
git remote add origin https://github.com/TU-USUARIO/wordpress-deployer.git
git branch -M main
git push -u origin main
```

**Nota**: Reemplaza `TU-USUARIO` con tu nombre de usuario de GitHub.

## 🚀 Paso 2: Conectar al Servidor Ubuntu

Desde tu PC, conecta vía SSH:

```bash
ssh root@TU-SERVIDOR-IP
# o
ssh tu-usuario@TU-SERVIDOR-IP
```

## 📦 Paso 3: Preparar el Servidor Ubuntu

Una vez conectado al servidor Ubuntu, ejecuta estos comandos:

```bash
# Actualizar el sistema
sudo apt update && sudo apt upgrade -y

# Instalar Node.js (versión LTS 20.x)
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs

# Verificar instalación
node --version
npm --version

# Instalar Git (si no está instalado)
sudo apt install git -y

# Instalar PM2 (para mantener la app corriendo)
sudo npm install -g pm2
```

## 📥 Paso 4: Clonar el Repositorio

```bash
# Navegar al directorio de aplicaciones
cd /var/www
# o crear un directorio personalizado
sudo mkdir -p /var/www
cd /var/www

# Clonar el repositorio
# Si es público:
sudo git clone https://github.com/TU-USUARIO/wordpress-deployer.git

# Si es privado (necesitarás autenticarte):
sudo git clone https://github.com/TU-USUARIO/wordpress-deployer.git
# GitHub te pedirá usuario y token personal (no contraseña)

# Entrar al directorio
cd wordpress-deployer

# Dar permisos al usuario actual
sudo chown -R $USER:$USER /var/www/wordpress-deployer
```

### Crear Token de GitHub (solo si es repo privado):
1. Ve a https://github.com/settings/tokens
2. "Generate new token (classic)"
3. Selecciona scope: `repo`
4. Copia el token y úsalo como contraseña al clonar

## ⚙️ Paso 5: Configurar la Aplicación

```bash
# Instalar dependencias
npm install

# Configurar variables de entorno
cp .env.example .env
nano .env
```

### Editar el archivo `.env`:

```env
# Para producción, cambia estos valores
PORT=3000
NODE_ENV=production

# IMPORTANTE: Cambia este secreto por uno único
JWT_SECRET=tu-secreto-super-seguro-aqui-$(openssl rand -hex 32)

# Base de datos
DB_PATH=./data/database.json

# Modo producción (para usar servidores reales)
DEMO_MODE=false
# o deja en true si solo quieres el modo demo
DEMO_MODE=true
```

Guarda con `Ctrl+X`, luego `Y`, luego `Enter`.

## 🚦 Paso 6: Iniciar la Aplicación

### Opción A: Inicio Manual (para pruebas)

```bash
# Iniciar la aplicación
npm start

# La app correrá en http://TU-SERVIDOR-IP:3000
# Presiona Ctrl+C para detener
```

### Opción B: Con PM2 (Recomendado para Producción)

```bash
# Iniciar con PM2
pm2 start server.js --name wordpress-deployer

# Ver logs
pm2 logs wordpress-deployer

# Ver status
pm2 status

# Detener
pm2 stop wordpress-deployer

# Reiniciar
pm2 restart wordpress-deployer

# Configurar PM2 para que inicie al arrancar el servidor
pm2 startup
pm2 save
```

## 🔒 Paso 7: Configurar Firewall (UFW)

```bash
# Permitir SSH (si no está permitido)
sudo ufw allow 22/tcp

# Permitir el puerto de la app
sudo ufw allow 3000/tcp

# Activar firewall
sudo ufw enable

# Ver estado
sudo ufw status
```

## 🌐 Paso 8: Configurar NGINX como Reverse Proxy (Opcional pero Recomendado)

Esto permite acceder a la app en el puerto 80 (HTTP) o 443 (HTTPS) en lugar del 3000:

```bash
# Instalar NGINX
sudo apt install nginx -y

# Crear configuración
sudo nano /etc/nginx/sites-available/wordpress-deployer
```

### Contenido del archivo NGINX:

```nginx
server {
    listen 80;
    server_name tu-dominio.com;  # Cambia por tu dominio o IP

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

```bash
# Activar el sitio
sudo ln -s /etc/nginx/sites-available/wordpress-deployer /etc/nginx/sites-enabled/

# Probar configuración
sudo nginx -t

# Recargar NGINX
sudo systemctl reload nginx

# Permitir HTTP/HTTPS en firewall
sudo ufw allow 'Nginx Full'
```

Ahora puedes acceder a: `http://tu-dominio.com` o `http://TU-SERVIDOR-IP`

## 🔐 Paso 9: Configurar SSL con Let's Encrypt (Opcional)

```bash
# Instalar Certbot
sudo apt install certbot python3-certbot-nginx -y

# Obtener certificado SSL
sudo certbot --nginx -d tu-dominio.com -d www.tu-dominio.com

# Certbot configurará automáticamente NGINX para HTTPS
# Los certificados se renovarán automáticamente
```

## 🔄 Paso 10: Actualizar la Aplicación

Cuando hagas cambios en tu código local y los subas a GitHub:

```bash
# En el servidor Ubuntu
cd /var/www/wordpress-deployer

# Descargar cambios
git pull origin main

# Reinstalar dependencias (si cambiaron)
npm install

# Reiniciar la app
pm2 restart wordpress-deployer
```

## 📊 Comandos Útiles de PM2

```bash
# Ver todas las apps
pm2 list

# Ver logs en tiempo real
pm2 logs wordpress-deployer --lines 100

# Monitorear recursos
pm2 monit

# Reiniciar todas las apps
pm2 restart all

# Detener todas las apps
pm2 stop all

# Eliminar app de PM2
pm2 delete wordpress-deployer
```

## 🐛 Solución de Problemas

### La app no inicia:
```bash
# Ver logs de PM2
pm2 logs wordpress-deployer

# Verificar que Node.js esté instalado
node --version

# Verificar dependencias
cd /var/www/wordpress-deployer
npm install
```

### Puerto 3000 ya está en uso:
```bash
# Ver qué proceso usa el puerto
sudo lsof -i :3000

# Cambiar puerto en .env
nano .env
# Cambia PORT=3000 a PORT=3001
```

### Firewall bloquea la conexión:
```bash
sudo ufw status
sudo ufw allow 3000/tcp
```

### Actualizaciones de seguridad:
```bash
# Actualizar sistema regularmente
sudo apt update && sudo apt upgrade -y

# Actualizar dependencias de Node.js
cd /var/www/wordpress-deployer
npm update
```

## 📝 Estructura Final en el Servidor

```
/var/www/wordpress-deployer/
├── public/
├── scripts/
├── lib/
├── data/
├── server.js
├── package.json
├── .env
└── node_modules/
```

## 🎯 Verificación Final

1. **Comprobar que la app esté corriendo:**
   ```bash
   pm2 status
   curl http://localhost:3000
   ```

2. **Abrir en navegador:**
   - `http://TU-SERVIDOR-IP:3000`
   - o `http://tu-dominio.com` (si configuraste NGINX)

3. **Crear cuenta y probar:**
   - Registrate en la app
   - Añade un servidor
   - Despliega WordPress (modo demo)

## 🚀 Modo Producción (Servidores Reales)

Para usar con servidores WordPress reales:

1. Edita `.env` y pon `DEMO_MODE=false`
2. Reinicia: `pm2 restart wordpress-deployer`
3. Ahora cuando añadas servidores, la app intentará conectarse vía SSH
4. Los scripts en `scripts/` se ejecutarán en los servidores reales

## 📚 Recursos Adicionales

- **PM2 Docs**: https://pm2.keymetrics.io/docs/usage/quick-start/
- **NGINX Docs**: https://nginx.org/en/docs/
- **Let's Encrypt**: https://letsencrypt.org/
- **Node.js**: https://nodejs.org/

---

**¡Listo! Tu aplicación WordPress Deployer está corriendo en producción en Ubuntu! 🎉**
