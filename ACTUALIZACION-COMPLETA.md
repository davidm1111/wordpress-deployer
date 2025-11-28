# 🚀 Actualización Completa - WordPress Deployer

## Paso 1: Subir a GitHub (Desde Windows)

Abre **PowerShell** en `C:\Users\David\Downloads\wordpress-deployer` y ejecuta:

```powershell
# Inicializar Git (si no lo has hecho)
git init

# Añadir todos los archivos
git add .

# Hacer commit
git commit -m "WordPress Deployer v2.0 - Automatización completa"

# Si NO has creado el repositorio en GitHub aún:
# 1. Ve a https://github.com/new
# 2. Nombre: wordpress-deployer
# 3. Privado o Público (tú decides)
# 4. NO añadas README, .gitignore ni licencia
# 5. Crea el repositorio

# Conectar con GitHub (reemplaza TU-USUARIO)
git remote add origin https://github.com/TU-USUARIO/wordpress-deployer.git

# O si ya existe, actualiza:
git remote set-url origin https://github.com/TU-USUARIO/wordpress-deployer.git

# Subir todo
git branch -M main
git push -u origin main --force
```

**Si te pide autenticación:**
- Usuario: Tu usuario de GitHub
- Contraseña: Personal Access Token (no tu contraseña)
  - Crear token: https://github.com/settings/tokens
  - Scope necesario: `repo`

---

## Paso 2: Actualizar en Servidor Ubuntu

**Conéctate al servidor:**
```bash
ssh david@192.168.10.102
```

**Ejecuta TODO esto:**

```bash
# Ir al directorio
cd ~/wordpress-deployer

# Hacer backup por si acaso
cp -r ~/wordpress-deployer ~/wordpress-deployer-backup-$(date +%Y%m%d)

# Descargar última versión desde GitHub
git pull origin main

# Si Git no está configurado, primero clona:
# cd ~
# rm -rf wordpress-deployer  # Solo si quieres empezar limpio
# git clone https://github.com/TU-USUARIO/wordpress-deployer.git
# cd wordpress-deployer

# Instalar/Actualizar dependencias de Node.js
npm install

# Reiniciar la aplicación
pm2 restart wordpress-deployer

# Ver logs para verificar
pm2 logs wordpress-deployer --lines 20

# Ver estado
pm2 status
```

---

## Paso 3: Verificar que Funciona

### En el servidor Ubuntu:
```bash
# Ver que el servidor está corriendo
pm2 status

# Debería mostrar:
# wordpress-deployer │ online │ 0 restarts

# Probar desde el servidor
curl http://localhost:8066

# Debería responder con HTML
```

### Desde tu navegador:
```
http://192.168.10.102:8066
```

Deberías ver:
✅ La aplicación WordPress Deployer
✅ Nuevo panel con acciones rápidas
✅ Dashboard mejorado

---

## 🎯 Comando Todo-en-Uno (Copia y Pega)

### En Windows PowerShell:
```powershell
cd C:\Users\David\Downloads\wordpress-deployer
git add .
git commit -m "WordPress Deployer v2.0 - Full automation"
git push origin main
```

### En Ubuntu (SSH):
```bash
cd ~/wordpress-deployer && \
git pull origin main && \
npm install && \
pm2 restart wordpress-deployer && \
echo "" && \
echo "✅ Actualización completada!" && \
echo "📍 Accede a: http://192.168.10.102:8066" && \
pm2 logs wordpress-deployer --lines 10
```

---

## ⚠️ Si Hay Errores

### Error: "Git no reconocido" en Windows
```powershell
# Instalar Git desde:
# https://git-scm.com/download/win
```

### Error: "Repository not found" en GitHub
```bash
# Asegúrate de crear el repositorio primero en:
# https://github.com/new
```

### Error: "npm install" falla
```bash
# Reinstalar dependencias
cd ~/wordpress-deployer
rm -rf node_modules package-lock.json
npm install
```

### Error: PM2 no inicia
```bash
# Ver logs de error
pm2 logs wordpress-deployer

# Reiniciar desde cero
pm2 delete wordpress-deployer
pm2 start server.js --name wordpress-deployer
pm2 save
```

---

## ✅ Verificación Final

Después de actualizar, verifica:

1. **Dashboard carga**: `http://192.168.10.102:8066`
2. **Login funciona**: Crea cuenta o inicia sesión
3. **Botones aparecen**: "Optimizar Todo", "Backup Todo", etc.
4. **Servidores se añaden**: Prueba añadir un servidor
5. **WordPress se despliega**: Intenta desplegar un sitio

---

## 📊 Archivos Nuevos Actualizados

```
wordpress-deployer/
├── lib/
│   ├── server-setup.js          ← NUEVO
│   └── wordpress-manager.js     ← NUEVO
├── AUTOMATION-FEATURES.md       ← NUEVO
├── FRONTEND-MEJORAS.md          ← NUEVO
└── ACTUALIZACION-COMPLETA.md    ← NUEVO (este archivo)
```

---

**¡Todo listo! Sigue los pasos en orden y tendrás la versión mejorada funcionando** 🚀
