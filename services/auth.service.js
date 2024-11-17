const jwt = require('jsonwebtoken')


const createUserToken=(user)=>{
    const payload = {
        id: user._id,
        username: user.username,
        email: user.email,
        password: user.password,
    }

    return jwt.sign(payload, process.env.JWT_SECRET)
    
}

const verifyToken = (token)=>{
 return jwt.verify(token, process.env.JWT_SECRET)
}

module.exports = {
    createUserToken,
    verifyToken,
}