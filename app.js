require('dotenv').config();
const express = require('express')
const app = express()
const mongoose = require('mongoose');
const logger = require('./Utills/Logger')
const helmet = require('helmet')
const RateLimiterFlaxible = require('rate-limiter-flexible');
const { default: rateLimit } = require('express-rate-limit');
const authRouter = require('./Router/Auth_routes')
const homeRouter = require('./Router/Home')
const { checkAccessToken, checkRole } = require('./Utills/CheckHeaderToken')
const userProfileRouter = require('./Router/User_routes');
const driverRouter = require('./Router/Driver_routes');
const rideRequestRoutes = require('./Router/Ride-Request_Routes');
const paymentRouter = require('./Router/Payment-Routes');
const ratingRouter = require('./Router/Ratings-And-Review-Routes');



mongoose.connect(process.env.MONGO_URI)
    .then(() =>
        logger.info('✅ MongoDB connected'))
    .catch((err) =>
        logger.info("❌ MongoDB connection error:", err));




app.use(express.json())
app.use(helmet())

// const retlimit = new RateLimiterFlaxible({
//     keyPrefix: 'midleware',
//     points: '10',
//     duration: 1
// })

// app.use((req, res, next) => {
//     rateLimit.consume(req.ip).then(() => next()).catch((err) => {
//         logger.info(`Rate limit exceeded for ${req.ip}`)
//         res.status(429).json({
//             message: 'Rate Limit exceded!',
//             errorCode: 1
//         })
//     })
// })

app.use('/api/v1/auth', authRouter)
app.use('/api/v1/home', checkAccessToken, homeRouter)
app.use('/api/v1/users', checkAccessToken, userProfileRouter)
app.use('/api/v1/driver', checkAccessToken, driverRouter)
app.use('/api/v1/rides', checkAccessToken, rideRequestRoutes)
app.use('/api/v1/payment', checkAccessToken, paymentRouter)
app.use('/api/v1/paymentwebhook', paymentRouter)
app.use('/api/v1/feedback', checkAccessToken, ratingRouter)

require("./swagger")(app);

app.listen(process.env.HOST, () => logger.info(`Server running on localhost://${process.env.HOST}`));