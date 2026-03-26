
const jwt = require('jsonwebtoken')
const crypto = require('crypto')
let RefreshToken = require('../Model/RefreshToken')
const logger = require('../Utills/Logger')

const genrateToken = async (user) => {
    logger.info('Hit Genrate token')
    let datas = {
        username: user.username,
        email: user.email,
        userId: user._id,
        role: user.role
    }
    let accessToken = await jwt.sign(datas, process.env.JWT_TOKEN, { expiresIn: '1h' })
    let refreshToken = await jwt.sign(datas, process.env.REFRESH_TOKEN_KEY, { expiresIn: '1m' })
    try {

        let userId = user._id
        let refData = await RefreshToken.findOne({ user: userId })
        let expireAt = new Date()
        expireAt.setDate(expireAt.getDate() + 7)



        if (refData != null) {
            logger.warn('Already reference token in DB')
            let token = refData.token
            return { accessToken, refreshToken: token }
        } else {
            logger.warn('Genrated token and inserted in DB')
            await RefreshToken.create({
                token: refreshToken,
                user: user._id,
                expiredAt: expireAt
            })
            return { accessToken, refreshToken }
        }


    } catch (err) {
        logger.error('In genrated token error', err)
        return { accessToken, refreshToken }
    }
}

module.exports = genrateToken