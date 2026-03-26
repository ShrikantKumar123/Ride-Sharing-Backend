const mongoose = require('mongoose')


const driver = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'Auth'
    },
    license_number: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },
    vehicle_number: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },
    vehicle_type: {
        type: String,
        required: true,
        trim: true
    },
    driver_status: {
        type: String,
        required: true,
        trim: true,
        default: 'available'
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
    rating_avg: {
        type: String,
        required: true,
        trim: true
    },
    created_at: {
        type: Date,
        default: Date.now
    }
},
    {
        timestamps: true
    })


const DriverSchema = mongoose.model('Driver_Detail', driver)

module.exports = DriverSchema