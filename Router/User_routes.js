const express = require('express')
const { checkRole } = require('../Utills/CheckHeaderToken')

const { addUserProfile, getUserProfile, getSelectedUserProfile, updateUserProfile, getAllUserByAdmin } = require('../Controller/User-Profile-Controllers')

const userProfileRouter = express.Router()


userProfileRouter.get('/get-profile', getUserProfile)
userProfileRouter.post('/add-profile', addUserProfile)
userProfileRouter.get('/get-user-profile/:id', getSelectedUserProfile)
userProfileRouter.patch('/update-profile/:id', updateUserProfile)
userProfileRouter.get('/get-all-user', checkRole('admin'), getAllUserByAdmin)


module.exports = userProfileRouter