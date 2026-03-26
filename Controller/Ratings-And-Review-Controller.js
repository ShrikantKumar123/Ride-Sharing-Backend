const logger = require('../Utills/Logger')
const rideRequestSchema = require('../Model/Ride-Request-Model');
const ratingsAndReview = require('../Model/Ratings-And-Review-Model');
const { json } = require('express');
const UserRatings = async (req, res) => {
    // console.log(req, '=== req ===')
    try {

        const userRole = req.user.role;
        const userId = req.user.userId;

        const rideId = req.params.id
        console.log(rideId, '==== rideId ===')

        if (userRole == 'driver' || userRole == 'admin') {
            return res.status(404).json({
                message: 'Sorry you are not right person to give rider feedback.',
                errorCode: 1
            });
        }
        const riderExist = await rideRequestSchema.findById(rideId)
        console.log(riderExist, '==== riderExist ===')

        if (!riderExist) {
            return res.status(404).json({
                message: 'Sorry you dont have pending ride for feedback.',
                errorCode: 1
            });
        }

        if (riderExist.userId != userId) {
            return res.status(404).json({
                message: 'Sorry you dont give feedback for this ride.',
                errorCode: 1
            });
        }

        if (riderExist.status != 'complete') {
            return res.status(404).json({
                message: 'Sorry you have not eligible for feedback.',
                errorCode: 1
            });
        }

        const { rating, comment } = req.body
        const insert_rating = new ratingsAndReview({
            userId: req.user.userId,
            rideId: riderExist._id,
            riderId: riderExist.driver_id,
            rating,
            comment
        });

        await insert_rating.save();

        return res.status(200).json({
            message: 'Rating updated successfully.',
            errorCode: 0,
            data: insert_rating
        });

    } catch (err) {
        logger.error(`Internal server error! ${err.message}`);
        return res.status(500).json({
            message: 'Internal server error occurred.',
            errorCode: 1
        });
    }

}

module.exports = UserRatings