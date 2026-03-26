const express = require('express')

const authRouter = express.Router()


const { register_user, userLogin, userLogout, refreshTokenUser } = require('../Controller/Auth-Controllers')


authRouter.post('/registarion', register_user)
authRouter.post('/login', userLogin)
authRouter.post('/logout', userLogout)
authRouter.post('/refresh-token', refreshTokenUser)

module.exports = authRouter