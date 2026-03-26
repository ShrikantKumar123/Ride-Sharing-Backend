const logger = require('../Utills/Logger')
let RefreshToken = require('../Model/RefreshToken')

const homePage = async (req, res) => {
    logger.info('Home page url hit')
    try {

        console.log(req.user, '=== user ===')

        let user_id = req.user.userId

        let refData = await RefreshToken.findOne({ user: user_id });

        if (refData) {
            return res.status(200).json({
                message: 'Welcome to Ride sharing backend project!',
                errorCode: 0
            })
        } else {

            return res.status(404).json({
                message: 'Sorry not able to identify, Please login again!',
                errorCode: 1
            })
        }



    } catch (err) {
        logger.error('Home Page Internal server occured!', err)
        return res.status(500).json({
            message: 'Internal server error occured!',
            errorCode: 1
        })
    }


}


module.exports = homePage