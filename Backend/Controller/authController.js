const jwt = require('jsonwebtoken');
const { invalidateToken } = require('../Middleware/authMiddleware.js');
const User = require('../Models/userModel.js');
require('dotenv').config();

// helper method to generate our tokens, that takes in the fullName and userId
const generateJwt = (fullName, userId) => {
    // signs it using our secret (that it pulls from .env)
    return jwt.sign(
        { fullName, userId }, 
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
    const { fullName, accountNumber, password } = req.body;

        console.log('[AUTH] Registration attempt:', { fullName, accountNumber, hasPassword: !!password });

        // validate input
        if (!fullName || !accountNumber || !password) {
            console.log('[AUTH] Registration failed: Missing required fields');
            return res.status(400).json({ message: "Full name, account number, and password are required" });
        }

        if (password.length < 6) {
            console.log('[AUTH] Registration failed: Password too short');
            return res.status(400).json({ message: "Password must be at least 6 characters long" });
        }

        // Validate account number format (10 digits)
        if (!/^\d{10}$/.test(accountNumber)) {
            console.log('[AUTH] Registration failed: Invalid account number format');
            return res.status(400).json({ message: "Account number must be exactly 10 digits" });
        }

        // Sanitize inputs to prevent NoSQL injection
        const sanitizedFullName = String(fullName).trim();
        const sanitizedAccountNumber = String(accountNumber).trim();
        
        // before signing the user up, we need to check if their account number is already in use
        const exists = await User.findOne().where('accountNumber').equals(sanitizedAccountNumber);
        
        // if it is, say no
        if (exists) {
            console.log('[AUTH] Registration failed: Account number already exists');
            return res.status(400).json({ message: "Account number already exists" });
        }

        // create the new user with sanitized data (model will hash password)
        const newUser = new User({
            fullName: sanitizedFullName,
            accountNumber: sanitizedAccountNumber,
            password: password,
            // email removed from model; no email stored
        });
        await newUser.save();

        console.log('[AUTH] User registered successfully:', { id: newUser._id, fullName: newUser.fullName, accountNumber: newUser.accountNumber });

        // generate token with user ID
        const token = generateJwt(newUser.fullName, newUser._id);

        res.status(201).json({ 
            message: "User registered successfully",
            token: token,
            user: {
                id: newUser._id,
                fullName: newUser.fullName,
                accountNumber: newUser.accountNumber
            }
        });
    } catch (error) {
        console.error('[AUTH] Registration error:', error);
        res.status(500).json({ message: "Internal server error", error: error.message });
    }
};

const login = async (req, res) => {
    try {
        const { fullName, accountNumber, password } = req.body;

        console.log('[AUTH] Login attempt:', { fullName, accountNumber, hasPassword: !!password });

        // validate input
        if (!fullName || !accountNumber || !password) {
            console.log('[AUTH] Login failed: Missing required fields');
            return res.status(400).json({ message: "Full name, account number, and password are required" });
        }

        // Validate account number format (10 digits)
        if (!/^\d{10}$/.test(accountNumber)) {
            console.log('[AUTH] Login failed: Invalid account number format');
            return res.status(400).json({ message: "Account number must be exactly 10 digits" });
        }

        // Sanitize inputs to prevent NoSQL injection
        const sanitizedFullName = String(fullName).trim();
        const sanitizedAccountNumber = String(accountNumber).trim();
        
        // find the user in our collection by both fullName and accountNumber
        const user = await User.findOne({
            fullName: sanitizedFullName,
            accountNumber: sanitizedAccountNumber
        });
        
        // if the user is not present in our collection, let them know to try again
        if (!user) {
            console.log('[AUTH] Login failed: User not found');
            return res.status(401).json({ message: "Invalid credentials" });
        }

        // next, if the user DOES exist, we compare their entered password to what we have on file
    const matching = await user.comparePassword(password);
        
        // if they don't match, say no
        if (!matching) {
            console.log('[AUTH] Login failed: Invalid password');
            return res.status(401).json({ message: "Invalid credentials" });
        }

        console.log('[AUTH] User logged in successfully:', { id: user._id, fullName: user.fullName });

        // otherwise, generate a token and log them in
        const token = generateJwt(user.fullName, user._id);

        res.status(200).json({ 
            message: "Login successful",
            token: token,
            user: {
                id: user._id,
                fullName: user.fullName,
                accountNumber: user.accountNumber
            }
        });
    } catch (error) {
        console.error('[AUTH] Login error:', error);
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
