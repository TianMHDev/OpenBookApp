# 📚 OpenBook - Digital Library Platform

A comprehensive digital library platform for educational institutions, featuring book management, student progress tracking, and teacher assignment capabilities.

## 🚀 Features

### For Students
- **Personal Library**: View all books assigned by teachers
- **Reading Progress**: Track reading progress with visual progress bars
- **Book Reader**: Built-in reader with customizable themes and bookmarks
- **Search & Filter**: Find books by title, author, or status
- **Reading Statistics**: View completion rates and reading analytics
- **Favorites**: Save and manage favorite books

### For Teachers
- **Book Assignment**: Assign books to students with one-click
- **Student Management**: View and manage student progress
- **Book Catalog**: Browse and search through extensive book collection
- **Progress Monitoring**: Track individual and class reading progress
- **Quick Actions**: Rapid assignment and management tools

### Technical Features
- **Responsive Design**: Works on desktop, tablet, and mobile
- **Modern UI**: Clean, intuitive interface with Bootstrap 5
- **Real-time Updates**: Live progress tracking and notifications
- **SweetAlert2 Integration**: Beautiful, modern alert system
- **JWT Authentication**: Secure user authentication
- **RESTful API**: Well-structured backend API

## 🛠️ Technology Stack

### Frontend
- **HTML5**: Semantic markup and structure
- **CSS3**: Modern styling with Flexbox and Grid
- **JavaScript (ES6+)**: Modern JavaScript with async/await
- **Bootstrap 5.3.2**: Responsive UI framework
- **Bootstrap Icons 1.11.2**: Icon library
- **SweetAlert2 11**: Beautiful alert system

### Backend
- **Node.js**: JavaScript runtime environment
- **Express.js**: Web application framework
- **MySQL**: Relational database
- **JWT**: JSON Web Token authentication
- **CORS**: Cross-origin resource sharing
- **dotenv**: Environment variable management

### Development Tools
- **Git**: Version control
- **npm**: Package management
- **ESLint**: Code linting
- **Postman**: API testing

## 📋 Prerequisites

Before running this application, make sure you have the following installed:

- **Node.js** (v18 or higher)
- **MySQL** (v8.0 or higher)
- **npm** (comes with Node.js)

## 🚀 Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/openbook-backend.git
   cd openbook-backend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   ```
   
   Edit `.env` file with your configuration:
   ```env
   PORT=3000
   DB_HOST=localhost
   DB_USER=your_username
   DB_PASSWORD=your_password
   DB_NAME=openbook_db
   JWT_SECRET=your_jwt_secret_key
   ```

4. **Set up the database**
   ```bash
   # Create database
   mysql -u root -p
   CREATE DATABASE openbook_db;
   USE openbook_db;
   SOURCE public/script.sql;
   ```

5. **Start the application**
   ```bash
   npm start
   ```

6. **Access the application**
   - Frontend: http://localhost:3000
   - API Documentation: http://localhost:3000/api

## 📁 Project Structure

```
openbook-backend/
├── backend/
│   ├── app/
│   │   └── index.js              # Main server file
│   ├── routes/
│   │   ├── auth.routes.js        # Authentication routes
│   │   ├── book.routes.js        # Book management routes
│   │   ├── teacher.routes.js     # Teacher-specific routes
│   │   └── user.routes.js        # User/student routes
│   ├── middleware/
│   │   └── auth.middleware.js    # JWT authentication middleware
│   ├── database/
│   │   └── conexion_db.js        # Database connection
│   └── api/
│       └── sync_openlibrary.js   # External API integration
├── frontend/
│   ├── views/                    # HTML pages
│   ├── styles/                   # CSS files
│   ├── js/                       # JavaScript files
│   │   └── utils/                # Utility functions
│   └── assets/                   # Images and static files
├── public/
│   └── script.sql               # Database schema
├── package.json
└── README.md
```

## 🔌 API Endpoints

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration
- `GET /api/auth/verify` - Verify JWT token

### Books
- `GET /api/books` - Get all books (with search, pagination, sorting)
- `GET /api/books/:id` - Get specific book details
- `GET /api/books/:id/content` - Get book content for reading
- `GET /api/books/genres` - Get available book genres

### User Management
- `GET /api/users/dashboard` - Get user dashboard data
- `GET /api/users/assignments` - Get user's book assignments
- `PUT /api/users/assignments/:id` - Update assignment progress

### Teacher Functions
- `POST /api/teacher/assign` - Assign book to student
- `GET /api/teacher/students` - Get teacher's students
- `GET /api/teacher/assignments` - Get teacher's assignments

## 🎨 UI Components

### SweetAlert2 Integration
The application uses SweetAlert2 for all user interactions:

```javascript
// Success notification
SweetAlertUtils.showSuccess('Operation completed successfully');

