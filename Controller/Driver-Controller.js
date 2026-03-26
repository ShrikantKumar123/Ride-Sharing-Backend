const logger = require('../Utills/Logger');
const DriverSchema = require('../Model/Driver-Model')

const { validateDL, validateVehicleNumber } = require('../Utills/Validation')

// Generate random latitude between -90 and 90
function getRandomLat() {
    return (Math.random() * 180 - 90).toFixed(6); // 6 decimal places
}

// Generate random longitude between -180 and 180
function getRandomLong() {
    return (Math.random() * 360 - 180).toFixed(6); // 6 decimal places
}

const addDriverDetails = async (req, res) => {
    logger.info('Add driver details endpoint hit');

    try {
        const { license_number,
            vehicle_number,
            vehicle_type,
            driver_status } = req.body;

        let rating_avg = req.body.rating_avg ? req.body.rating_avg : '4'

        // 1️⃣ Validate input
        if (!license_number || !vehicle_number || !vehicle_type || !driver_status) {
            return res.status(400).json({
                message: 'Driver details are required. example: License number, Vehicle number, Vehical Type, Driver Status.',
                errorCode: 1
            });
        }

        // 2️⃣ Check if userId or mobile already exists (single DB query)
        const conflict = await DriverSchema.findOne({
            $or: [
                { userId: req.user.userId }
            ]
        });

        if (conflict) {
            if (conflict.userId.toString() === req.user.userId) {
                return res.status(409).json({
                    message: 'Driver already exists.',
                    errorCode: 1
                });
            }
        }


        const flag1 = await validateDL(license_number);
        console.log(flag1)
        if (!flag1) {
            logger.warn('Validation error')
            return res.status(400).json({
                message: 'Please enter valid data',
                errorCode: 1
            })
        }

        const flag = await validateVehicleNumber(vehicle_number);
        if (!flag) {
            logger.warn('Validation error')
            return res.status(400).json({
                message: 'Please enter valid data',
                errorCode: 1
            })
        }

        // 3️⃣ Use default lat/long for local testing
        let lat = await getRandomLat();
        let long = await getRandomLong();

        // 4️⃣ Create and save user
        const userDetails = new DriverSchema({
            userId: req.user.userId,
            license_number,
            vehicle_number,
            lat,
            long,
            vehicle_type,
            driver_status,
            rating_avg
        });

        await userDetails.save();

        logger.info('Driver details saved successfully in DB.');

        return res.status(200).json({
            message: 'Driver details saved successfully.',
            errorCode: 0
        });

    } catch (err) {
        // Log full stack internally but show only message to client
        logger.error(`Internal server error! ${err.message}`);
        return res.status(500).json({
            message: 'Internal server error occurred.',
            errorCode: 1
        });
    }
};


const updateDriverDetails = async (req, res) => {
    try {
        let userId = req.user.userId
        let body = req.body

        let driver = await DriverSchema.findOne({ userId: userId })

        if (!driver) {
            return res.status(409).json({
                message: 'Sorry driver not exists.',
                errorCode: 1
            });
        }

        let license_number = body.license_number ? body.license_number : false;
        if (license_number) {
            const flag1 = await validateDL(license_number);
            console.log(flag1)
            if (!flag1) {
                logger.warn('Validation error')
                return res.status(400).json({
                    message: 'Please enter valid DL number.',
                    errorCode: 1
                })
            }
        }

        let vehicle_number = body.vehicle_number ? body.vehicle_number : false;
        if (vehicle_number) {
            const flag = await validateVehicleNumber(vehicle_number);
            if (!flag) {
                logger.warn('Validation error')
                return res.status(400).json({
                    message: 'Please enter valid vehical number',
                    errorCode: 1
                })
            }
        }

        let driverData = await DriverSchema.findByIdAndUpdate(driver._id,
            { $set: body },
            { new: true, runValidators: true })

        return res.status(200).json({
            message: 'Driver details updated successfully.',
            errorCode: 0,
            data: driverData
        })
    } catch (err) {
        logger.error(`Internal server error! ${err.message}`);
        return res.status(500).json({
            message: 'Internal server error occurred.',
            errorCode: 1
        });
    }






}





module.exports = { addDriverDetails, updateDriverDetails }