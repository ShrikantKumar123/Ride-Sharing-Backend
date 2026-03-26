
const { rideRequestValidation } = require('../Utills/Validation')
const logger = require('../Utills/Logger')
const rideRequestSchema = require('../Model/Ride-Request-Model')
const DriverSchema = require('../Model/Driver-Model')


async function findDriversWithDistanceAndRoute(pickup_lat, pickup_lng, maxDistanceKm = 2000) {
    const lat = parseFloat(pickup_lat);
    const lng = parseFloat(pickup_lng);
    // const dLat = parseFloat(drop_lat);
    // const dLng = parseFloat(drop_lng);

    // 1️⃣ Calculate distance between pickup and drop once
    // const pickupToDropDistance = 6371 * Math.acos(
    //     Math.sin(lat * Math.PI / 180) * Math.sin(dLat * Math.PI / 180) +
    //     Math.cos(lat * Math.PI / 180) * Math.cos(dLat * Math.PI / 180) *
    //     Math.cos((lng - dLng) * Math.PI / 180)
    // );

    // 2️⃣ Calculate distance from drivers to pickup
    const allDrivers = await DriverSchema.aggregate([
        {
            $addFields: {
                distance: {
                    $let: {
                        vars: {
                            lat1: lat,
                            lon1: lng,
                            lat2: { $toDouble: "$lat" },
                            lon2: { $toDouble: "$long" }
                        },
                        in: {
                            $multiply: [
                                6371,
                                {
                                    $acos: {
                                        $add: [
                                            { $multiply: [{ $sin: { $degreesToRadians: "$$lat1" } }, { $sin: { $degreesToRadians: "$$lat2" } }] },
                                            { $multiply: [{ $cos: { $degreesToRadians: "$$lat1" } }, { $cos: { $degreesToRadians: "$$lat2" } }, { $cos: { $degreesToRadians: { $subtract: ["$$lon1", "$$lon2"] } } }] }
                                        ]
                                    }
                                }
                            ]
                        }
                    }
                }
            }
        },
        { $sort: { distance: 1 } }
    ]);

    // 3️⃣ Filter drivers within maxDistanceKm
    const nearbyDrivers = allDrivers.filter(d => d.distance <= maxDistanceKm);

    return {
        // pickup_to_drop_distance: parseFloat(pickupToDropDistance.toFixed(2)),
        drivers: nearbyDrivers.length > 0 ? nearbyDrivers : allDrivers
    };
}


async function pickupToDropDistanceUser(pickup_lat, pickup_lng, drop_lat, drop_lng) {
    const lat = parseFloat(pickup_lat);
    const lng = parseFloat(pickup_lng);
    const dLat = parseFloat(drop_lat);
    const dLng = parseFloat(drop_lng);

    // Validate inputs
    if ([lat, lng, dLat, dLng].some(coord => isNaN(coord))) {
        throw new Error("Invalid latitude or longitude values");
    }

    // Convert degrees to radians
    const toRad = (deg) => deg * Math.PI / 180;

    // Haversine distance (km)
    const pickupToDropDistance = 6371 * Math.acos(
        Math.sin(toRad(lat)) * Math.sin(toRad(dLat)) +
        Math.cos(toRad(lat)) * Math.cos(toRad(dLat)) *
        Math.cos(toRad(lng - dLng))
    );

    // Estimated travel time (assume 40 km/h avg speed)
    const avgSpeed = 40; // km/h
    const estimatedTimeHours = pickupToDropDistance / avgSpeed;
    const estimatedTimeMinutes = Math.round(estimatedTimeHours * 60);

    // --- Fare Estimation ---
    const BASE_FARE = 50;      // ₹ base charge
    const PER_KM_RATE = 12;    // ₹ per km
    const PER_MIN_RATE = 2;    // ₹ per min

    const fare = BASE_FARE +
        (PER_KM_RATE * pickupToDropDistance) +
        (PER_MIN_RATE * estimatedTimeMinutes);

    return {
        distance_km: parseFloat(pickupToDropDistance.toFixed(2)),
        distance_m: Math.round(pickupToDropDistance * 1000),
        estimated_time_min: estimatedTimeMinutes,
        estimated_fare: Math.round(fare)  // rounded to nearest ₹
    };
}


