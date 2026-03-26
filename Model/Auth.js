const mongoose = require('mongoose')


const UserSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        lowercase: true
    },
    password: {
        type: String,
        required: true,
        trim: true
    },
    role: {
        type: String,
        required: false,
        default: "user"
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
},
    {
        timestamps: true
    })

const Auth = mongoose.model('Auths', UserSchema)

module.exports = Auth