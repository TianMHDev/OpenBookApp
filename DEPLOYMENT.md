# Guía de Despliegue - GitHub Pages

## Configuración Completada ✅

Tu proyecto ya está configurado para desplegarse automáticamente en GitHub Pages. El workflow de GitHub Actions se ejecutará cada vez que hagas push a la rama `main`.

## Pasos Finales

### 1. Configurar GitHub Pages en tu repositorio

1. Ve a tu repositorio en GitHub: https://github.com/TianMHDev/OpenBook
2. Ve a **Settings** → **Pages**
3. En **Source**, selecciona **GitHub Actions**
4. Guarda los cambios

### 2. Actualizar la URL del Backend

**IMPORTANTE**: Necesitas actualizar la URL de tu backend en producción:

1. Ve al archivo `.github/workflows/deploy.yml`
2. Encuentra esta línea:
   ```yaml
   sed -i 's|http://localhost:3000/api|https://your-backend-domain.com/api|g' dist/js/config.js
   ```
3. Reemplaza `https://your-backend-domain.com/api` con la URL real de tu backend desplegado

### 3. Desplegar el Backend

Para que tu aplicación funcione completamente, también necesitas desplegar el backend. Opciones recomendadas:

- **Railway**: https://railway.app/
- **Render**: https://render.com/
- **Heroku**: https://heroku.com/
- **Vercel**: https://vercel.com/

### 4. Verificar el Despliegue

Una vez que el workflow se ejecute (puedes verlo en la pestaña **Actions** de tu repositorio), tu aplicación estará disponible en:

```
https://tianmhdev.github.io/OpenBook/
```

## Estructura del Despliegue

- **Frontend**: Desplegado en GitHub Pages
- **Backend**: Necesita ser desplegado en un servicio separado
- **Base de Datos**: Configurada en el servicio del backend

## Troubleshooting

### Si el despliegue falla:
1. Revisa los logs en **Actions** → **Deploy to GitHub Pages**
2. Verifica que la rama sea `main`
3. Asegúrate de que el directorio `frontend` exista

### Si la aplicación no funciona:
1. Verifica que la URL del backend en `config.js` sea correcta
2. Asegúrate de que el backend esté desplegado y funcionando
3. Revisa la consola del navegador para errores

## Comandos Útiles

```bash
# Verificar el estado del repositorio
git status

# Ver los últimos commits
git log --oneline -5

# Verificar la configuración remota
git remote -v
```

## Notas Importantes

- GitHub Pages solo sirve contenido estático (HTML, CSS, JS)
- El backend debe estar desplegado en un servicio separado
- Las llamadas a la API deben usar HTTPS en producción
- Considera usar variables de entorno para las URLs de producción
