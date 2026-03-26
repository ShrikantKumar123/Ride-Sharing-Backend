const mongoose = require('mongoose')


const ride = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'Auth'
    },
    pickup_lat: {
        type: String,
        required: true,
        trim: true
    },
    pickup_lng: {
        type: String,
        required: true,
        trim: true
    },
    drop_lat: {
        type: String,
        required: true,
        trim: true
    },
    drop_lng: {
        type: String,
        required: true,
        trim: true
    },
    pickup_address: {
        type: String,
        trim: true
    },
    drop_address: {
        type: String,
        trim: true
    },
    requested_at: {
        type: Date,
        default: Date.now
    },
    status: {
        type: String,
        trim: true,
        default: 'pending'
    },
    payment_status: {
        type: String,
        trim: true,
        default: 'Pending',
        enum: ['Pending', 'Paid', 'Failed']
    },
    payment_value: {
        type: Number,
        default: '0'
    },
    driver_id: {
        type: String,
        trim: true
    },
    distance_km: {
        type: Number,
        default: 0
    },
    estimated_time_min: {
        type: Number,
        default: 0
    },
    refund_status: {
        type: String,
        enum: ['Not Applicable', 'Initiated', 'Processed', 'Failed'],
        default: 'Not Applicable',
        trim: true
    },
    refund_amount: {
        type: Number,
        default: 0
    },
    cancellation_fee: {
        type: Number,
        default: 0
    },
    payment_gateway_order_id: {
        type: String, trim: true
    },
    payment_id: {
        type: String, trim: true, default: 'Not Applicable',
    },
    created_at: {
        type: Date,
        default: Date.now
    }
},
    {
        timestamps: true
    })


const rideRequestSchema = mongoose.model('Ride_Request_Detail', ride)

module.exports = rideRequestSchema