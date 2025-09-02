# 🚀 Guía de Despliegue en Vercel - OpenBook Backend

Esta guía te ayudará a desplegar tu aplicación OpenBook Backend en Vercel de manera correcta.

## 📋 Prerrequisitos

1. **Cuenta de Vercel**: Crea una cuenta en [vercel.com](https://vercel.com)
2. **Base de datos MySQL**: Necesitas una base de datos MySQL accesible desde internet
3. **GitHub/GitLab**: Tu código debe estar en un repositorio Git

## 🔧 Configuración de Variables de Entorno

### 1. En el Dashboard de Vercel

Ve a tu proyecto en Vercel y configura las siguientes variables de entorno:

```bash
# Database Configuration
DB_HOST=tu-host-mysql
DB_USER=tu-usuario-mysql
DB_PASSWORD=tu-password-mysql
DB_NAME=tu-nombre-base-datos
DB_PORT=3306

# JWT Configuration
JWT_SECRET=tu-super-secret-jwt-key-aqui
JWT_EXPIRES_IN=24h

# Server Configuration
NODE_ENV=production
PORT=3000

# External APIs
OPENLIBRARY_API_URL=https://openlibrary.org/api

# CORS Configuration (opcional)
CORS_ORIGIN=https://tu-frontend-domain.vercel.app
```

### 2. Opciones de Base de Datos

**Opción A: PlanetScale (Recomendado)**
- Gratis hasta 1GB
- MySQL compatible
- SSL automático
- Dashboard web

**Opción B: Railway**
- MySQL hosting
- Fácil configuración
- SSL incluido

**Opción C: Clever Cloud**
- MySQL hosting
- Buena documentación en español

## 🚀 Pasos de Despliegue

### 1. Conectar Repositorio

1. Ve a [vercel.com](https://vercel.com)
2. Haz clic en "New Project"
3. Conecta tu repositorio de GitHub/GitLab
4. Selecciona el repositorio `OpenBook-backend`

### 2. Configurar Proyecto

En la configuración del proyecto:

- **Framework Preset**: Node.js
- **Root Directory**: `./` (raíz del proyecto)
- **Build Command**: `npm run build`
- **Output Directory**: `./`
- **Install Command**: `npm install`

### 3. Configurar Variables de Entorno

1. En la sección "Environment Variables"
2. Agrega todas las variables mencionadas arriba
3. Haz clic en "Deploy"

## 📁 Estructura del Proyecto

```
OpenBook-backend/
├── backend/
│   ├── app/
│   │   └── index.js          # Punto de entrada principal
│   ├── config/
│   │   └── vercel.js         # Configuración específica para Vercel
│   ├── database/
│   │   └── conexion_db.js     # Conexión a base de datos
│   └── routes/               # Rutas de la API
├── frontend/                 # Archivos estáticos
├── vercel.json              # Configuración de Vercel
└── package.json             # Dependencias y scripts
```

## 🔍 Verificación del Despliegue

### 1. Verificar Logs

En el dashboard de Vercel, ve a:
- **Functions** → Revisa los logs de la función
- **Deployments** → Revisa el estado del despliegue

### 2. Probar Endpoints

Una vez desplegado, prueba estos endpoints:

```bash
# Health check
curl https://tu-app.vercel.app/api/health

# Test database connection
curl https://tu-app.vercel.app/api/test-db
```

### 3. Verificar Base de Datos

Asegúrate de que:
- La base de datos esté accesible desde internet
- Las credenciales sean correctas
- El puerto 3306 esté abierto (o el puerto que uses)

## 🛠️ Solución de Problemas

### Error: "Cannot connect to database"

1. Verifica las variables de entorno en Vercel
2. Asegúrate de que la base de datos esté accesible
3. Revisa los logs en el dashboard de Vercel

### Error: "Module not found"

1. Verifica que `package.json` tenga todas las dependencias
2. Asegúrate de que el `main` apunte a `backend/app/index.js`
3. Revisa que `vercel.json` esté configurado correctamente

### Error: "CORS issues"

1. Configura `CORS_ORIGIN` en las variables de entorno
2. Verifica que el frontend esté en el dominio correcto

## 📊 Monitoreo

### Logs en Vercel

- **Function Logs**: Ve a Functions → Tu función → View Function Logs
- **Deployment Logs**: Ve a Deployments → Tu deployment → View Build Logs

### Métricas

- **Function Duration**: Monitorea el tiempo de respuesta
- **Error Rate**: Revisa la tasa de errores
- **Cold Starts**: Optimiza para reducir cold starts

## 🔄 Actualizaciones

Para actualizar tu aplicación:

1. Haz push a tu repositorio
2. Vercel detectará automáticamente los cambios
3. Desplegará una nueva versión
4. Puedes hacer rollback si hay problemas

## 📞 Soporte

Si tienes problemas:

1. Revisa los logs en Vercel
2. Verifica la configuración de la base de datos
3. Consulta la documentación de Vercel
4. Revisa este archivo de configuración

---

**¡Tu aplicación OpenBook Backend debería estar funcionando correctamente en Vercel!** 🎉
