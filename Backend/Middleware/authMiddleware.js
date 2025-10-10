const jwt = require('jsonwebtoken');
require('dotenv').config();


// References:
// Auth0. (2025) jsonwebtoken - npm. Available at: https://www.npmjs.com/package/jsonwebtoken (Accessed: 07 October 2025).


// create a blacklist of tokens we have invalidated
const tokenBlacklist = new Set();

const verifyToken = (req, res, next) => {
    // strip the header (grab the auth field from the header)
    // Auth0. (2025)
    const authHeader = req.headers["authorization"];

    // we split after the space, as standard auth headers look like the following:
    // Bearer: <token> (and we just want the token aspect)
    // Auth0. (2025)
    const token = authHeader && authHeader.split(" ")[1];

    // if no token, 401 unauthorized
    if (!token) return res.status(401).json({message: "No token provided"});
    
    // if a token that has been logged out, 401 unauthorized
    if (tokenBlacklist.has(token)) return res.status(401).json({message: "Token has been invalidated"});
    // Auth0. (2025)
    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
        // 403 - forbidden
        if (err) return res.status(403).json({message: "Invalid or expired token"});
        
        // attach the decoded user information to the request object
        req.user = decoded;
        next();
    });
};

const invalidateToken = (token) => {
    tokenBlacklist.add(token);
};

module.exports = { verifyToken, invalidateToken };
