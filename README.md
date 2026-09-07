# URL Shortener API

A simple RESTful URL Shortener API built with TypeScript, Node.js, Express, and PostgreSQL.

Users can register and log in, create short URLs, manage their own URLs, and redirect short codes to original URLs. Authentication is handled using JWT and passwords are securely hashed using bcrypt.

## Features

- User registration and login
- JWT-based authentication
- Password hashing with bcrypt
- Create short URLs
- Get all URLs belonging to the logged-in user
- Get a single URL
- Update a URL
- Delete a URL
- Redirect short codes to original URLs
- User-level authorization
- PostgreSQL database with foreign-key relationships
- Parameterized SQL queries to prevent SQL injection
- Environment-based configuration

## Tech Stack

- **TypeScript** — Type safety
- **Node.js** — JavaScript runtime
- **Express.js** — REST API framework
- **PostgreSQL** — Relational database
- **Supabase** — Hosted PostgreSQL
- **pg** — PostgreSQL client for Node.js
- **JWT** — Authentication
- **bcrypt** — Password hashing
- **dotenv** — Environment variables
- **Thunder Client** — API testing

## Architecture

```text
Client
  ↓
Express Server
  ↓
Routes
  ↓
Authentication Middleware
  ↓
Controllers
  ↓
pg / SQL Queries
  ↓
PostgreSQL (Supabase)
  ↓
Response
```

### Authentication Flow

```text
Login
  ↓
Verify email
  ↓
Compare password with bcrypt
  ↓
Generate JWT
  ↓
Return token
  ↓
Client sends:
Authorization: Bearer <token>
  ↓
Auth Middleware verifies JWT
  ↓
Controller receives authenticated userId
```

## Project Structure

```text
url-shortener/
├── src/
│   ├── controllers/
│   │   ├── auth.controller.ts
│   │   └── url.controller.ts
│   │
│   ├── routes/
│   │   ├── auth.routes.ts
│   │   └── url.routes.ts
│   │
│   ├── middleware/
│   │   └── auth.middleware.ts
│   │
│   ├── db/
│   │   └── index.ts
│   │
│   ├── app.ts
│   └── server.ts
│
├── dist/
├── .env
├── .env.example
├── .gitignore
├── package.json
├── tsconfig.json
└── README.md
```

## Database Schema

The project uses two tables.

### users

```sql
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

### urls

```sql
CREATE TABLE urls (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id),
    original_url TEXT NOT NULL,
    short_code TEXT UNIQUE NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

Relationship:

```text
users
  │
  │ 1
  │
  │ N
  ▼
urls
```

One user can own multiple URLs.

## Environment Variables

Create a `.env` file:

```env
DATABASE_URL=your_supabase_database_url
JWT_SECRET=your_jwt_secret
PORT=3000
```

Never commit `.env` to Git.

The `.env.example` file can contain:

```env
DATABASE_URL=
JWT_SECRET=
PORT=3000
```

## Installation

Install dependencies:

```bash
npm install
```

Compile TypeScript:

```bash
npx tsc
```

Start the server:

```bash
node dist/server.js
```

The API will run on:

```text
http://localhost:3000
```

## API Endpoints

### Authentication

| Method | Endpoint             | Authentication | Description           |
| ------ | -------------------- | -------------- | --------------------- |
| POST   | `/api/auth/register` | No             | Register a new user   |
| POST   | `/api/auth/login`    | No             | Login and receive JWT |

### URL Management

| Method | Endpoint        | Authentication | Description        |
| ------ | --------------- | -------------- | ------------------ |
| POST   | `/api/urls`     | Yes            | Create a short URL |
| GET    | `/api/urls`     | Yes            | Get user's URLs    |
| GET    | `/api/urls/:id` | Yes            | Get one URL        |
| PUT    | `/api/urls/:id` | Yes            | Update a URL       |
| DELETE | `/api/urls/:id` | Yes            | Delete a URL       |

### Redirect

| Method | Endpoint      | Authentication | Description              |
| ------ | ------------- | -------------- | ------------------------ |
| GET    | `/:shortCode` | No             | Redirect to original URL |

## API Usage

### 1. Register

```http
POST /api/auth/register
Content-Type: application/json
```

Request:

```json
{
  "email": "user@example.com",
  "password": "12345678"
}
```

Response:

```json
{
  "id": "uuid",
  "email": "user@example.com",
  "created_at": "timestamp"
}
```

The password is never returned.

### 2. Login

```http
POST /api/auth/login
Content-Type: application/json
```

Request:

```json
{
  "email": "user@example.com",
  "password": "12345678"
}
```

Response:

```json
{
  "token": "jwt-token"
}
```

### 3. Create Short URL

