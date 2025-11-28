# WordPress Deployer

Una aplicación web moderna similar a [Ploi.io](https://ploi.io) para desplegar y gestionar sitios WordPress en servidores Linux de forma rápida y sencilla.

![Version](https://img.shields.io/badge/version-1.0.0-blue.svg)
![License](https://img.shields.io/badge/license-MIT-green.svg)

## ✨ Características

- 🚀 **Despliegue Rápido**: Despliega WordPress en menos de 5 minutos
- 📦 **Clonación de Sitios**: Clona sitios completos con un clic
- 🔒 **SSL Automático**: Certificados SSL gratuitos con Let's Encrypt
- ⚙️ **Gestión de Servidores**: Gestiona múltiples servidores desde un panel
- 🎨 **Interfaz Moderna**: UI oscura con glassmorphism y animaciones suaves
- 🔄 **Modo Demo**: Prueba la aplicación sin servidores reales

## 📋 Requisitos Previos

### Para Desarrollo (Modo Demo)
- Node.js 16+ y npm
- Navegador web moderno

### Para Producción (con Servidores Reales)
- Node.js 16+ y npm
- Servidor(es) Linux (Ubuntu 20.04+, Debian, CentOS)
- Acceso SSH con clave privada
- Permisos sudo en el servidor

## 🚀 Instalación

### 1. Clonar el Repositorio
```bash
cd Downloads
# Los archivos ya están en wordpress-deployer/
cd wordpress-deployer
```

### 2. Instalar Dependencias
```bash
npm install
```

### 3. Configurar Variables de Entorno
```bash
cp .env.example .env
# Editar .env si es necesario
```

### 4. Iniciar el Servidor
```bash
npm start
```

La aplicación estará disponible en `http://localhost:3000`

## 🎯 Uso

### Modo Demo (Por Defecto)

El modo demo está habilitado por defecto (`DEMO_MODE=true` en `.env`). Este modo:
- Simula conexiones a servidores
- Permite probar toda la interfaz
- No requiere servidores Linux reales
- Usa almacenamiento local con JSON

#### Primeros Pasos:
1. Abre `http://localhost:3000`
2. Crea una cuenta o inicia sesión
3. Añade un servidor (datos simulados)
4. Despliega WordPress (simulado)
5. Clona sitios existentes

### Modo Producción

Para usar con servidores reales:

1. Cambiar a modo producción en `.env`:
```env
DEMO_MODE=false
```

2. Preparar tu servidor Linux:
```bash
# Conectarse al servidor vía SSH
ssh root@tu-servidor-ip

# El script instalará automáticamente:
# - NGINX
# - PHP 8.x y extensiones
# - MySQL/MariaDB
# - Certbot para SSL
```

3. En la aplicación:
   - Ve a "Añadir Servidor"
   - Ingresa IP, usuario (root), puerto (22)
   - Pega tu clave SSH privada
   - La app verificará la conexión

4. Despliega WordPress:
   - Clic en "Desplegar WordPress"
   - Elige servidor y dominio
   - La app ejecutará los scripts automáticamente
   - WordPress estará listo en minutos

## 📁 Estructura del Proyecto

```
wordpress-deployer/
├── public/              # Frontend
│   ├── css/
│   │   └── styles.css  # Sistema de diseño
│   ├── js/
│   │   └── app.js      # Lógica de aplicación
│   ├── index.html      # Landing page
│   ├── login.html      # Autenticación
│   └── dashboard.html  # Panel principal
├── lib/                 # Librerías backend (futuro)
├── scripts/             # Scripts de deployment Linux
│   ├── install-wordpress.sh
│   ├── setup-nginx.sh
│   └── clone-site.sh
├── data/                # Base de datos JSON (demo)
├── server.js            # Servidor Express
├── package.json
└── .env                # Configuración
```

## 🔧 Scripts de Deployment

Los scripts en `scripts/` se ejecutan automáticamente en los servidores:

### install-wordpress.sh
```bash
# Instala WordPress, PHP, MySQL, NGINX
./scripts/install-wordpress.sh ejemplo.com "Mi Sitio" db_name db_user db_pass
```

### setup-nginx.sh
```bash
# Configura NGINX y SSL
./scripts/setup-nginx.sh ejemplo.com true  # true para SSL
```

### clone-site.sh
```bash
# Clona un sitio existente
./scripts/clone-site.sh origen.com destino.com new_db new_user new_pass
```

## 🎨 Características de UI

- **Tema Oscuro**: Paleta de colores moderna
- **Glassmorphism**: Efectos de cristal esmerilado
- **Animaciones**: Transiciones suaves y micro-interacciones
- **Responsive**: Funciona en móvil, tablet y desktop
- **Tipografía**: Google Fonts (Inter)

## 🔐 Seguridad

- Autenticación JWT
- Contraseñas hasheadas con bcrypt
- Validación de entrada en backend
- Headers de seguridad en NGINX
- SSL/TLS automático

## 📝 API Endpoints

### Autenticación
- `POST /api/auth/register` - Registrar usuario
- `POST /api/auth/login` - Iniciar sesión

### Servidores
- `GET /api/servers` - Listar servidores
- `POST /api/servers` - Añadir servidor
- `DELETE /api/servers/:id` - Eliminar servidor

### Sitios
- `GET /api/sites` - Listar sitios
- `POST /api/sites/deploy` - Desplegar WordPress
- `POST /api/sites/clone` - Clonar sitio
- `DELETE /api/sites/:id` - Eliminar sitio

## 🛠️ Tecnologías Utilizadas

### Frontend
- HTML5, CSS3, JavaScript (Vanilla)
- Google Fonts (Inter)
- Diseño responsive

### Backend
- Node.js + Express
- bcryptjs (hash de contraseñas)
- jsonwebtoken (autenticación)
- ssh2 (conexiones SSH)

### Deployment
- Bash scripts
- NGINX
- PHP 8+
- MySQL/MariaDB
- Let's Encrypt/Certbot

## 🚧 Roadmap

- [ ] WebSocket para status en tiempo real
- [ ] Backups automáticos programados
- [ ] Gestión de bases de datos
- [ ] Múltiples PHP versions
- [ ] Monitoreo de recursos (CPU, RAM)
- [ ] Logs en tiempo real
- [ ] Integración con proveedores cloud (DigitalOcean, AWS, etc.)

## 📄 Licencia

MIT License - Ver LICENSE para más detalles

## 🤝 Contribuciones

Las contribuciones son bienvenidas. Por favor:
1. Fork el proyecto
2. Crea una rama para tu feature
3. Commit tus cambios
4. Push a la rama
5. Abre un Pull Request

## 📧 Soporte

Para problemas o preguntas, abre un issue en el repositorio.

## 🙏 Agradecimientos

Inspirado por [Ploi.io](https://ploi.io) y otras herramientas de gestión de servidores.

---

Hecho con ❤️ para la comunidad WordPress
