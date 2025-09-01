# OpenBook Installation Guide

Complete installation guide for the OpenBook digital library platform.

## Prerequisites

Before installing OpenBook, ensure you have the following software installed:

### Required Software
- **Node.js** (v18.0.0 or higher)
  - Download from: https://nodejs.org/
  - Verify installation: `node --version`
- **MySQL** (v8.0.0 or higher)
  - Download from: https://dev.mysql.com/downloads/mysql/
  - Verify installation: `mysql --version`
- **Git** (for cloning the repository)
  - Download from: https://git-scm.com/
  - Verify installation: `git --version`

### System Requirements
- **Operating System**: Windows 10+, macOS 10.14+, or Linux (Ubuntu 18.04+)
- **RAM**: Minimum 4GB, Recommended 8GB
- **Storage**: Minimum 2GB free space
- **Network**: Internet connection for package installation

## Installation Steps

### 1. Clone the Repository

```bash
# Clone the repository
git clone https://github.com/yourusername/openbook-backend.git

# Navigate to the project directory
cd openbook-backend

# Verify the project structure
ls -la
```

### 2. Install Dependencies

```bash
# Install Node.js dependencies
npm install

# Verify installation
npm list --depth=0
```

### 3. Database Setup

#### Create MySQL Database

```bash
# Access MySQL as root
mysql -u root -p

# Create database
CREATE DATABASE openbook_db;

# Create user (optional but recommended)
CREATE USER 'openbook_user'@'localhost' IDENTIFIED BY 'your_secure_password';
GRANT ALL PRIVILEGES ON openbook_db.* TO 'openbook_user'@'localhost';
FLUSH PRIVILEGES;

# Exit MySQL
EXIT;
```

#### Import Database Schema

```bash
# Import the database schema
mysql -u root -p openbook_db < public/script.sql

# Verify tables were created
mysql -u root -p -e "USE openbook_db; SHOW TABLES;"
```

### 4. Environment Configuration

#### Create Environment File

```bash
# Copy the example environment file
cp .env.example .env

# Edit the environment file
nano .env
```

#### Configure Environment Variables

```env
# Server Configuration
PORT=3000
NODE_ENV=development

# Database Configuration
DB_HOST=localhost
DB_USER=openbook_user
DB_PASSWORD=your_secure_password
DB_NAME=openbook_db

# JWT Configuration
JWT_SECRET=your_super_secret_jwt_key_here
JWT_EXPIRES_IN=24h

# External API Configuration (optional)
OPENLIBRARY_API_URL=https://openlibrary.org
```

### 5. Verify Installation

#### Test Database Connection

```bash
# Test database connection
npm run test:db
```

#### Start the Application

```bash
# Start the development server
npm start

# Or start in development mode with auto-reload
npm run dev
```

#### Access the Application

- **Frontend**: http://localhost:3000
- **API Documentation**: http://localhost:3000/api
- **Health Check**: http://localhost:3000/api/health

## Post-Installation Setup

### 1. Create Initial Users

#### Create Teacher Account

```bash
# Using the API
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "full_name": "Admin Teacher",
    "email": "admin@maestro.edu.co",
    "password": "Password123",
    "institution_name": "OpenBook University",
    "role": "teacher"
  }'
```

#### Create Student Account

```bash
# Using the API
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "full_name": "Test Student",
    "email": "student@estudiante.edu.co",
    "password": "Password123",
    "institution_name": "OpenBook University",
    "role": "student"
  }'
```

### 2. Import Sample Data (Optional)

```bash
# The application will automatically sync with OpenLibrary API
# on first startup if the database is empty
```

### 3. Configure SweetAlert2

SweetAlert2 is automatically configured when the application starts. Verify by:

1. Opening the application in a browser
2. Checking the browser console for SweetAlert2 initialization messages
3. Testing alerts by clicking on various UI elements

## Development Setup

### 1. Development Dependencies

```bash
# Install development dependencies
npm install --save-dev nodemon eslint prettier

# Configure ESLint
npx eslint --init
```

### 2. Development Scripts

Add these scripts to `package.json`:

```json
{
  "scripts": {
    "start": "node server.js",
    "dev": "nodemon server.js",
    "test": "npm run test:unit && npm run test:integration",
    "test:unit": "jest",
    "test:integration": "jest --config jest.integration.config.js",
    "test:db": "node scripts/test-db.js",
    "lint": "eslint .",
    "lint:fix": "eslint . --fix",
    "format": "prettier --write ."
  }
}
```

### 3. Database Migrations

```bash
# Create migration script
mkdir scripts
touch scripts/migrate.js

# Run migrations
npm run migrate
```

## Production Deployment

### 1. Environment Setup

```bash
# Set production environment
export NODE_ENV=production

# Update environment variables for production
nano .env
```

### 2. Security Configuration

```bash
# Generate secure JWT secret
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"

# Update JWT secret in .env
JWT_SECRET=your_generated_secret_here
```

### 3. Process Management

#### Using PM2

```bash
# Install PM2
npm install -g pm2

# Start application with PM2
pm2 start server.js --name "openbook"

# Save PM2 configuration
pm2 save

# Setup PM2 to start on boot
pm2 startup
```

#### Using Docker

```bash
# Build Docker image
docker build -t openbook .

# Run container
docker run -d -p 3000:3000 --name openbook-app openbook
```

### 4. Reverse Proxy (Nginx)

```nginx
server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

## Troubleshooting

### Common Issues

#### 1. Database Connection Error

```bash
# Check MySQL service
sudo systemctl status mysql

# Restart MySQL
sudo systemctl restart mysql

# Verify connection
mysql -u openbook_user -p -e "SELECT 1;"
```

#### 2. Port Already in Use

```bash
# Find process using port 3000
lsof -i :3000

# Kill process
kill -9 <PID>

# Or change port in .env
PORT=3001
```

#### 3. SweetAlert2 Not Loading

```bash
# Check browser console for errors
# Verify CDN is accessible
curl https://cdn.jsdelivr.net/npm/sweetalert2@11

# Check network connectivity
ping cdn.jsdelivr.net
```

#### 4. JWT Token Issues

```bash
# Verify JWT secret is set
echo $JWT_SECRET

# Check token expiration
# Tokens expire after 24 hours by default
```

### Logs and Debugging

#### Application Logs

```bash
# View application logs
tail -f logs/app.log

# View error logs
tail -f logs/error.log
```

#### Database Logs

```bash
# View MySQL logs
sudo tail -f /var/log/mysql/error.log

# Check slow queries
sudo tail -f /var/log/mysql/slow.log
```

#### Browser Debugging

```javascript
// Enable debug mode
localStorage.setItem('debug', 'true');

// Check SweetAlert2 availability
console.log('SweetAlert2:', typeof Swal);
```

## Support

### Getting Help

1. **Check Documentation**: Review the README.md and API documentation
2. **Search Issues**: Look for similar issues in the GitHub repository
3. **Create Issue**: Report bugs or request features
4. **Community**: Join the OpenBook community discussions

### Contact Information

- **GitHub Issues**: https://github.com/yourusername/openbook-backend/issues
- **Email Support**: support@openbook.com
- **Documentation**: https://github.com/yourusername/openbook-backend/wiki

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.