```http
POST /api/urls
Authorization: Bearer <token>
Content-Type: application/json
```

Request:

```json
{
  "originalUrl": "https://www.youtube.com/"
}
```

Response:

```json
{
  "id": "uuid",
  "original_url": "https://www.youtube.com/",
  "short_code": "aB3xYz",
  "created_at": "timestamp"
}
```

### 4. Get User's URLs

```http
GET /api/urls
Authorization: Bearer <token>
```

Returns only URLs belonging to the authenticated user.

### 5. Get One URL

```http
GET /api/urls/:id
Authorization: Bearer <token>
```

### 6. Update URL

```http
PUT /api/urls/:id
Authorization: Bearer <token>
Content-Type: application/json
```

Request:

```json
{
  "originalUrl": "https://github.com/"
}
```

The existing `short_code` remains unchanged.

### 7. Delete URL

```http
DELETE /api/urls/:id
Authorization: Bearer <token>
```

### 8. Redirect

Open:

```text
http://localhost:3000/:shortCode
```

For example:

```text
http://localhost:3000/aB3xYz
```

The server looks up the short code and redirects the user to the original URL.

## Authentication vs Authorization

The API uses both authentication and authorization.

### Authentication

Authentication answers:

> "Who are you?"

The client sends a JWT:

```text
Authorization: Bearer <token>
```

The authentication middleware verifies the token and extracts the user's ID.

### Authorization

Authorization answers:

> "Are you allowed to access this resource?"

For example:

```sql
SELECT *
FROM urls
WHERE id = $1 AND user_id = $2;
```

This ensures a user can only access their own URLs.

A user cannot update or delete another user's URL.

## Security

### Password Hashing

Passwords are never stored directly.

```text
Plain Password
      ↓
bcrypt.hash()
      ↓
Password Hash
      ↓
Database
```

During login:

```text
Password
    ↓
bcrypt.compare()
    ↓
Valid / Invalid
```

### JWT Authentication

Protected endpoints require a valid JWT.

Invalid or expired tokens return:

```text
401 Unauthorized
```

### Parameterized SQL

Database queries use parameters:

```sql
WHERE email = $1
```

instead of directly inserting user input into SQL strings.

This helps prevent SQL injection.

### Authorization

Database queries include the authenticated user's ID:

```sql
WHERE id = $1 AND user_id = $2
```

This prevents users from accessing other users' URLs.

## HTTP Status Codes

| Status | Meaning                         |
| ------ | ------------------------------- |
| 200    | Request successful              |
| 201    | Resource created                |
| 400    | Invalid request                 |
| 401    | Authentication required/invalid |
| 404    | Resource not found              |
| 500    | Internal server error           |

## Testing

The API was tested using Thunder Client.

The complete flow tested includes:

1. Health check
2. User registration
3. User login
4. JWT authentication
5. Create URL
6. Get all URLs
7. Get one URL
8. Update URL
9. Redirect using short code
10. Delete URL
11. Invalid/missing JWT
12. Accessing another user's URL

## Request Flow Example

For creating a URL:

```text
POST /api/urls
       ↓
Express Router
       ↓
authenticate middleware
       ↓
Verify JWT
       ↓
Extract userId
       ↓
createUrl controller
       ↓
Generate shortCode
       ↓
Parameterized SQL query
       ↓
PostgreSQL
       ↓
Return created URL
       ↓
201 Created
```

## Why PostgreSQL?

PostgreSQL was chosen because the application has structured relational data:

```text
User → URLs
```

The foreign key between `users` and `urls` ensures data integrity and makes ownership relationships explicit.

## Why `pg` instead of an ORM?

This project intentionally uses `pg` with raw SQL because it is a small MVP.

Using raw SQL makes the following concepts easier to understand:

- SQL queries
- Parameters
- Constraints
- Transactions
- Connection pooling
- Database responses

For a larger application, an ORM could be introduced if it provides meaningful productivity benefits.

## Future Improvements

Possible production-level improvements:

- Redis caching for frequently accessed short URLs
- Rate limiting
- URL validation
- Better request validation
- Refresh tokens
- Token revocation
- Centralized error handling
- Database indexes
- Background jobs
- Analytics and click tracking
- Docker containerization
- Automated tests
- API documentation with OpenAPI/Swagger

These features are intentionally outside the scope of this basic MVP.

## Learning Goals

This project was built to understand and practice:

- TypeScript
- Node.js
- Express.js
- REST APIs
- HTTP methods and status codes
- PostgreSQL
- SQL
- `pg`
- Connection pooling
- Parameterized queries
- JWT authentication
- bcrypt password hashing
- Authentication vs authorization
- Middleware
- CRUD operations
- Relational database design
- Basic backend security

## License

This project is for learning and portfolio purposes.
