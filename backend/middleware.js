const { JWT_SECRET } = require("./config");
const jwt = require("jsonwebtoken");

const authMiddleware = (req, res, next) => {
    const authHeader = req.headers.authorization;

    // Check if the Authorization header is present and correctly formatted
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(403).json({
            msg : "You are not valid user"
        });
    }

    const token = authHeader.split(' ')[1];

    try {
        // Verify the token using the JWT_SECRET
        const decoded = jwt.verify(token, JWT_SECRET);

        // Store the userId from the token into req.userId for use in later middleware/routes
        req.userId = decoded.userId; 

        next(); // Call the next middleware or route handler
    } catch (err) {
        return res.status(403).json({
            msg : "you are not valid user"
        });
    }
};

module.exports = {
    authMiddleware
}