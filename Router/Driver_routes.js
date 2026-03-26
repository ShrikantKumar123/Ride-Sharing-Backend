const express = require('express')
const { addDriverDetails, updateDriverDetails } = require('../Controller/Driver-Controller')
const { checkRole } = require('../Utills/CheckHeaderToken')

const driverRouter = express.Router()


driverRouter.post('/add-driver-details', checkRole('driver'), addDriverDetails)
driverRouter.patch('/update-driver-details', checkRole('driver'), updateDriverDetails)

module.exports = driverRouter