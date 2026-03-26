const express = require('express');
const { RideRequest, FindNearesrDriver, checkAllRideRequestByUser, checkSelectedRideRequest,
    checkAllRideRequestByDriver, checkSelectedRideRequestDetailsByDriver, acceptRidesByDriver,
    cancelRidesByUserOrDriver, startRides, completeRides
} = require('../Controller/Ride-Request-Controller');
const { checkRole } = require('../Utills/CheckHeaderToken')

const rideRequestRoutes = express.Router();

rideRequestRoutes.post('/ride-request', RideRequest)
rideRequestRoutes.get('/nearby', FindNearesrDriver)

rideRequestRoutes.get('/user-all-rides', checkAllRideRequestByUser)
rideRequestRoutes.get('/user-rides-details/:id', checkSelectedRideRequest)
rideRequestRoutes.get('/driver-all-rides', checkRole('driver'), checkAllRideRequestByDriver)
rideRequestRoutes.get('/driver-rides-details/:id', checkRole('driver'), checkSelectedRideRequestDetailsByDriver)
rideRequestRoutes.patch('/accept/:id', checkRole('driver'), acceptRidesByDriver)
rideRequestRoutes.patch('/cancel/:id', cancelRidesByUserOrDriver)
rideRequestRoutes.patch('/start/:id', checkRole('driver'), startRides)
rideRequestRoutes.patch('/complete/:id', checkRole('driver'), completeRides)


module.exports = rideRequestRoutes