// Error notification
SweetAlertUtils.showError('Something went wrong');

// Confirmation dialog
const result = await SweetAlertUtils.showConfirm(
  'Delete Book?',
  'This action cannot be undone'
);

// Loading dialog
const loading = SweetAlertUtils.showLoading('Processing...');
// ... do work
SweetAlertUtils.closeLoading();
```

### Available Alert Types
- **Success**: Green alerts for successful operations
- **Error**: Red alerts for errors and warnings
- **Info**: Blue alerts for informational messages
- **Confirm**: Confirmation dialogs with yes/no options
- **Loading**: Loading spinners for async operations
- **Toast**: Small notifications that auto-dismiss

## 🔐 Authentication

The application uses JWT (JSON Web Tokens) for authentication:

1. **Login**: User provides email/password
2. **Token Generation**: Server generates JWT with user data
3. **Token Storage**: Token stored in localStorage
4. **API Requests**: Token included in Authorization header
5. **Token Verification**: Middleware validates token on protected routes

### Protected Routes
All API endpoints except `/api/auth/*` require authentication.

## 📊 Database Schema

### Main Tables
- **users**: User accounts (students and teachers)
- **books**: Book catalog with metadata
- **book_assignments**: Student-book assignments with progress
- **favorites**: User favorite books

### Key Relationships
- Teachers can assign multiple books to students
- Students can have multiple book assignments
- Progress tracking per assignment
- User roles (student/teacher) determine access

## 🧪 Testing

### API Testing with Postman
Import the provided Postman collection to test all endpoints:

1. **Environment Setup**
   - Create environment variables for `base_url` and `token`
   - Set `base_url` to `http://localhost:3000`

2. **Authentication Flow**
   - Login to get JWT token
   - Use token in subsequent requests

3. **Test Scenarios**
   - Student login and book access
   - Teacher assignment creation
   - Progress updates
   - Book search and filtering

### Manual Testing
1. **Student Flow**
   - Login as student
   - View assigned books
   - Update reading progress
   - Use book reader

2. **Teacher Flow**
   - Login as teacher
   - Assign books to students
   - Monitor student progress
   - Manage assignments

## 🚀 Deployment

### Production Setup
1. **Environment Variables**
   ```env
   NODE_ENV=production
   PORT=3000
   DB_HOST=your_production_db_host
   DB_USER=your_production_db_user
   DB_PASSWORD=your_production_db_password
   DB_NAME=your_production_db_name
   JWT_SECRET=your_secure_jwt_secret
   ```

2. **Database Migration**
   ```bash
   mysql -u username -p database_name < public/script.sql
   ```

3. **Start Application**
   ```bash
   npm start
   ```

### Docker Deployment (Optional)
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
EXPOSE 3000
CMD ["npm", "start"]
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👥 Authors

- **Your Name** - *Initial work* - [YourGitHub](https://github.com/yourusername)

## 🙏 Acknowledgments

- Bootstrap for the UI framework
- SweetAlert2 for beautiful alerts
- OpenLibrary API for book data
- MySQL community for database support

## 📞 Support

For support and questions:
- Create an issue in the GitHub repository
- Email: support@openbook.com
- Documentation: [Wiki](https://github.com/yourusername/openbook-backend/wiki)

---

**OpenBook** - Making reading accessible and engaging for everyone! 📚✨
