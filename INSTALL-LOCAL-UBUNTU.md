# Instalación Local en Ubuntu (Desktop o WSL)

## ✅ Requisitos
- Ubuntu 20.04 o superior (Desktop, Server, o WSL)
- Conexión a internet

## 🚀 Instalación Rápida (5 minutos)

### Paso 1: Instalar Node.js

```bash
# Actualizar sistema
sudo apt update

# Instalar Node.js 20.x (LTS)
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs

# Verificar instalación
node --version
npm --version
```

### Paso 2: Instalar Git (si no está instalado)

```bash
sudo apt install git -y
```

### Paso 3: Clonar o Copiar el Proyecto

**Opción A: Si ya tienes los archivos en Windows**

Si estás usando WSL (Windows Subsystem for Linux):
```bash
# Los archivos de Windows están en /mnt/c/
cd ~
cp -r /mnt/c/Users/David/Downloads/wordpress-deployer .
cd wordpress-deployer
```

**Opción B: Clonar desde GitHub**

```bash
cd ~
git clone https://github.com/TU-USUARIO/wordpress-deployer.git
cd wordpress-deployer
```

**Opción C: Crear directorio manualmente**

```bash
# Navega a donde quieras tener la app
cd ~
mkdir wordpress-deployer
cd wordpress-deployer

# Luego copia los archivos manualmente
```

### Paso 4: Instalar Dependencias

```bash
npm install
```

Esto instalará:
- express
- bcryptjs
- jsonwebtoken
- ssh2
- dotenv
- body-parser
- cors

### Paso 5: Configurar Variables de Entorno

```bash
# Copiar archivo de ejemplo
cp .env.example .env

# Opcional: editar configuración
nano .env
```

El archivo `.env` ya viene configurado con:
```env
PORT=3000
NODE_ENV=development
JWT_SECRET=wordpress-deployer-secret-key-2024
DB_PATH=./data/database.json
DEMO_MODE=true
```

**Nota:** `DEMO_MODE=true` es perfecto para empezar (sin servidores reales).

### Paso 6: Iniciar la Aplicación

```bash
npm start
```

Verás este mensaje:
```
╔════════════════════════════════════════════════════════╗
║   ⚡ WordPress Deployer Server                         ║
║   Server running on: http://localhost:3000            ║
║   Mode: DEMO                                          ║
╚════════════════════════════════════════════════════════╝
```

### Paso 7: Abrir en el Navegador

Ubuntu Desktop:
```bash
# Abrir navegador automáticamente
xdg-open http://localhost:3000
```

O manualmente:
1. Abre Firefox/Chrome
2. Ve a: **http://localhost:3000**

WSL (Windows):
- Abre tu navegador en Windows
- Ve a: **http://localhost:3000**

## 🎮 Uso Básico

1. **Landing Page** → Click en "Comenzar Gratis"
2. **Registrarse** → Crea una cuenta
3. **Dashboard** → Explora la interfaz
4. **Añadir Servidor** → Datos de prueba (modo demo)
5. **Desplegar WordPress** → Simulación

## 🛠️ Comandos Útiles

```bash
# Iniciar la app
npm start

# Detener la app
# Presiona Ctrl+C en la terminal

# Ver logs mientras corre
# Los ves directamente en la terminal

# Limpiar y reinstalar dependencias
rm -rf node_modules
npm install

# Ver archivos del proyecto
ls -la
```

## 📁 Ubicación de Archivos

```bash
# Tu proyecto está en:
~/wordpress-deployer/

# Base de datos (JSON en modo demo):
~/wordpress-deployer/data/database.json

# Ver estructura
tree -L 2
# o
ls -la
```

## 🔧 Solución de Problemas

### Error: "Cannot find module"
```bash
npm install
```

### Error: "Port 3000 already in use"
```bash
# Cambiar puerto en .env
nano .env
# Cambia: PORT=3001

# O matar el proceso en el puerto 3000
sudo lsof -i :3000
# Luego:
kill -9 [PID]
```

### Error: "npm: command not found"
```bash
# Reintentar instalación de Node.js
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs
```

### Permisos de escritura
```bash
# Si tienes problemas de permisos
sudo chown -R $USER:$USER ~/wordpress-deployer
chmod -R 755 ~/wordpress-deployer
```

## 🚀 Modo Desarrollo con Auto-Restart

Para desarrollo activo, instala `nodemon`:

```bash
# Instalar nodemon globalmente
sudo npm install -g nodemon

# Iniciar con nodemon (reinicia automáticamente al hacer cambios)
nodemon server.js
```

## 📊 Verificar que Todo Funciona

```bash
# 1. Verificar que el servidor está corriendo
curl http://localhost:3000

# Deberías ver el HTML de la landing page

# 2. Verificar que se creó la base de datos
ls -la data/
# Verás database.json después de registrarte

# 3. Ver logs en tiempo real
# Ya los ves en la terminal donde ejecutaste npm start
```

## 🌐 Acceder desde Otros Dispositivos en tu Red Local

Si quieres acceder desde tu teléfono o tablet:

```bash
# Ver tu IP local
hostname -I
# Ejemplo: 192.168.1.100

# Abrir puerto en firewall (si está activo)
sudo ufw allow 3000/tcp
```

Luego desde otro dispositivo en la misma red:
- `http://192.168.1.100:3000`

## 📝 Siguiente Paso: Modo Producción

Cuando quieras probar con servidores WordPress reales:

1. Cambia en `.env`:
   ```env
   DEMO_MODE=false
   ```

2. Necesitarás:
   - Un VPS (DigitalOcean, Linode, etc.)
   - Acceso SSH con clave privada
   - Un dominio apuntando al VPS

3. La app desplegará WordPress **real** en tus servidores

## 🎯 Script de Instalación Automática

También puedes usar el script automático:

```bash
# Descargar y ejecutar
cd ~
# Si tienes el archivo deploy.sh:
bash wordpress-deployer/deploy.sh
```

---

## 📚 Resumen de Comandos Completos

```bash
# Instalación completa
sudo apt update
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs git
cd ~
cp -r /mnt/c/Users/David/Downloads/wordpress-deployer .
cd wordpress-deployer
npm install
npm start
```

En **menos de 5 minutos** tendrás la app corriendo en `http://localhost:3000` 🚀

---

**¿Tienes Ubuntu instalado ahora mismo? Te puedo guiar paso a paso en tiempo real.**
