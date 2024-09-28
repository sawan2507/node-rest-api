# Node Auth REST API

## Version: v1.0

This is a simple authentication REST API built with Node.js. It uses JSON Web Tokens (JWT) for user authentication and bcrypt for password hashing.

### Prerequisites

Make sure you have Node.js installed on your machine. You can download it from the following link:

- [Node.js](https://nodejs.org/en)

### Installation

1. Clone the repository:

   ```bash
   git clone <repository-url>
   cd <repository-directory>

2. Install the required dependencies:
   
   ```bash 
   npm install jsonwebtoken bcryptjs

3. Set up your environment variables:

    Rename the .env.local file to .env.
    Fill in the necessary environment variables, including your JWT secret and database connection details.

# API Endpoints
    POST /register: Register a new user.
    POST /login: Authenticate a user and return a JWT token.
    GET /profile:id : Access a protected route (requires authentication).
    
    Usage
        To register a new user, send a POST request to /register with the user details in the request body.
        To log in, send a POST request to /login with the user's email and password.
        Include the JWT token in the Authorization header as Bearer <token> for accessing protected routes.

# Example
Here’s an example of how to make a request to the login endpoint using curl:

curl -X POST http://localhost:<port>/login \
-H "Content-Type: application/json" \
-d '{"email": "user@example.com", "password": "yourpassword"}'