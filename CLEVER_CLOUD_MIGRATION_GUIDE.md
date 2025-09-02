# 🚀 Guía de Migración: Railway a Clever Cloud

Esta guía te ayudará a migrar tu base de datos de Railway a Clever Cloud para tu aplicación OpenBook.

## 📋 Prerrequisitos

- ✅ Cuenta en [Clever Cloud](https://www.clever-cloud.com/)
- ✅ Acceso a tu proyecto en Vercel
- ✅ Credenciales actuales de Railway
- ✅ Node.js instalado localmente

## 🎯 Paso 1: Crear Base de Datos en Clever Cloud

### 1.1 Crear cuenta en Clever Cloud
1. Ve a [Clever Cloud](https://www.clever-cloud.com/)
2. Crea una cuenta gratuita
3. Verifica tu email

### 1.2 Crear aplicación MySQL
1. En el dashboard de Clever Cloud, haz clic en **"Create an application"**
2. Selecciona **"Add a service"** → **"MySQL"**
3. Elige el plan que necesites (hay opciones gratuitas)
4. Configura tu base de datos:
   - **Nombre de la aplicación**: `openbook-database`
   - **Región**: La más cercana a tus usuarios
   - **Plan**: Free o el que prefieras

### 1.3 Obtener credenciales de conexión
1. Una vez creada la aplicación, ve a **"Information"**
2. Anota las siguientes credenciales:
   - **Host**: `mysql-xxxxx.cloud.clever-cloud.com`
   - **Port**: `3306` (por defecto)
   - **Database**: `bxxxxx`
   - **Username**: `uxxxxx`
   - **Password**: `pxxxxx`

## 🔧 Paso 2: Configurar Variables de Entorno

### 2.1 Variables locales (para pruebas)
Crea un archivo `.env` en tu proyecto:

```bash
# Clever Cloud Configuration
CLEVER_CLOUD_HOST=mysql-xxxxx.cloud.clever-cloud.com
CLEVER_CLOUD_PORT=3306
CLEVER_CLOUD_DATABASE=bxxxxx
CLEVER_CLOUD_USER=uxxxxx
CLEVER_CLOUD_PASSWORD=pxxxxx

# Railway Configuration (para migración)
RAILWAY_USER=root
RAILWAY_PASSWORD=LfoGYuVpGdzjmiyfIieZBDZJbbBPgWwf
RAILWAY_DATABASE=railway
```

### 2.2 Variables en Vercel
1. Ve a tu proyecto en [Vercel Dashboard](https://vercel.com/dashboard)
2. Selecciona tu proyecto
3. Ve a **Settings** → **Environment Variables**
4. Agrega las siguientes variables:

```
CLEVER_CLOUD_HOST=mysql-xxxxx.cloud.clever-cloud.com
CLEVER_CLOUD_PORT=3306
CLEVER_CLOUD_DATABASE=bxxxxx
CLEVER_CLOUD_USER=uxxxxx
CLEVER_CLOUD_PASSWORD=pxxxxx
```

## 🧪 Paso 3: Probar Conexión

### 3.1 Instalar dependencias
```bash
npm install
```

### 3.2 Probar conexión a Clever Cloud
```bash
node test-clever-cloud.js
```

Deberías ver:
```
✅ Connection successful!
🎉 All tests passed! Clever Cloud is ready to use.
```

## 📦 Paso 4: Migrar Datos

### 4.1 Crear backup de Railway
```bash
node migrate-to-clever-cloud.js
```

Este script:
- ✅ Crea un backup completo de Railway
- ✅ Migra toda la estructura de la base de datos
- ✅ Transfiere todos los datos
- ✅ Verifica la integridad

### 4.2 Verificar migración
```bash
node test-clever-cloud.js
```

Confirma que:
- ✅ Todas las tablas están presentes
- ✅ Los datos están correctos
- ✅ Las operaciones básicas funcionan

## 🚀 Paso 5: Actualizar Aplicación

### 5.1 Desplegar cambios
```bash
git add .
git commit -m "Migrate to Clever Cloud"
git push
```

### 5.2 Verificar en Vercel
1. Ve a tu proyecto en Vercel
2. Verifica que el deployment sea exitoso
3. Prueba los endpoints de tu API

## 🔍 Paso 6: Monitoreo y Verificación

### 6.1 Verificar logs en Vercel
1. Ve a tu proyecto en Vercel
2. **Functions** → Selecciona tu función
3. Revisa los logs para errores de conexión

### 6.2 Verificar en Clever Cloud
1. Dashboard de Clever Cloud
2. **Monitoring** → Revisa métricas
3. **Logs** → Verifica conexiones

## 🛠️ Solución de Problemas

### Error: "Connection refused"
- ✅ Verifica que el host y puerto sean correctos
- ✅ Confirma que la base de datos esté activa en Clever Cloud
- ✅ Verifica que tu IP esté permitida

### Error: "Access denied"
- ✅ Verifica username y password
- ✅ Confirma que el usuario tenga permisos
- ✅ Verifica el nombre de la base de datos

### Error: "SSL connection"
- ✅ El SSL está configurado automáticamente
- ✅ Verifica que `rejectUnauthorized: false` esté configurado

## 📊 Comparación: Railway vs Clever Cloud

| Característica | Railway | Clever Cloud |
|----------------|---------|--------------|
| **Plan Gratuito** | ✅ Sí | ✅ Sí |
| **MySQL** | ✅ Sí | ✅ Sí |
| **Auto-scaling** | ✅ Sí | ✅ Sí |
| **Backups** | ✅ Sí | ✅ Sí |
| **SSL/TLS** | ✅ Sí | ✅ Sí |
| **Panel de Control** | ✅ Bueno | ✅ Excelente |
| **Soporte** | ✅ Bueno | ✅ Excelente |
| **Precios** | 💰 Competitivos | 💰 Muy competitivos |

## 🎉 ¡Migración Completada!

Una vez que hayas seguido todos los pasos:

1. ✅ Tu aplicación está usando Clever Cloud
2. ✅ Todos los datos están migrados
3. ✅ La aplicación funciona correctamente
4. ✅ Puedes cancelar tu cuenta de Railway

## 📞 Soporte

Si tienes problemas:
- 📧 [Clever Cloud Support](https://www.clever-cloud.com/support)
- 📧 [Vercel Support](https://vercel.com/support)
- 📧 Crea un issue en este repositorio

---

**¡Felicitaciones! 🎉 Tu aplicación OpenBook ahora está usando Clever Cloud como base de datos.**
