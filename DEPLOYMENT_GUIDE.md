# 🚀 Guía de Despliegue - OpenBookApp

## 📋 Pasos para desplegar en Vercel

### 1. **Configurar Base de Datos en Railway**

#### Opción A: Railway (Recomendado)
1. Ve a https://railway.app/
2. Inicia sesión con GitHub
3. Crea un nuevo proyecto
4. Agrega un servicio MySQL:
   - Haz clic en "New Service"
   - Selecciona "Database" → "MySQL"
   - Railway creará la base de datos automáticamente

#### Opción B: PlanetScale
1. Ve a https://planetscale.com/
2. Crea una cuenta con GitHub
3. Crea una nueva base de datos
4. Obtén las credenciales de conexión

#### Opción C: Clever Cloud
1. Ve a https://www.clever-cloud.com/
2. Crea una cuenta
3. Crea un servicio MySQL
4. Configura las credenciales

### 2. **Configurar la Base de Datos**

Una vez que tengas tu base de datos, ejecuta el script `database-setup.sql`:

```bash
# Si usas Railway CLI
railway connect < tu-servicio-mysql >

# O conecta directamente con las credenciales
mysql -h tu-host -u tu-usuario -p tu-password < database-setup.sql
```

### 3. **Desplegar en Vercel**

1. **Ve a Vercel**: https://vercel.com/
2. **Inicia sesión** con GitHub
3. **Importa tu proyecto**:
   - Haz clic en "New Project"
   - Selecciona `TianMHDev/OpenBookApp`
   - Vercel detectará que es un proyecto Node.js

4. **Configura las variables de entorno**:
   ```env
   DB_HOST=tu-host-de-railway
   DB_USER=tu-usuario-de-railway
   DB_PASSWORD=tu-password-de-railway
   DB_NAME=openbook
   DB_PORT=3306
   JWT_SECRET=tu-jwt-secret-super-seguro-y-largo
   JWT_EXPIRES_IN=24h
   NODE_ENV=production
   ```

5. **Haz clic en "Deploy"**

### 4. **Obtener Credenciales de Railway**

Si usas Railway, las credenciales están en:
- Dashboard de Railway → Tu proyecto → MySQL service
- Pestaña "Connect" → "Connect" → "MySQL"
- Copia las credenciales de conexión

### 5. **Verificar el Despliegue**

Una vez desplegado, tu aplicación estará disponible en:
```
https://openbookapp.vercel.app
```

## 🔧 Configuración de Variables de Entorno

### Variables Requeridas:

| Variable | Descripción | Ejemplo |
|----------|-------------|---------|
| `DB_HOST` | Host de la base de datos | `containers-us-west-1.railway.app` |
| `DB_USER` | Usuario de la base de datos | `root` |
| `DB_PASSWORD` | Contraseña de la base de datos | `tu-password-secreto` |
| `DB_NAME` | Nombre de la base de datos | `openbook` |
| `DB_PORT` | Puerto de la base de datos | `3306` |
| `JWT_SECRET` | Clave secreta para JWT | `mi-clave-super-secreta-2024` |
| `JWT_EXPIRES_IN` | Tiempo de expiración del token | `24h` |
| `NODE_ENV` | Entorno de ejecución | `production` |

## 🗄️ Estructura de la Base de Datos

El script `database-setup.sql` crea las siguientes tablas:

- **`roles`** - Roles de usuario (maestro, estudiante)
- **`institutions`** - Instituciones educativas
- **`users`** - Usuarios del sistema
- **`books`** - Catálogo de libros
- **`book_assignments`** - Asignaciones de libros
- **`user_favorites`** - Libros favoritos

## 🧪 Pruebas Post-Despliegue

1. **Registrar un usuario maestro**:
   - Email: `maestro@maestro.edu.co`
   - Contraseña: `Password123`

2. **Registrar un usuario estudiante**:
   - Email: `estudiante@estudiante.edu.co`
   - Contraseña: `Password123`

3. **Probar funcionalidades**:
   - Login/Logout
   - Asignación de libros
   - Seguimiento de progreso
   - Favoritos

## 🔍 Troubleshooting

### Error de conexión a la base de datos:
- Verifica que las variables de entorno estén correctas
- Asegúrate de que la base de datos esté accesible desde Vercel
- Revisa los logs en Vercel

### Error de JWT:
- Verifica que `JWT_SECRET` esté configurado
- Asegúrate de que sea una cadena larga y segura

### Error de CORS:
- La aplicación ya tiene CORS configurado
- Si persiste, verifica las rutas en `vercel.json`

## 📞 Soporte

Si tienes problemas:
1. Revisa los logs en Vercel
2. Verifica las variables de entorno
3. Confirma que la base de datos esté funcionando
4. Contacta al equipo de desarrollo

---

**¡Tu OpenBookApp estará listo para usar!** 🎉