const RideRequest = async (req, res) => {
    logger.info(`Ride request Endpoint hit`);
    try {

        const { pickup_lat, pickup_lng, drop_lat, drop_lng, pickup_address, drop_address } = req.body
        const driverUserId = req.query.driverId

        if (!driverUserId) {
            logger.warn(`Please select driver first`)
            return res.status(400).json({
                message: 'Please select driver first',
                errorCode: 1
            })
        }

        const { error } = await rideRequestValidation(req.body);
        if (error) {
            logger.warn(`Validation error ${error.details[0].message}`)
            return res.status(400).json({
                message: error.details[0].message || 'Please enter valid data',
                errorCode: 1
            })
        }

        const { distance_km, estimated_time_min, estimated_fare } = await pickupToDropDistanceUser(pickup_lat, pickup_lng, drop_lat, drop_lng)

        const rideRequest = new rideRequestSchema({
            userId: req.user.userId,
            pickup_lat,
            pickup_lng,
            drop_lat,
            drop_lng,
            pickup_address,
            drop_address,
            driver_id: driverUserId,
            distance_km,
            estimated_time_min,
            payment_value: estimated_fare
        });

        await rideRequest.save();
        logger.info(`Ride request Successfully`);
        return res.status(200).json({
            message: 'Ride Request Successfully.',
            errorCode: 0,
            data: rideRequest
        })

    } catch (err) {
        logger.error('Internal server error occured!', err)
        return res.status(500).json({
            message: err || 'Internal server error occured!',
            errorCode: 1
        })
    }
}

const FindNearesrDriver = async (req, res) => {
    logger.info(`Find Nearest Endpoint hit`);
    try {
        const pickup_lat = parseFloat(req.query.lat);
        const pickup_lng = parseFloat(req.query.lng);
        let repsonse = await findDriversWithDistanceAndRoute(pickup_lat, pickup_lng, 20000)
        return res.status(200).json({
            message: 'Find the nearest drivers.',
            errorCode: 0,
            data: repsonse
        })
    } catch (err) {
        logger.error('Internal server error occured!', err)
        return res.status(500).json({
            message: err || 'Internal server error occured!',
            errorCode: 1
        })
    }
}

const checkAllRideRequestByUser = async (req, res) => {
    // Show all ride request of user ex. History
    logger.info(`Check all ride request by user Endpoint hit`);
    try {
        let userId = req.user.userId
        console.log(userId, '=== userId ===')
        if (!userId) {
            logger.warn(`User not exist`)
            return res.status(400).json({
                message: 'User not exist.',
                errorCode: 1
            })
        }

        const allRides = await rideRequestSchema.find({ userId: userId })

        return res.status(200).json({
            message: 'User rides fetched successfully.',
            errorCode: 0,
            data: allRides
        })
    } catch (err) {
        logger.error('Internal server error occured!', err)
        return res.status(500).json({
            message: err || 'Internal server error occured!',
            errorCode: 1
        })
    }

}

const checkSelectedRideRequest = async (req, res) => {
    //Show user details and driver detials and status
    logger.info(`Check Selected ride request Endpoint hit`);
    try {
        let id = req.params.id

        if (!id) {
            logger.warn(`User not exist`)
            return res.status(400).json({
                message: 'User not exist.',
                errorCode: 1
            })
        }

        let rides = await rideRequestSchema.findById(id)

        if (!rides) {
            return res.status(404).json({ message: 'Ride not found', errorCode: 1 })
        }

        return res.status(200).json({
            message: 'User rides fetched successfully.',
            errorCode: 0,
            data: rides
        })

    } catch (err) {
        logger.error('Internal server error occured!', err)
        return res.status(500).json({
            message: err || 'Internal server error occured!',
            errorCode: 1
        })
    }
}

const checkAllRideRequestByDriver = async (req, res) => {
    // Show all ride request by driver ex. History
    logger.info(`Check all ride request by driver Endpoint hit`);
    try {
        let userId = req.user.userId
        if (!userId) {
            logger.warn(`Driver not exist`)
            return res.status(400).json({
                message: 'Driver not exist.',
                errorCode: 1
            })
        }

        const allRides = await rideRequestSchema.find({ driver_id: userId })
        console.log(allRides, '=== allRides ===')
        if (allRides.length == 0) {
            return res.status(200).json({
                message: 'No rides found',
                errorCode: 0,
                data: []
            })
        }

        return res.status(200).json({
            message: 'Driver rides fetched successfully.',
            errorCode: 0,
            data: allRides
        })
    } catch (err) {
        logger.error('Internal server error occured!', err)
        return res.status(500).json({
            message: err || 'Internal server error occured!',
            errorCode: 1
        })
    }

}

