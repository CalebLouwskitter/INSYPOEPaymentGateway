// calling in express to use its methods and functionality
const express = require('express');

const { register, login, logout } = require('../Controller/authController.js');
const { verifyToken } = require('../Middleware/authMiddleware.js');
const { loginLimiter, registerLimiter } = require('../Middleware/rateLimitMiddleware.js');
const { validateRegister, validateLogin } = require('../Middleware/validationMiddleware.js');

const router = express.Router();

// login and register are POST requests with rate limiting and validation
// this is because we require the username and password from the user
router.post('/register', registerLimiter, validateRegister, register);
router.post('/login', loginLimiter, validateLogin, login);

// logout is a POST request that requires authentication
// we verify the token before allowing the user to logout
router.post('/logout', verifyToken, logout);

module.exports = router;
