const mongoose = require('mongoose')

const rating = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'Auth'
    },
    rideId: {
        type: String,
        required: true,
        trim: true
    },
    riderId: {
        type: String,
        required: true,
        trim: true
    },
    rating: {
        type: String,
        required: true,
        trim: true
    },
    comment: {
        type: String,
        required: true,
        trim: true
    },
    created_at: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true
})

const ratingsAndReview = mongoose.model('Ratings_and_review', rating)

module.exports = ratingsAndReview