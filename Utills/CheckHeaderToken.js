const logger = require('../Utills/Logger')
const jwt = require('jsonwebtoken')

const checkAccessToken = (req, res, next) => {
    try {
        let header = req.headers["authorization"]

        if (!header) {
            logger.error('Auth Token not found')
            return res.status(401).json({
                message: 'Authorization header missing',
                errorCode: 1
            })
        }

        let token = header.split(' ')[1]

        if (!token) {
            logger.error('Token not found')
            return res.status(401).json({
                message: 'Token missing',
                errorCode: 1
            })
        }


        jwt.verify(token, process.env.JWT_TOKEN, (err, data) => {
            if (err) {
                logger.error('Checking Header')
                return res.status(403).json({
                    message: 'Invalid or expired token',
                    errorCode: 1
                })
            } else {
                console.log(data, '===== In check header token ====')
                req.user = data
                next()
            }

        })
    }
    catch (err) {
        logger.error('Checking Header Internal server occured!', err)
        return res.status(500).json({
            message: 'Internal server error occured!',
            errorCode: 1
        })
    }
}


// middleware/checkRole.js
function checkRole(roles = []) {
    // roles can be a string or array
    if (typeof roles === "string") {
        roles = [roles];
    }

    return (req, res, next) => {
        try {
            const userRole = req.user.role; // assuming you set req.user in auth middleware

            if (!roles.includes(userRole)) {
                return res.status(403).json({
                    message: "Access denied. You do not have the required role.",
                    errorCode: 1
                });
            }

            next(); // user has correct role → continue
        } catch (err) {
            return res.status(500).json({
                message: "Role check failed",
                errorCode: 1
            });
        }
    };
}



module.exports = { checkAccessToken, checkRole }