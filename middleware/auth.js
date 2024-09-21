const jwt = require('jsonwebtoken');
const JWT_SECRET = 'Aderemi';

module.exports = function(req, res, next) {
    const authHeader = req.header('Authorization');

    if (!authHeader) {
        return res.status(401).json({ msg: 'No Authorization header, authorization denied' });
    }

    const token = authHeader.split(' ')[1];
    if (!token) {
        return res.status(401).json({ msg: 'No token, authorization denied' });
    }

    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        req.user = decoded.user; // Set user information for future use
        next();
    } catch (err) {
        return res.status(401).json({ msg: 'Token is not valid' });
    }
};