const jwt = require("jsonwebtoken");
require('dotenv').config()
const JWT_SECRET = process.env.JWT_SECRET;

function verifyToken(req, res, next) {
    const token = req.headers.token;
    if (!token) {
        return res.status(401).json({ message: "Unauthorized" });
    }
    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        if(decoded){
            req.userId = decoded.id;
        }
        next();
    } catch (err) {
        res.status(401).json({ message: "Unauthorized" });
    }
}

module.exports = {
    verifyToken,
    JWT_SECRET
}