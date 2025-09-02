# 📚 OpenBook - Digital Learning Platform

A modern, responsive digital library platform designed for educational institutions. OpenBook provides a comprehensive solution for teachers to assign books to students, track reading progress, and manage digital learning resources.

## 🚀 Features

### 👨‍🏫 **Teacher Dashboard**
- **Book Management**: Browse and search through a vast collection of digital books
- **Student Assignment**: Assign books to individual students or entire classes
- **Progress Tracking**: Monitor student reading progress in real-time
- **Analytics**: View detailed statistics and reading analytics
- **Student Management**: Manage student accounts and class assignments

### 👨‍🎓 **Student Dashboard**
- **Personal Library**: View all books assigned by teachers
- **Reading Progress**: Track reading progress with interactive sliders
- **Search & Filter**: Search books by title/author and filter by reading status
- **Reading Statistics**: View personal reading statistics and achievements
- **Responsive Design**: Fully responsive interface for all devices

### 🎨 **Modern UI/UX**
- **Responsive Design**: Works perfectly on mobile, tablet, and desktop
- **Consistent Styling**: Unified design language across all pages
- **Interactive Elements**: Smooth animations and transitions
- **Accessibility**: WCAG compliant with proper contrast and navigation
- **Performance Optimized**: Fast loading times and smooth interactions

## 🛠️ Technology Stack

### **Backend**
- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **MySQL** - Database management
- **JWT** - Authentication and authorization
- **bcrypt** - Password hashing

### **Frontend**
- **HTML5** - Semantic markup
- **CSS3** - Modern styling with Grid and Flexbox
- **JavaScript (ES6+)** - Interactive functionality
- **Bootstrap Icons** - Icon library
- **Responsive Design** - Mobile-first approach

### **Database**
- **MySQL** - Relational database
- **Structured Schema** - Optimized for educational data
- **Relationships** - Users, books, assignments, favorites

## 📦 Installation

### **Prerequisites**
- Node.js (v16 or higher)
- MySQL (v8.0 or higher)
- npm or yarn package manager

### **1. Clone the Repository**
```bash
git clone https://github.com/your-username/openbook-backend.git
cd openbook-backend
```

### **2. Install Dependencies**
```bash
npm install
```

### **3. Database Setup**
```bash
# Create MySQL database
mysql -u root -p
CREATE DATABASE openbook;
USE openbook;

# Import schema and data
mysql -u root -p openbook < public/script.sql
mysql -u root -p openbook < public/data_users.sql
```

### **4. Environment Configuration**
Create a `.env` file in the root directory:
```env
DB_HOST=localhost
DB_USER=your_mysql_username
DB_PASSWORD=your_mysql_password
DB_NAME=openbook
JWT_SECRET=your_jwt_secret_key
PORT=3000
```

### **5. Start the Application**
```bash
npm start
```

The application will be available at `http://localhost:3000`

## 🗄️ Database Schema

