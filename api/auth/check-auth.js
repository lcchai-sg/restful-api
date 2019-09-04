const jwt = require('jsonwebtoken');
const config = require('../../config');

// function to authenticate JWT
module.exports = (req, res, next) => {
    try {
        const token = req.headers.authorization;
        const decoded = jwt.verify(token, config.JWT_KEY);
        req.userData = decoded;
        next();
    } catch (err) {
        return res.status(401).json({
            message: 'Auth failed!'
        })
    }
}