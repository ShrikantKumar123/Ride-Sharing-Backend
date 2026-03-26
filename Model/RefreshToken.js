const mongoose = require('mongoose');

const refreshTokenShema = new mongoose.Schema({
    token: {
        type: String,
        required: true,
        uniqe: true
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Auth',
        required: true
    },
    expiredAt: {
        type: Date,
        required: true
    }
}, { timestamps: true })

refreshTokenShema.index({ expiredAt: 1 }, { expireAfterSeconds: 0 })

const RefreshToken = mongoose.model('Refresh-Token', refreshTokenShema)

module.exports = RefreshToken