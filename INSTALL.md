# 🚀 Guía Rápida de Instalación

## Prerrequisitos

### Instalar Node.js
1. Visita https://nodejs.org/
2. Descarga la versión LTS (recomendada)
3. Ejecuta el instalador
4. Verifica la instalación:
   ```bash
   node --version
   npm --version
   ```

## Instalación de la Aplicación

### Opción 1: Línea de Comandos
```bash
# 1. Abrir PowerShell o Terminal
# 2. Navegar al directorio
cd C:\Users\David\Downloads\wordpress-deployer

# 3. Instalar dependencias
npm install

# 4. Iniciar servidor
npm start
```

### Opción 2: Usando el Explorador
1. Abre el Explorador de Windows
2. Navega a `C:\Users\David\Downloads\wordpress-deployer`
3. En la barra de direcciones, escribe `cmd` y presiona Enter
4. Se abrirá la consola en ese directorio
5. Ejecuta:
   ```
   npm install
   npm start
   ```

## Primer Uso

1. **Abrir navegador**: http://localhost:3000
2. **Crear cuenta**: Click en "Comenzar Gratis" → Registrarse
3. **Explorar el dashboard**: 
   - Vista general con estadísticas
   - Añadir servidor (datos de prueba)
   - Desplegar WordPress (simulado)

## Modo Demo

Por defecto, la aplicación funciona en **modo demo**:
- ✅ No necesitas servidores reales
- ✅ Toda la interfaz es funcional
- ✅ Datos simulados
- ✅ Perfecto para probar

## Pasar a Producción

Cuando estés listo para usar con servidores reales:

1. Edita el archivo `.env`:
   ```env
   DEMO_MODE=false
   ```

2. Necesitarás:
   - Servidor Linux (VPS)
   - Acceso SSH
   - Clave SSH privada
   - Permisos sudo

## Solución de Problemas

### "npm no se reconoce como comando"
→ Necesitas instalar Node.js primero (ver Prerrequisitos)

### "Error al iniciar servidor"
→ Verifica que el puerto 3000 esté libre
→ O cambia el puerto en `.env`: `PORT=3001`

### "Cannot find module"
→ Ejecuta `npm install` nuevamente

## Recursos

- 📖 **README completo**: `README.md`
- 📝 **Walkthrough**: Ver artifact de walkthrough
- 🎨 **Código frontend**: `public/`
- ⚙️ **Código backend**: `server.js`
- 🐧 **Scripts Linux**: `scripts/`

## Soporte

Para más ayuda, revisa:
1. `README.md` - Documentación completa
2. Walkthrough - Guía paso a paso
3. Comentarios en el código

---

**¡Listo para desplegar WordPress como un profesional! 🚀**
