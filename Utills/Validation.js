const joi = require('joi')

const validation_registarion = (data) => {
    const schema = joi.object({
        username: joi.string().min(3).max(50).required(),
        email: joi.string().email().required(),
        password: joi.string().min(8).required()
    })
    return schema.validate(data)
}

function validateDL(dlNumber) {
    const dlRegex = /^[A-Z]{2}[0-9]{2}\s?[0-9]{4,12}$/;
    return dlRegex.test(dlNumber.toUpperCase());
}

function validateVehicleNumber(vehicleNumber) {
    const vehicleRegex = /^[A-Z]{2}[0-9]{1,2}[A-Z]{1,2}[0-9]{4}$/;
    return vehicleRegex.test(vehicleNumber.toUpperCase());
}


const rideRequestValidation = (data) => {
    console.log(data, '=== daa ====')
    const schema = joi.object({
        pickup_lat: joi.string().required(),
        pickup_lng: joi.string().required(),
        drop_lat: joi.string().required(),
        drop_lng: joi.string().required(),
    })
    return schema.validate(data)
}




module.exports = { validation_registarion, validateDL, validateVehicleNumber, rideRequestValidation }