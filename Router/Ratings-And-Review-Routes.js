const express = require('express');
const UserRatings = require('../Controller/Ratings-And-Review-Controller')

const ratingRouter = express.Router()


ratingRouter.post('/rating/:id', UserRatings)


module.exports = ratingRouter