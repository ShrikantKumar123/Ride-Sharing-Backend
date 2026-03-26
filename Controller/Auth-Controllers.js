const { json } = require('express')
const Auth = require('../Model/Auth')
const genrateToken = require('../Utills/GenrateToken')
const logger = require('../Utills/Logger')
const { validation_registarion } = require('../Utills/Validation')
const argon2 = require('argon2')
let RefreshToken = require('../Model/RefreshToken')



// User or Rider or Admin Registration

const register_user = async (req, res) => {
    logger.info('Registraion endpont hit')
    try {
        const { err } = validation_registarion(req.body);
        if (err) {
            logger.warn('Validation error', err.details[0].message)
            return res.status(400).json({
                message: err.details[0].message || 'Please enter valid data',
                errorCode: 1
            })
        }
        const { username, email, password, role } = req.body;
        let user = await Auth.findOne({ email: email })
        if (user) {
            logger.warn('User Already exsit')
            return res.status(400).json({
                message: 'User Already exsit',
                errorCode: 1
            })
        }

        const hash = await argon2.hash(password, {
            type: argon2.argon2d,
            memoryCost: 2 ** 16,
            hashLength: 50,
        });
        // console.log(hash)
        user = new Auth({ username, email, password: hash, role })
        await user.save();
        logger.warn('User saved successfully', user._id)

        // const { accessToken, refreshToken } = await genrateToken(user)
        return res.status(201).json({
            message: 'User saved successfully',
            errorCode: 0
        })


    } catch (err) {
        logger.error('Internal server error occured!', err)
        return res.status(500).json({
            message: err || 'Internal server error occured!',
            errorCode: 1
        })
    }
}




// User or Rider or Admin Login

const userLogin = async (req, res) => {
    logger.info('User Login endpont hit')
    try {

        const { email, password } = req.body

        let user = await Auth.findOne({ email })

        if (!user) {
            logger.warn('Sorry we are not found any user, Please sign up!')
            res.status(400).json({
                message: 'Sorry we are not found any user, Please sign up!',
                errorCode: 1
            })
        }

        let option = {
            httpOnly: true,
            secure: true
        }

        if (await argon2.verify(user.password, password)) {
            logger.info('Login successfully!', user._id)
            const { accessToken, refreshToken } = await genrateToken(user)
            return res.status(200).cookie('access-token', accessToken, option).cookie('refresh-token', refreshToken, option).json({
                message: 'Login successfully!',
                errorCode: 0,
                data: user,
                accessToken,
                refreshToken
            })

        } else {
            logger.warn('Inalid credential, Please give correct details!')
            return res.status(400).json({
                message: 'Inalid credential, Please give correct details!',
                errorCode: 1
            })
        }

    } catch (error) {
        logger.error('Internal server error occured!', error)
        return res.status(500).json({
            message: 'Internal server error occured!',
            errorCode: 1
        })
    }
}




// User or Rider or Admin Logout

const userLogout = async (req, res) => {
    try {
        let { refreshToken } = req.body

        let deleted = await RefreshToken.deleteOne({ token: refreshToken })
        if (deleted.deletedCount == 1) {
            logger.info('User logout successfully')
            return res.status(200).json({
                message: "User logout successfully!",
                errorCode: 0
            })
        } else {
            logger.info('user not found in DB')
            return res.status(404).json({
                message: "User not found",
                errorCode: 1
            })
        }

    } catch (err) {
        logger.error('Logout Internal server error occured!', error)
        return res.status(500).json({
            message: 'Internal server error occured!',
            errorCode: 1
        })
    }
}


// Refresh Token

const refreshTokenUser = async (req, res) => {

    try {
        let { refreshTokens } = req.body

        let storeToken = await RefreshToken.findOne({ token: refreshTokens })

        if (!storeToken || storeToken.expiredAt < new Date()) {
            logger.info('Invalid or expired token')
            return res.status(404).json({
                message: "Invalid or expired token",
                errorCode: 1
            })
        }

        let user = await Auth.findById(storeToken.user)
        if (!user) {
            logger.info('User not found')
            return res.status(404).json({
                message: "User not found",
                errorCode: 1
            })
        }
        await RefreshToken.findByIdAndDelete(storeToken._id);

        const { accessToken, refreshToken } = await genrateToken(user)
        logger.info('Refresh Token genrated')
        return res.status(200).json({
            message: 'Refresh Token genrated',
            errorCode: 0,
            accessToken: accessToken,
            refreshToken: refreshToken
        })
    } catch (err) {
        logger.error('Refresh Token Internal server error occured!', err)
        return res.status(500).json({
            message: 'Internal server error occured!',
            errorCode: 1
        })
    }


}

module.exports = { register_user, userLogin, userLogout, refreshTokenUser }