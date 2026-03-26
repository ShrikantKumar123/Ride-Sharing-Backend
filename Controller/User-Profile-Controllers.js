const { string } = require('joi')
const User = require('../Model/User-Model')
const logger = require('../Utills/Logger')

// Get user profile

const getUserProfile = async (req, res) => {
    logger.info('get user profile endpoint hit')
    try {
        let user = await User.findOne({ userId: req.user.userId })

        if (!user) {
            logger.warn('User not found in DB')
            return res.status(404).json({
                message: "User not found",
                errorCode: 1
            });
        }
        logger.info('User found from DB')
        return res.status(200).json({
            message: "User found",
            errorCode: 0,
            data: user
        });
    } catch (err) {
        logger.error('Internal server error occured!', err)
        return res.status(500).json({
            message: 'Internal Server error occured.',
            errorCode: 1
        })
    }

}

// Get Selected user profile

const getSelectedUserProfile = async (req, res) => {
    logger.info('Get Selected user profile endpoint hit')
    try {

        let id = req.params.id
        let user = await User.findOne({ userId: id })

        if (!user) {
            logger.warn('User not found in DB')
            return res.status(404).json({
                message: "User not found",
                errorCode: 1
            });
        }
        logger.info('User found from DB', user._id)
        return res.status(200).json({
            message: "User found",
            errorCode: 0,
            data: user
        });

    } catch (err) {
        logger.error('Internal server error occured!', err)
        return res.status(500).json({
            message: 'Internal Server error occured.',
            errorCode: 1
        })
    }

}


// Add User Profile


// Generate random latitude between -90 and 90
function getRandomLat() {
    return (Math.random() * 180 - 90).toFixed(6); // 6 decimal places
}

// Generate random longitude between -180 and 180
function getRandomLong() {
    return (Math.random() * 360 - 180).toFixed(6); // 6 decimal places
}

const addUserProfile = async (req, res) => {
    logger.info('Add user profile endpoint hit');

    try {
        const { full_name, mobile } = req.body;

        // 1️⃣ Validate input
        if (!mobile || !full_name) {
            return res.status(400).json({
                message: 'Full name and mobile number are required.',
                errorCode: 1
            });
        }

        // 2️⃣ Check if userId or mobile already exists (single DB query)
        const conflict = await User.findOne({
            $or: [
                { userId: req.user.userId },
                { mobile }
            ]
        });

        if (conflict) {
            if (conflict.userId.toString() === req.user.userId) {
                return res.status(409).json({
                    message: 'User already exists.',
                    errorCode: 1
                });
            } else {
                return res.status(409).json({
                    message: 'Mobile number already exists.',
                    errorCode: 1
                });
            }
        }

        // 3️⃣ Use default lat/long for local testing
        let lat = await getRandomLat();
        let long = await getRandomLong();

        // 4️⃣ Create and save user
        const userDetails = new User({
            userId: req.user.userId,
            full_name,
            mobile,
            lat,
            long
        });

        await userDetails.save();

        logger.info('User details saved successfully in DB.');

        return res.status(200).json({
            message: 'User details saved successfully.',
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



// Update User Profile


const updateUserProfile = async (req, res) => {
    logger.info("Update user profile endpoint hit")
    try {
        let updateId = req.params.id
        let updateBody = req.body

        if (updateId !== req.user.userId) {
            logger.warn('Invalid User')
            return res.status(404).json({
                message: "Invalid User!",
                errorCode: 1
            });
        }

        let user = await User.findOne({ userId: updateId });
        if (!user) {
            logger.warn('User not found in DB')
            return res.status(404).json({
                message: "User not found",
                errorCode: 1
            });
        }

        let updatedUser = await User.findByIdAndUpdate(user._id,
            { $set: updateBody },
            { new: true, runValidators: true }
        )

        if (!updatedUser) {
            logger.warn("User not found")
            return res.status(404).json({
                message: "User not found",
                errorCode: 1
            });
        }
        logger.info("User updated successfully")
        return res.status(200).json({
            message: "User updated successfully",
            errorCode: 0,
            data: updatedUser
        });

    } catch (err) {
        logger.error('Internal server error occured!', err)
        return res.status(500).json({
            message: 'Internal Server error occured.',
            errorCode: 1
        })
    }
}

// get all user by admin

const getAllUserByAdmin = async (req, res) => {
    logger.info('Get all user profile endpoint hit')
    try {
        let user = await User.find()
        if (!user) {
            logger.warn('User not found in DB')
            return res.status(404).json({
                message: "User not found",
                errorCode: 1
            });
        }
        logger.info('User found from DB')
        return res.status(200).json({
            message: "User found",
            errorCode: 0,
            userLength: user.length,
            data: user
        });
    } catch (err) {
        logger.error('Internal server error occured!', err)
        return res.status(500).json({
            message: 'Internal Server error occured.',
            errorCode: 1
        })
    }
}


module.exports = { getUserProfile, getSelectedUserProfile, addUserProfile, updateUserProfile, getAllUserByAdmin }