const checkSelectedRideRequestDetailsByDriver = async (req, res) => {
    //Show user details and ride details and status
    try {
        let id = req.params.id

        if (!id) {
            logger.warn(`Rides not exist`)
            return res.status(400).json({
                message: 'Rides not exist.',
                errorCode: 1
            })
        }

        let rides = await rideRequestSchema.findById(id)

        if (!rides) {
            return res.status(404).json({ message: 'Ride not found', errorCode: 1 })
        }

        return res.status(200).json({
            message: 'Rides details fetched successfully.',
            errorCode: 0,
            data: rides
        })

    } catch (err) {
        logger.error('Internal server error occured!', err)
        return res.status(500).json({
            message: err || 'Internal server error occured!',
            errorCode: 1
        })
    }

}


const acceptRidesByDriver = async (req, res) => {
    try {
        const id = req.params.id; // Ride request details table _id

        const rides = await rideRequestSchema.findOneAndUpdate(
            { _id: id, status: "pending" }, // ✅ only allow if pending
            { $set: { status: "accepted" } },
            { new: true, runValidators: true }
        );

        if (!rides) {
            return res.status(400).json({
                errorCode: 1,
                message: "Ride cannot be accepted. It might already be closed, completed or started."
            });
        }

        return res.status(200).json({
            message: "Ride accepted successfully.",
            errorCode: 0,
            data: rides
        });
    } catch (err) {
        logger.error("Internal server error occured!", err);
        return res.status(500).json({
            message: err?.message || "Internal server error occured!",
            errorCode: 1
        });
    }
};

// user or driver can cancel only if not already closed/complete
const cancelRidesByUserOrDriver = async (req, res) => {
    try {
        const id = req.params.id; // Ride request details table _id

        const rides = await rideRequestSchema.findOneAndUpdate(
            { _id: id, status: { $nin: ["close", "complete"] } },
            { $set: { status: "close" } },
            { new: true, runValidators: true }
        );

        if (!rides) {
            return res.status(400).json({
                errorCode: 1,
                message: "Ride cannot be cancelled. It might already be closed or completed."
            });
        }

        return res.status(200).json({
            message: "Ride cancelled successfully.",
            errorCode: 0,
            data: rides
        });
    } catch (err) {
        logger.error("Internal server error occured!", err);
        return res.status(500).json({
            message: err?.message || "Internal server error occured!",
            errorCode: 1
        });
    }
};

const startRides = async (req, res) => {
    try {
        const id = req.params.id;  // Ride request details table _id

        const rides = await rideRequestSchema.findOneAndUpdate(
            { _id: id, status: "accepted" }, // ✅ must be accepted
            { $set: { status: "start" } },
            { new: true, runValidators: true }
        );

        if (!rides) {
            return res.status(400).json({
                errorCode: 1,
                message: "Ride cannot be started. It must be in accepted state."
            });
        }

        return res.status(200).json({
            message: "Ride started successfully.",
            errorCode: 0,
            data: rides
        });
    } catch (err) {
        logger.error("Internal server error occured!", err);
        return res.status(500).json({
            message: err?.message || "Internal server error occured!",
            errorCode: 1
        });
    }
};

const completeRides = async (req, res) => {
    try {
        const id = req.params.id; // Ride request details table _id

        const rides = await rideRequestSchema.findOneAndUpdate(
            { _id: id, status: "start" }, // ✅ must be in start
            { $set: { status: "complete" } },
            { new: true, runValidators: true }
        );

        if (!rides) {
            return res.status(400).json({
                errorCode: 1,
                message: "Ride cannot be completed. It must be in started state."
            });
        }

        return res.status(200).json({
            message: "Ride completed successfully.",
            errorCode: 0,
            data: rides
        });
    } catch (err) {
        logger.error("Internal server error occured!", err);
        return res.status(500).json({
            message: err?.message || "Internal server error occured!",
            errorCode: 1
        });
    }
};



module.exports = {
    RideRequest, FindNearesrDriver, checkAllRideRequestByUser,
    checkSelectedRideRequest, checkAllRideRequestByDriver,
    checkSelectedRideRequestDetailsByDriver, acceptRidesByDriver,
    cancelRidesByUserOrDriver, startRides, completeRides
}