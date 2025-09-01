# OpenBook API Documentation

Complete API documentation for the OpenBook digital library platform.

## Base URL
```
http://localhost:3000/api
```

## Authentication

All API endpoints (except authentication) require a valid JWT token in the Authorization header:

```
Authorization: Bearer <your_jwt_token>
```

## Endpoints

### Authentication

#### POST /auth/register
Register a new user.

**Request Body:**
```json
{
  "full_name": "John Doe",
  "email": "john.doe@estudiante.edu.co",
  "password": "Password123",
  "institution_name": "Universidad Nacional",
  "role": "student"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Usuario registrado exitosamente",
  "data": {
    "user": {
      "user_id": 1,
      "full_name": "John Doe",
      "email": "john.doe@estudiante.edu.co",
      "role": "student",
      "institution_name": "Universidad Nacional"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

#### POST /auth/login
Login with email and password.

**Request Body:**
```json
{
  "email": "carlos.ruiz@estudiante.edu.co",
  "password": "Password123"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Login exitoso",
  "data": {
    "user": {
      "user_id": 5,
      "full_name": "Carlos Ruiz",
      "email": "carlos.ruiz@estudiante.edu.co",
      "role": "student"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

#### GET /auth/verify
Verify JWT token and get user information.

**Response:**
```json
{
  "success": true,
  "data": {
    "user": {
      "user_id": 5,
      "full_name": "Carlos Ruiz",
      "email": "carlos.ruiz@estudiante.edu.co",
      "role": "student"
    }
  }
}
```

### Books

#### GET /books
Get all books with optional search, pagination, and sorting.

**Query Parameters:**
- `search` (optional): Search term for title or author
- `limit` (optional): Number of books to return (default: 1000)
- `offset` (optional): Number of books to skip (default: 0)
- `sort` (optional): Sort order in format `field-direction` (default: title-asc)

**Example Request:**
```
GET /books?search=harry&limit=10&offset=0&sort=title-asc
```

**Response:**
```json
{
  "success": true,
  "data": {
    "books": [
      {
        "book_id": 1,
        "title": "Harry Potter and the Philosopher's Stone",
        "author": "J.K. Rowling",
        "cover_url": "https://example.com/cover.jpg",
        "publication_year": 1997,
        "description": "The first book in the Harry Potter series",
        "created_at": "2024-01-01T00:00:00.000Z"
      }
    ]
  }
}
```

#### GET /books/:id
Get detailed information about a specific book.

**Response:**
```json
{
  "success": true,
  "data": {
    "book": {
      "book_id": 1,
      "title": "Harry Potter and the Philosopher's Stone",
      "author": "J.K. Rowling",
      "cover_url": "https://example.com/cover.jpg",
      "publication_year": 1997,
      "description": "The first book in the Harry Potter series",
      "genre": "Fantasy",
      "created_at": "2024-01-01T00:00:00.000Z"
    }
  }
}
```

#### GET /books/:id/content
Get book content for reading (only accessible if assigned).

**Response:**
```json
{
  "success": true,
  "data": {
    "book": {
      "id": 1,
      "title": "Harry Potter and the Philosopher's Stone",
      "author": "J.K. Rowling",
      "cover": "https://example.com/cover.jpg",
      "published_year": 1997,
      "description": "The first book in the Harry Potter series",
      "content": "<h1>Chapter 1</h1><p>The boy who lived...</p>"
    },
    "assignment": {
      "assignment_id": 1
    }
  }
}
```

#### GET /books/genres
Get all available book genres.

**Response:**
```json
{
  "success": true,
  "data": [
    "Fantasy",
    "Science Fiction",
    "Mystery",
    "Romance",
    "Non-fiction"
  ]
}
```

### User Management

#### GET /users/dashboard
Get user dashboard data.

**Response:**
```json
{
  "success": true,
  "data": {
    "user": {
      "user_id": 5,
      "full_name": "Carlos Ruiz",
      "email": "carlos.ruiz@estudiante.edu.co",
      "role": "student",
      "institution_name": "Universidad Nacional"
    },
    "stats": {
      "total_books": 6,
      "completed_books": 2,
      "in_progress_books": 3,
      "pending_books": 1
    },
    "recent_activity": [
      {
        "book_title": "Don Quijote",
        "progress": 35,
        "updated_at": "2024-01-15T10:30:00.000Z"
      }
    ]
  }
}
```

#### GET /users/assignments
Get all book assignments for the current user.

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "assignment_id": 1,
      "book_id": 1,
      "bookTitle": "Don Quijote de la Mancha",
      "author": "Miguel de Cervantes",
      "cover_url": "https://example.com/cover.jpg",
      "published_year": 1605,
      "status": "in_progress",
      "progress": 35,
      "assignment_date": "2024-01-01T00:00:00.000Z",
      "last_updated": "2024-01-15T10:30:00.000Z",
      "teacherName": "Profesor"
    }
  ]
}
```

#### PUT /users/assignments/:id
Update reading progress for a specific assignment.

**Request Body:**
```json
{
  "progress": 75
}
```

**Response:**
```json
{
  "success": true,
  "message": "Progreso actualizado correctamente",
  "data": {
    "assignment_id": 1,
    "progress": 75,
    "status": "in_progress",
    "last_updated": "2024-01-15T10:30:00.000Z"
  }
}
```

### Teacher Functions

#### POST /teacher/assign
Assign a book to a student (teachers only).

**Request Body:**
```json
{
  "studentEmail": "carlos.ruiz@estudiante.edu.co",
  "bookId": 1
}
```

**Response:**
```json
{
  "success": true,
  "message": "Libro asignado exitosamente",
  "data": {
    "assignment_id": 1,
    "student_id": 5,
    "book_id": 1,
    "status": "pending",
    "progress": 0,
    "assignment_date": "2024-01-15T10:30:00.000Z"
  }
}
```

#### GET /teacher/students
Get all students assigned to the current teacher.

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "user_id": 5,
      "full_name": "Carlos Ruiz",
      "email": "carlos.ruiz@estudiante.edu.co",
      "institution_name": "Universidad Nacional",
      "total_assignments": 3,
      "completed_assignments": 1
    }
  ]
}
```

