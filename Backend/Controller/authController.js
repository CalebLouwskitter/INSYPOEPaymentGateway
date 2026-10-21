const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const crypto = require('node:crypto');
const { invalidateToken } = require('../Middleware/authMiddleware.js');
const User = require('../Models/userModel.js');
require('dotenv').config();

// helper method to generate our tokens, that takes in the fullName and userId
const generateJwt = (fullName, userId) => {
    // signs it using our secret (that it pulls from .env)
    return jwt.sign(
        // type lets the middleware tell customer tokens apart from employee tokens,
        // which are signed with the same secret
        { fullName, userId, type: 'customer' }, 
        process.env.JWT_SECRET, 
        {
            algorithm: 'HS256',
            // set an expiry of 1 hour from signing
            expiresIn: "1h",
        }
    );
};

// Same cost factor as real password hashes (see userModel), so a failed lookup costs the same.
const DUMMY_HASH = bcrypt.hashSync(crypto.randomBytes(16).toString('hex'), 12);

// The client only ever displays the national ID masked, and it ends up in localStorage,
// so send the masked form and keep the full number on the server.
const maskNationalId = (nationalId) => String(nationalId).replace(/\d(?=\d{4})/g, '*');

const register = async (req, res) => {
    try {
        // pull the required information from the incoming request
        const { fullName, accountNumber, nationalId, password } = req.body;

        // Never log the request fields: national ID and account number are personal data,
        // and together with the password they are the login credentials.
        console.log('[AUTH] Registration attempt');

        // validate input
        if (!fullName || !accountNumber || !nationalId || !password) {
            console.log('[AUTH] Registration failed: Missing required fields');
            return res.status(400).json({ message: "Full name, account number, national ID, and password are required" });
        }

        if (password.length < 8) {
            console.log('[AUTH] Registration failed: Password too short');
            return res.status(400).json({ message: "Password must be at least 8 characters long" });
        }

        // Validate account number format (10 digits)
        if (!/^\d{10}$/.test(accountNumber)) {
            console.log('[AUTH] Registration failed: Invalid account number format');
            return res.status(400).json({ message: "Account number must be exactly 10 digits" });
        }

        // Validate national ID format (13 digits)
        if (!/^\d{13}$/.test(nationalId)) {
            console.log('[AUTH] Registration failed: Invalid national ID format');
            return res.status(400).json({ message: "National ID must be exactly 13 digits" });
        }

        // Sanitize inputs to prevent NoSQL injection
        const sanitizedFullName = String(fullName).trim();
        const sanitizedAccountNumber = String(accountNumber).trim();
        const sanitizedNationalId = String(nationalId).trim();
        
        // before signing the user up, we need to check if their account number is already in use
        const exists = await User.findOne().where('accountNumber').equals(sanitizedAccountNumber);
        
        // if it is, say no
        if (exists) {
            console.log('[AUTH] Registration failed: Account number already exists');
            return res.status(400).json({ message: "Account number already exists" });
        }

        const nationalIdExists = await User.findOne().where('nationalId').equals(sanitizedNationalId);

        if (nationalIdExists) {
            console.log('[AUTH] Registration failed: National ID already exists');
            return res.status(400).json({ message: "National ID already exists" });
        }

        // create the new user with sanitized data (model will hash password)
        const newUser = new User({
            fullName: sanitizedFullName,
            accountNumber: sanitizedAccountNumber,
            nationalId: sanitizedNationalId,
            password: password,
            // email removed from model; no email stored
        });
        await newUser.save();

        console.log('[AUTH] User registered successfully:', { id: newUser._id });

        // generate token with user ID
        const token = generateJwt(newUser.fullName, newUser._id);

        res.status(201).json({ 
            message: "User registered successfully",
            token: token,
            user: {
                id: newUser._id,
                fullName: newUser.fullName,
                accountNumber: newUser.accountNumber,
                nationalId: maskNationalId(newUser.nationalId)
            }
        });
    } catch (error) {
        // a duplicate-key error message would contain the national ID, so log only its type
        console.error('[AUTH] Registration error:', error.name, error.code);
        res.status(500).json({ message: "Internal server error" });
    }
};

const login = async (req, res) => {
    try {
        const { fullName, accountNumber, nationalId, password } = req.body;

        console.log('[AUTH] Login attempt');

        // validate input
        if (!fullName || !accountNumber || !nationalId || !password) {
            console.log('[AUTH] Login failed: Missing required fields');
            return res.status(400).json({ message: "Full name, account number, national ID, and password are required" });
        }

        // Validate account number format (10 digits)
        if (!/^\d{10}$/.test(accountNumber)) {
            console.log('[AUTH] Login failed: Invalid account number format');
            return res.status(400).json({ message: "Account number must be exactly 10 digits" });
        }

        if (!/^\d{13}$/.test(nationalId)) {
            console.log('[AUTH] Login failed: Invalid national ID format');
            return res.status(400).json({ message: "National ID must be exactly 13 digits" });
        }

        // Sanitize inputs to prevent NoSQL injection
        const sanitizedFullName = String(fullName).trim();
        const sanitizedAccountNumber = String(accountNumber).trim();
        const sanitizedNationalId = String(nationalId).trim();
        
        // find the user in our collection by both fullName and accountNumber
        const user = await User.findOne({
            fullName: sanitizedFullName,
            accountNumber: sanitizedAccountNumber,
            nationalId: sanitizedNationalId
        });
        
        // compare the password even when there is no such user, against a dummy hash, so the
        // response takes as long either way and its timing does not reveal which accounts exist
        const matching = user
            ? await user.comparePassword(password)
            : await bcrypt.compare(password, DUMMY_HASH).then(() => false);

        // if the user is not present in our collection, let them know to try again
        if (!user) {
            console.log('[AUTH] Login failed: User not found');
            return res.status(401).json({ message: "Invalid credentials" });
        }
        
        // if they don't match, say no
        if (!matching) {
            console.log('[AUTH] Login failed: Invalid password');
            return res.status(401).json({ message: "Invalid credentials" });
        }

        console.log('[AUTH] User logged in successfully:', { id: user._id });

        // otherwise, generate a token and log them in
        const token = generateJwt(user.fullName, user._id);

        res.status(200).json({ 
            message: "Login successful",
            token: token,
            user: {
                id: user._id,
                fullName: user.fullName,
                accountNumber: user.accountNumber,
                nationalId: maskNationalId(user.nationalId)
            }
        });
    } catch (error) {
        console.error('[AUTH] Login error:', error.name, error.code);
        res.status(500).json({ message: "Internal server error" });
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
        res.status(500).json({ message: "Internal server error" });
    }
};

module.exports = { register, login, logout };
