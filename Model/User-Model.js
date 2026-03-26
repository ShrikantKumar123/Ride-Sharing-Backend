
const mongoose = require('mongoose')


const user_details = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'Auth'
    },
    full_name: {
        type: String,
        required: true,
        trim: true
    },
    mobile: {
        type: String,
        required: true,
        trim: true,
        unique: true
    },
    lat: {
        type: String,
        required: true,
        trim: true
    },
    long: {
        type: String,
        required: true,
        trim: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    },

},
    {
        timestamps: true
    })


const User = mongoose.model('user_profile', user_details)


module.exports = User