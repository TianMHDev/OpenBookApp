# OpenBookApp - Digital Learning Platform

Una plataforma digital de aprendizaje que conecta maestros y estudiantes a través de libros digitales.

## 🚀 Características

- **Autenticación segura** con JWT
- **Roles diferenciados** para maestros y estudiantes
- **Catálogo de libros** con búsqueda y filtros
- **Sistema de asignaciones** de libros
- **Seguimiento de progreso** de lectura
- **Favoritos** para estudiantes
- **Dashboard personalizado** para cada rol

## 🛠️ Tecnologías

- **Backend**: Node.js, Express.js, MySQL
- **Frontend**: HTML5, CSS3, JavaScript (Vanilla)
- **Base de datos**: MySQL
- **Autenticación**: JWT
- **Despliegue**: Vercel

## 📋 Requisitos

- Node.js 16+
- MySQL 8.0+
- Cuenta de Vercel

## 🔧 Configuración para Vercel

### Variables de Entorno

Configura estas variables en tu proyecto de Vercel:

```env
DB_HOST=tu_host_de_base_de_datos
DB_USER=tu_usuario_de_base_de_datos
DB_PASSWORD=tu_password_de_base_de_datos
DB_NAME=openbook
DB_PORT=3306
JWT_SECRET=tu_jwt_secret_super_seguro_y_largo
JWT_EXPIRES_IN=24h
NODE_ENV=production
```

### Base de Datos

Asegúrate de que tu base de datos MySQL esté configurada con las siguientes tablas:

- `users` - Usuarios del sistema
- `roles` - Roles (maestro, estudiante)
- `institutions` - Instituciones educativas
- `books` - Catálogo de libros
- `assignments` - Asignaciones de libros
- `favorites` - Libros favoritos de estudiantes

## 🚀 Despliegue

1. **Conecta tu repositorio** a Vercel
2. **Configura las variables de entorno** en Vercel
3. **Deploy automático** en cada push a main

## 📱 Uso

### Para Maestros:
- Gestionar catálogo de libros
- Asignar libros a estudiantes
- Ver progreso de estudiantes
- Administrar estudiantes

### Para Estudiantes:
- Explorar catálogo de libros
- Marcar libros como favoritos
- Ver libros asignados
- Actualizar progreso de lectura

## 🔐 Seguridad

- Autenticación JWT
- Validación de roles
- Sanitización de datos
- CORS configurado
- Contraseñas hasheadas con bcrypt

## 📄 Licencia

Este proyecto está bajo la licencia GPL-3.0.

## 👥 Contribución

1. Fork el proyecto
2. Crea una rama para tu feature
3. Commit tus cambios
4. Push a la rama
5. Abre un Pull Request

## 📞 Soporte

Para soporte técnico, contacta al equipo de desarrollo.

---

**OpenBookApp** - Transformando la educación digital 📚
