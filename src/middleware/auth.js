require('dotenv').config();
const jwt = require('jsonwebtoken');

function verify_token(req, res, next) {
    const token = req.headers.authorization.split(' ')[1];
    if (!token) {
        return res.status(401).json({msg: "No token, authorization denied"});
    } else {
        jwt.verify(token, process.env.SECRET, (err, decoded) => {
            if (err) {
                return res.status(401).json({msg: "Token is not valid"});
            }
            req.email = decoded.email;
            next();
        })
    }
}

module.exports = verify_token;