#### GET /teacher/assignments
Get all assignments created by the current teacher.

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "assignment_id": 1,
      "student_name": "Carlos Ruiz",
      "student_email": "carlos.ruiz@estudiante.edu.co",
      "book_title": "Don Quijote de la Mancha",
      "book_author": "Miguel de Cervantes",
      "status": "in_progress",
      "progress": 35,
      "assignment_date": "2024-01-01T00:00:00.000Z",
      "last_updated": "2024-01-15T10:30:00.000Z"
    }
  ]
}
```

## Error Responses

### 400 Bad Request
```json
{
  "success": false,
  "message": "Invalid request data"
}
```

### 401 Unauthorized
```json
{
  "success": false,
  "message": "No token provided"
}
```

### 403 Forbidden
```json
{
  "success": false,
  "message": "Access denied"
}
```

### 404 Not Found
```json
{
  "success": false,
  "message": "Resource not found"
}
```

### 500 Internal Server Error
```json
{
  "success": false,
  "message": "Internal server error"
}
```

## Status Codes

| Code | Description |
|------|-------------|
| 200 | Success |
| 201 | Created |
| 400 | Bad Request |
| 401 | Unauthorized |
| 403 | Forbidden |
| 404 | Not Found |
| 500 | Internal Server Error |

## Data Types

### User Roles
- `student`: Student user with access to assigned books
- `teacher`: Teacher user with ability to assign books

### Assignment Status
- `pending`: Book assigned but not started
- `in_progress`: Book currently being read
- `completed`: Book finished reading
- `overdue`: Book past due date

### Progress
- Integer value from 0 to 100 representing reading progress percentage

## Rate Limiting

Currently, there are no rate limits implemented. However, it's recommended to:
- Limit requests to reasonable frequencies
- Implement proper error handling
- Cache responses when appropriate

## Testing

Use the provided Postman collection (`docs/OpenBook_API.postman_collection.json`) to test all endpoints:

1. Import the collection into Postman
2. Set environment variables:
   - `base_url`: `http://localhost:3000`
   - `token`: (will be automatically set after login)
3. Run the authentication flow first
4. Test other endpoints with the generated token

## Support

For API support and questions:
- Create an issue in the GitHub repository
- Email: api-support@openbook.com
- Documentation: [Wiki](https://github.com/yourusername/openbook-backend/wiki)
