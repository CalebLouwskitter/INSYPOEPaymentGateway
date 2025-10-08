const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { invalidateToken } = require('../Middleware/authMiddleware.js');
const User = require('../Models/userModel.js');
require('dotenv').config();

// helper method to generate our tokens, that takes in the username and userId
const generateJwt = (username, userId) => {
    // signs it using our secret (that it pulls from .env)
    return jwt.sign(
        { username, userId }, 
        process.env.JWT_SECRET, 
        {
            // set an expiry of 1 hour from signing
            expiresIn: "1h",
        }
    );
};

const register = async (req, res) => {
    try {
        // pull the required information from the incoming request
        const { username, password, email } = req.body;

        // validate input
        if (!username || !password) {
            return res.status(400).json({ message: "Username and password are required" });
        }

        if (password.length < 6) {
            return res.status(400).json({ message: "Password must be at least 6 characters long" });
        }

        // Sanitize username to prevent NoSQL injection
        const sanitizedUsername = String(username).trim();
        
        // before signing the user up, we need to check if their username is already in use
        const exists = await User.findOne().where('username').equals(sanitizedUsername);
        
        // if it is, say no
        if (exists) {
            return res.status(400).json({ message: "Username already exists" });
        }

        // if not, lets hash their password (by providing their password, and the number of random iterations to salt)
        const hashedPassword = await bcrypt.hash(password, 10);
        
        // create the new user with sanitized data
        const newUser = new User({
            username: sanitizedUsername, 
            password: hashedPassword,
            email: email ? String(email).trim() : undefined
        });
        await newUser.save();

        // generate token with user ID
        const token = generateJwt(username, newUser._id);

        res.status(201).json({ 
            message: "User registered successfully",
            token: token,
            user: {
                id: newUser._id,
                username: newUser.username
            }
        });
    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({ message: "Internal server error", error: error.message });
    }
};

const login = async (req, res) => {
    try {
        const { username, password } = req.body;

        // validate input
        if (!username || !password) {
            return res.status(400).json({ message: "Username and password are required" });
        }

        // Sanitize username to prevent NoSQL injection
        const sanitizedUsername = String(username).trim();
        
        // find the user in our collection
        const user = await User.findOne().where('username').equals(sanitizedUsername);
        
        // if the user is not present in our collection, let them know to try again
        if (!user) {
            return res.status(401).json({ message: "Invalid credentials" });
        }

        // next, if the user DOES exist, we compare their entered password to what we have on file
        const matching = await bcrypt.compare(password, user.password);
        
        // if they don't match, say no
        if (!matching) {
            return res.status(401).json({ message: "Invalid credentials" });
        }

        // otherwise, generate a token and log them in
        const token = generateJwt(username, user._id);

        res.status(200).json({ 
            message: "Login successful",
            token: token,
            user: {
                id: user._id,
                username: user.username
            }
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ message: "Internal server error", error: error.message });
    }
};

const logout = async (req, res) => {
    try {
        // strip the header
        const authHeader = req.headers['authorization'];
        
        // check if there is an auth header
        if (!authHeader) {
            return res.status(400).json({ message: "No authorization header provided" });
        }

        // grab the token (Bearer: <token>)
        const token = authHeader.split(" ")[1];
        
        // check if there is indeed a token
        if (!token) {
            return res.status(400).json({ message: "No token provided" });
        }

        // invalidate the token
        invalidateToken(token);
        
        // and log them out
        res.status(200).json({ message: "Logged out successfully" });
    } catch (error) {
        console.error('Logout error:', error);
        res.status(500).json({ message: "Internal server error", error: error.message });
    }
};

module.exports = { register, login, logout };
