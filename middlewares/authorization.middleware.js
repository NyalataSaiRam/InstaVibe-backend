const { verifyToken } = require("../services/auth.service");

const verifyUser = (req, res, next) => {
    const authHeaders = req.headers['authorization'];
    const token = authHeaders.split(' ')[1];

    try {
        const user = verifyToken(token)
        req.user = user;
        next()
    } catch (error) {
        res.status(401).json({error: "You are not Authorized"})
    }
    
}

module.exports = verifyUser
