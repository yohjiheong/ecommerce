const jwt = require('jsonwebtoken')
require('dotenv').config()

module.exports = (req, res, next) => {
    const token = req.header('x-auth-token')

    if(!token) return res.status(401).json({msg: "Unauthorized!"})
    
    // verify token
    try {
        const decoded = jwt.verify(token, process.env.SECRET_KEY)
        req.user = decoded
        next() // do the next on your right 
        // (track back to products.js after check auth in add product, do the next function)
    } catch(err) {
        return res.status(401).json({err})
    }
}

