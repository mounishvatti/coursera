import jwt from "jsonwebtoken";
import { JWT_ADMIN_PASSWORD } from "../config.js";

// function middleware(password) {
//     return function(req, res, next) {
//         const token = req.headers.token;
//         const decoded = jwt.verify(token, password);

//         if (decoded) {
//             req.userId = decoded.id;
//             next()
//         } else {
//             res.status(403).json({
//                 message: "You are not signed in"
//             })
//         }    
//     }
// }

function adminMiddleware(req, res, next) {
    const token = req.cookies.authToken;
    if (!token) {
        return res.status(401).json({ message: "Not authenticated" });
    }
    try{
        const decoded = jwt.verify(token, JWT_ADMIN_PASSWORD);
        req.user = decoded;
        next();
    } catch (err) {
        res.status(403).json({ message: "Invalid or expired token" });
    }
};

export { adminMiddleware }