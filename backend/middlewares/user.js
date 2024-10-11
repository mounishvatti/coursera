import pkg from 'jsonwebtoken';
const { verify } = pkg;
import { JWT_USER_PASSWORD } from "../config.js";

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

function userMiddleware(req, res, next) {
    const token = req.headers.token;
    const decoded = verify(token, JWT_USER_PASSWORD);

    if (decoded) {
        req.userId = decoded.id;
        next()
    } else {
        res.status(403).json({
            message: "You are not signed in"
        })
    }

}

export { userMiddleware };