### **Users Table**
```sql
CREATE TABLE users (
    user_id INT PRIMARY KEY AUTO_INCREMENT,
    full_name VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    role_id INT NOT NULL,
    institution_id INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### **Books Table**
```sql
CREATE TABLE books (
    book_id INT PRIMARY KEY AUTO_INCREMENT,
    title VARCHAR(255) NOT NULL,
    author VARCHAR(255) NOT NULL,
    cover_url VARCHAR(500),
    published_year INT,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### **Book Assignments Table**
```sql
CREATE TABLE book_assignments (
    assignment_id INT PRIMARY KEY AUTO_INCREMENT,
    student_id INT NOT NULL,
    book_id INT NOT NULL,
    status ENUM('pending', 'in_progress', 'completed') DEFAULT 'pending',
    progress INT DEFAULT 0,
    assignment_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

## 🔐 Authentication & Authorization

### **User Roles**
- **Estudiante (Student)**: Can view assigned books, update progress
- **Profesor (Teacher)**: Can assign books, view student progress, manage classes
- **Admin**: Full system access and user management

### **JWT Token System**
- Secure token-based authentication
- Role-based access control
- Automatic token refresh
- Secure password hashing with bcrypt

## 📱 Responsive Design

### **Breakpoints**
- **Mobile**: 320px - 480px
- **Tablet**: 481px - 768px
- **Desktop**: 769px - 1024px
- **Large Desktop**: 1025px+

### **Mobile-First Approach**
- Optimized for touch interactions
- Responsive grid layouts
- Adaptive typography
- Touch-friendly controls

## 🎨 UI Components

### **Color Palette**
```css
/* Primary Colors */
--primary-bg: #fafafa;
--card-bg: #ffffff;
--text-primary: #0b0b0b;
--text-secondary: #6b7280;
--border-color: #e5e7eb;

/* Status Colors */
--progress: #fef3c7;
--completed: #d1fae5;
--pending: #f3f4f6;
```

### **Typography**
- **Font Family**: Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto
- **Font Weights**: 400, 500, 600, 700
- **Responsive Scaling**: Automatically adjusts for different screen sizes

## 🔧 API Endpoints

### **Authentication**
```
POST /api/auth/login
POST /api/auth/register
GET /api/auth/verify
```

### **Books**
```
GET /api/books
GET /api/books/:id
POST /api/books/search
```

### **Assignments**
```
GET /api/users/assignments
POST /api/assignments
PUT /api/assignments/:id
DELETE /api/assignments/:id
```

### **Users**
```
GET /api/users/profile
GET /api/users/students
PUT /api/users/profile
```

## 🧪 Testing

### **Manual Testing**
1. **Login Flow**: Test authentication with different user roles
2. **Book Assignment**: Assign books to students
3. **Progress Tracking**: Update reading progress
4. **Responsive Design**: Test on different devices and screen sizes
5. **Search & Filter**: Test search functionality and filters

### **Browser Compatibility**
- ✅ Chrome 90+
- ✅ Firefox 88+
- ✅ Safari 14+
- ✅ Edge 90+

## 🚀 Deployment

### **Production Setup**
1. **Environment Variables**: Configure production database and JWT secret
2. **Database**: Set up production MySQL instance
3. **SSL Certificate**: Configure HTTPS for security
4. **Process Manager**: Use PM2 for Node.js process management
5. **Reverse Proxy**: Configure Nginx for load balancing

### **Docker Deployment**
```dockerfile
FROM node:16-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
EXPOSE 3000
CMD ["npm", "start"]
```

## 📊 Performance Optimization

### **Frontend**
- **CSS Optimization**: Minified stylesheets
- **Image Optimization**: Compressed book covers
- **Lazy Loading**: Images load on demand
- **Caching**: Browser caching for static assets

### **Backend**
- **Database Indexing**: Optimized queries
- **Connection Pooling**: Efficient database connections
- **Response Caching**: API response caching
- **Error Handling**: Comprehensive error management

## 🔒 Security Features

### **Authentication**
- JWT token-based authentication
- Password hashing with bcrypt
- Session management
- Role-based access control

### **Data Protection**
- SQL injection prevention
- XSS protection
- CSRF protection
- Input validation and sanitization

## 📈 Analytics & Monitoring

### **User Analytics**
- Reading progress tracking
- Book completion rates
- Student engagement metrics
- Teacher assignment patterns

### **System Monitoring**
- API response times
- Database performance
- Error tracking
- User activity logs

## 🤝 Contributing

### **Development Setup**
1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

### **Code Standards**
- Follow ESLint configuration
- Use consistent naming conventions
- Write meaningful commit messages
- Include proper documentation

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

### **Documentation**
- [API Documentation](docs/api.md)
- [Database Schema](docs/database.md)
- [Deployment Guide](docs/deployment.md)

### **Contact**
- **Email**: support@openbook.com
- **Issues**: [GitHub Issues](https://github.com/your-username/openbook-backend/issues)
- **Discussions**: [GitHub Discussions](https://github.com/your-username/openbook-backend/discussions)

## 🎉 Acknowledgments

- **OpenLibrary API** for book cover images
- **Bootstrap Icons** for the icon library
- **Inter Font** for typography
- **MySQL Community** for database support

---

**OpenBook** - Empowering education through digital reading 📚✨
