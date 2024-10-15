import jwt from 'jsonwebtoken';
import dotenv from "dotenv";
dotenv.config();
const JWT_SECRET = process.env.JWT_SECRET;

function verifyToken(req, res, next) {
    const token = req.headers.token;
    if (!token) {
        return res.status(401).json({ message: "Unauthorized: No token provided" });
    }
    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        if(decoded){
            req.userId = decoded.id;
        }
        next();
    } catch (err) {
        res.status(401).json({ message: "Unauthorized: Invalid token" });
    }
}

export { verifyToken, JWT_SECRET }

// No longer used - if cookie based auth doesn't work use this!