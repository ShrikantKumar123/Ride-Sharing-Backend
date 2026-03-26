const logger = require('../Utills/Logger')

const errorHandler = (err, req, res, next) => {
    logger.error(err.stack);
    res.status(err.status || 500).json({
        message: err.message || 'Internal server error.',
        errorCode: 1
    })
}

module.exports = errorHandler