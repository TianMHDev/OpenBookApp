# 🚀 OpenBook Deployment Guide

Complete guide to deploy OpenBook on GitHub Pages and cloud platforms.

## 📋 Table of Contents

- [GitHub Pages Deployment](#github-pages-deployment)
- [Backend Deployment Options](#backend-deployment-options)
- [Database Setup](#database-setup)
- [Configuration](#configuration)
- [Troubleshooting](#troubleshooting)

---

## 🌐 GitHub Pages Deployment

### **Step 1: Prepare Your Repository**

1. **Enable GitHub Pages**:
   - Go to your repository settings
   - Scroll down to "Pages" section
   - Select "GitHub Actions" as source
   - Save the settings

2. **Update Configuration**:
   - Edit `frontend/js/config.js`
   - Replace `https://your-backend-domain.com/api` with your actual backend URL

### **Step 2: Configure GitHub Actions**

The workflow file `.github/workflows/deploy.yml` will automatically:
- Build your frontend
- Deploy to GitHub Pages
- Update API endpoints for production

### **Step 3: Deploy**

```bash
# Push your changes to trigger deployment
git add .
git commit -m "Configure for GitHub Pages deployment"
git push origin main
```

### **Step 4: Access Your App**

Your app will be available at:
```
https://yourusername.github.io/OpenBook-backend/
```

---

## 🔧 Backend Deployment Options

Since GitHub Pages only serves static files, you need to deploy your backend separately.

### **Option 1: Railway (Recommended)**

1. **Sign up at [Railway](https://railway.app/)**
2. **Connect your GitHub repository**
3. **Configure environment variables**:
   ```env
   NODE_ENV=production
   PORT=3000
   DB_HOST=your-db-host
   DB_USER=your-db-user
   DB_PASSWORD=your-db-password
   DB_NAME=your-db-name
   JWT_SECRET=your-jwt-secret
   CORS_ORIGIN=https://yourusername.github.io
   ```

4. **Deploy**:
   - Railway will automatically detect your Node.js app
   - It will install dependencies and start your server
   - You'll get a URL like: `https://your-app.railway.app`

### **Option 2: Render**

1. **Sign up at [Render](https://render.com/)**
2. **Create a new Web Service**
3. **Connect your GitHub repository**
4. **Configure**:
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Environment Variables**: Same as Railway

### **Option 3: Heroku**

1. **Install Heroku CLI**
2. **Login and create app**:
   ```bash
   heroku login
   heroku create your-openbook-app
   ```

3. **Add environment variables**:
   ```bash
   heroku config:set NODE_ENV=production
   heroku config:set DB_HOST=your-db-host
   heroku config:set DB_USER=your-db-user
   heroku config:set DB_PASSWORD=your-db-password
   heroku config:set DB_NAME=your-db-name
   heroku config:set JWT_SECRET=your-jwt-secret
   heroku config:set CORS_ORIGIN=https://yourusername.github.io
   ```

4. **Deploy**:
   ```bash
   git push heroku main
   ```

---

## 🗄️ Database Setup

### **Option 1: Railway Database**

1. **Add MySQL database in Railway**
2. **Get connection details from Railway dashboard**
3. **Import your schema**:
   ```bash
   # Download schema from your repository
   curl -O https://raw.githubusercontent.com/yourusername/OpenBook-backend/main/public/script.sql
   
   # Import to Railway database
   mysql -h your-railway-host -u your-railway-user -p your-railway-db < script.sql
   ```

### **Option 2: PlanetScale**

1. **Sign up at [PlanetScale](https://planetscale.com/)**
2. **Create a new database**
3. **Import schema using PlanetScale dashboard**
4. **Get connection string and update environment variables**

### **Option 3: AWS RDS**

1. **Create MySQL RDS instance**
2. **Configure security groups**
3. **Import schema using AWS console or CLI**

---

## ⚙️ Configuration

### **Update Frontend Configuration**

Edit `frontend/js/config.js`:

```javascript
const config = {
    development: {
        apiBaseUrl: 'http://localhost:3000/api',
        environment: 'development'
    },
    production: {
        apiBaseUrl: 'https://your-backend-url.com/api', // Update this
        environment: 'production'
    }
};
```

### **Update CORS Settings**

In your backend, ensure CORS allows your GitHub Pages domain:

```javascript
// backend/app.js
app.use(cors({
    origin: [
        'http://localhost:3000',
        'https://yourusername.github.io',
        'https://your-custom-domain.com'
    ],
    credentials: true
}));
```

### **Environment Variables**

Create `.env` file for your backend:

```env
NODE_ENV=production
PORT=3000
DB_HOST=your-database-host
DB_USER=your-database-user
DB_PASSWORD=your-database-password
DB_NAME=your-database-name
JWT_SECRET=your-super-secure-jwt-secret
CORS_ORIGIN=https://yourusername.github.io
```

---

## 🔍 Troubleshooting

### **Common Issues**

**1. CORS Errors**
```
Access to fetch at 'https://your-backend.com/api/auth/login' from origin 'https://yourusername.github.io' has been blocked by CORS policy
```

**Solution**: Update CORS configuration in your backend to include your GitHub Pages domain.

**2. API Not Found**
```
Failed to fetch: https://your-backend.com/api/auth/login
```

**Solution**: 
- Check your backend URL is correct
- Ensure your backend is running
- Verify the API endpoint exists

**3. Database Connection Issues**
```
ER_ACCESS_DENIED_ERROR: Access denied for user 'user'@'host'
```

**Solution**:
- Check database credentials
- Verify database host allows connections
- Ensure database exists

**4. GitHub Pages Not Updating**
```
Page not found or still showing old content
```

**Solution**:
- Check GitHub Actions workflow status
- Clear browser cache
- Wait a few minutes for deployment to complete

### **Debug Steps**

1. **Check GitHub Actions**:
   - Go to your repository
   - Click "Actions" tab
   - Check if deployment succeeded

2. **Check Browser Console**:
   - Open Developer Tools (F12)
   - Check for JavaScript errors
   - Verify API calls are going to correct URL

3. **Test Backend API**:
   ```bash
   curl -X POST https://your-backend.com/api/auth/login \
     -H "Content-Type: application/json" \
     -d '{"email":"test@example.com","password":"password"}'
   ```

4. **Check Database Connection**:
   ```bash
   mysql -h your-host -u your-user -p your-database -e "SELECT 1;"
   ```

---

## 📊 Monitoring

### **Frontend Monitoring**

Add Google Analytics or similar:

```html
<!-- Add to your HTML files -->
<script async src="https://www.googletagmanager.com/gtag/js?id=GA_MEASUREMENT_ID"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', 'GA_MEASUREMENT_ID');
</script>
```

### **Backend Monitoring**

For Railway/Render/Heroku:
- Use built-in monitoring dashboards
- Set up alerts for errors
- Monitor response times

---

## 🔒 Security Considerations

### **Production Security**

1. **HTTPS Only**: Ensure all connections use HTTPS
2. **Strong JWT Secret**: Use a long, random string
3. **Database Security**: Use strong passwords and limit access
4. **CORS Configuration**: Only allow necessary domains
5. **Rate Limiting**: Implement API rate limiting
6. **Input Validation**: Validate all user inputs

### **Environment Variables**

Never commit sensitive data to your repository:

```bash
# Add to .gitignore
.env
.env.local
.env.production
```

---

## 🚀 Final Checklist

Before going live:

- [ ] Backend deployed and accessible
- [ ] Database configured and populated
- [ ] Frontend configuration updated
- [ ] CORS settings configured
- [ ] Environment variables set
- [ ] SSL certificates active
- [ ] Domain configured (if using custom domain)
- [ ] Monitoring set up
- [ ] Error handling tested
- [ ] Performance optimized

---

## 📞 Support

If you encounter issues:

1. **Check the troubleshooting section above**
2. **Review GitHub Actions logs**
3. **Check browser console for errors**
4. **Test API endpoints directly**
5. **Verify database connectivity**

For additional help, create an issue in your GitHub repository with:
- Error message
- Steps to reproduce
- Environment details
- Screenshots if applicable

---

**Your OpenBook application is now ready for production! 🎉**

