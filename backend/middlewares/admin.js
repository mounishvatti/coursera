import jwt from "jsonwebtoken";
import dotenv from "dotenv";
dotenv.config();

function adminMiddleware(req, res, next) {
  const token = req.cookies.token; // Get JWT from cookie

  if (!token) {
    return res
      .status(401)
      .json({ message: "Access denied. No token provided" });
  } else {
    try {
      const decoded = jwt.verify(token, process.env.JWT_ADMIN_PASSWORD);
      req.user = decoded;
      next();
    } catch (err) {
      res.status(403).json({ message: "Invalid or expired token" });
    }
  }

  // ----- Manually parsing the headers -------

  // return function (req, res, next) {
  //   const token = req.headers.token;
  //   const decoded = jwt.verify(token, password);

  //   if (decoded) {
  //     req.userId = decoded.id;
  //     next();
  //   } else {
  //     res.status(403).json({
  //       message: "You are not signed in",
  //     });
  //   }
  // };
}

export { adminMiddleware };
