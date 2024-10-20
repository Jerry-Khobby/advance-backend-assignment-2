
# User Management and Authentication

A brief description of your application and its purpose.

## Table of Contents

- [Features](#features)
- [Technologies Used](#technologies-used)
- [Installation](#installation)
- [Usage](#usage)
- [API Documentation](#api-documentation)
- [GitHub Authentication](#github-authentication)
- [Contributing](#contributing)
- [License](#license)
- [Contact](#contact)

## Features

- User registration and authentication
- Role management (Admin, User, Guest)
- JWT-based authentication
- OTP verification for secure login
- User profile management
- **GitHub OAuth login for easy authentication**

## Technologies Used

- Node.js
- Express.js
- MongoDB
- Passport.js (for authentication strategies)
- JWT (JSON Web Tokens for authentication)
- Swagger (for API documentation)
- dotenv (for environment variable management)
- [Other libraries/frameworks you are using]

## Installation

Follow these steps to set up the application on your local machine:

1. Clone the repository:
   ```bash
   git clone https://github.com/Jerry-Khobby/advance-backend-assignment-2
   cd advance-backend-assignment-2
   ```

2. Install the required dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file in the root directory and add your environment variables:
   ```env
   PORT=your_port_number
   MONGODB_URI=your_mongodb_uri
   JWT_SECRET=your_jwt_secret
   GITHUB_CLIENT_ID=your_github_client_id
   GITHUB_CLIENT_SECRET=your_github_client_secret
   GITHUB_CALLBACK_URL=http://localhost:your_port_number/auth/github/callback
   EMAIL_PASSWORD=sdkjlasd
   EMAIL_USERNAME=alskd
   OTP_SECRET=ajsdl
   SSL_SECRET_KEY=asldk
   SSL_SECRET_CERT_KEY=asdjlaskd
   ```

4. Start the application:
   ```bash
   npm start
   ```

## Usage

1. **Register a new user**:
   - POST `/auth/register`
   - Request Body:
     ```json
     {
       "name": "John Doe",
       "role": "User",
       "email": "johndoe@example.com",
       "password": "Passw0rd!"
     }
     ```

2. **User Login**:
   - POST `/auth/login`
   - Request Body:
     ```json
     {
       "email": "johndoe@example.com",
       "password": "P@ssword123"
     }
     ```

3. **Verify OTP**:
   - POST `/auth/verifyOtp`
   - Request Body:
     ```json
     {
       "email": "johndoe@example.com",
       "otp": "123456"
     }
     ```

4. **Assign Role (Admin only)**:
   - POST `/auth/assign-role`
   - Request Body:
     ```json
     {
       "userId": "613b6c8b57c2a70016f8d5b4",
       "role": "Admin"
     }
     ```

5. **Get User Profile**:
   - GET `/profile`
   - Headers:
     ```plaintext
     Authorization: Bearer <your_jwt_token>
     ```

6. **Update User Profile**:
   - PUT `/profile`
   - Request Body:
     ```json
     {
       "name": "Jane Doe",
       "email": "janedoe@example.com",
       "password": "NewP@ssw0rd!"
     }
     ```

## GitHub Authentication

This project also supports user authentication using GitHub OAuth. It enables users to log in or register using their GitHub account credentials.

### GitHub Authentication Routes:

1. **Initiate GitHub Login**:
   - GET `/auth/github`
   - This route redirects the user to GitHub to authenticate.

2. **GitHub Callback**:
   - GET `/auth/github/callback`
   - After authentication, GitHub redirects to this route with an authorization code. This route handles the OAuth callback and logs the user in or registers a new user if one does not exist.

3. **GitHub Success**:
   - GET `/auth/github/success`
   - Returns the logged-in user's information after a successful login.

4. **GitHub Error**:
   - GET `/auth/github/error`
   - Returns an error message if the GitHub login process fails.

5. **GitHub Sign Out**:
   - GET `/auth/github/signout`
   - Logs the user out by destroying their session.

### Example Flow:
1. The user clicks a "Login with GitHub" button, which sends a request to `/auth/github`.
2. The user is redirected to GitHub for authentication.
3. After authentication, GitHub redirects back to `/auth/github/callback` where the app processes the login.
4. If successful, the user’s information is returned via `/auth/github/success`.

## API Documentation

For detailed API documentation, visit [Swagger UI](http://localhost:8000/api-docs) after running the app.

## Contributing

1. Fork the repository.
2. Create a new branch (`git checkout -b feature/YourFeature`).
3. Make your changes and commit them (`git commit -m 'Add some feature'`).
4. Push to the branch (`git push origin feature/YourFeature`).
5. Create a new Pull Request.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Contact

Your Name - [your.email@example.com](mailto:jerrymardeburg@gmail.com)

Project Link: [https://github.com/yourusername/your-repo-name](https://github.com/Jerry-Khobby/advance-backend-assignment-2)
