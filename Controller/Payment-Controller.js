const Razorpay = require('razorpay');
const rideRequestSchema = require('../Model/Ride-Request-Model');
const crypto = require('crypto');
const logger = require('../Utills/Logger');

const razorpay = new Razorpay({
    key_id: process.env.ROZARPAY_KEY,
    key_secret: process.env.ROZARPAY_SECRET_KEY
});

// 1️⃣ Create Ride and Payment Link
const createRideWithPaymentLink = async (req, res) => {
    logger.info('Payment Link endpoint hit');
    const rider_req_id = req.params.id; // Ride request details table _id
    try {
        // const { pickup_lat, pickup_lng, drop_lat, drop_lng, pickup_address, drop_address, payment_value } = req.body;


        let ride = await rideRequestSchema.findById(rider_req_id)
        if (!ride) {
            logger.info('Ride not found in DB');
            return res.status(400).json({
                message: 'Rides not found',
                errorCode: 1
            })
        }

        // Create payment link via Razorpay
        const paymentLink = await razorpay.paymentLink.create({
            amount: ride.payment_value * 100, // in paise
            currency: "INR",
            accept_partial: false,
            description: `Payment for ride ${rider_req_id}`,
            customer: { email: "user@example.com" }, // optional if you have email
            notify: { sms: true, email: true }
        });

        console.log(paymentLink, '=== paymentLink ===')
        // ride.payment_gateway_order_id = paymentLink.id;
        // await ride.save();

        let updateBody = {
            payment_gateway_order_id: paymentLink.id
        }

        let updatedUser = await rideRequestSchema.findByIdAndUpdate(rider_req_id,
            { $set: updateBody },
            { new: true, runValidators: true }
        )

        if (!updatedUser) {
            // logger.warn("Ride not found")
            return res.status(404).json({
                message: "Ride not found",
                errorCode: 1
            });
        }
        logger.info('Payment Link genrated successfully.');
        res.status(200).json({
            success: true,
            message: "Ride created. Payment link generated.",
            payment_link: paymentLink.short_url
        });

    } catch (error) {
        logger.error(`Internal server error! ${error.message}`);
        res.status(500).json({ success: false, message: error.message });
    }
};

// 2️⃣ Webhook to Update Payment Status
const handleWebhook = async (req, res) => {
    logger.info(`Webhook Endpoint hit`);
    try {
        const webhookSecret = process.env.ROZARPAY_SECRET_KEY;
        const receivedSignature = req.headers['x-razorpay-signature'];

        const generatedSignature = crypto.createHmac('sha256', webhookSecret)
            .update(JSON.stringify(req.body))
            .digest('hex');

        if (receivedSignature !== generatedSignature) {
            console.log('=== not matched ===')
            logger.info(`Some issues Occured!`);
            return res.status(400).json({
                message: 'Invalid request.',
                errorCode: 1
            })
        }

        const event = req.body.event;
        const payload = req.body.payload;

        // console.log(event, '=== Event ====')
        // console.log(payload, '==== payload ====')

        let payment_id = payload.payment.entity.id

        if (event === 'payment_link.paid') {
            console.log('=== Paid ===')
            const orderId = payload.payment_link.entity.id;
            console.log(orderId, '=== orderId ===')
            const ride = await rideRequestSchema.findOne({ payment_gateway_order_id: orderId });
            if (ride) {
                ride.payment_status = 'Paid';
                ride.payment_id = payment_id
                await ride.save();
            }
        } else if (event === 'payment_link.failed') {
            console.log('=== failed ===')
            const orderId = payload.payment_link.entity.id;
            const ride = await rideRequestSchema.findOne({ payment_gateway_order_id: orderId });
            if (ride) {
                logger.info(`Payment Failed, Payment Id: ${payment_id}`)
                ride.payment_status = 'Failed';
                ride.payment_id = payment_id
                await ride.save();
            }
        }
        logger.info(`Payment Done successfully. Payment ID: ${payment_id}`);
        res.status(200).json({
            message: 'Payment successfully done.',
            errorCode: 0
        });
    } catch (err) {
        logger.error(`Internal server error! ${err.message}`);
        res.status(500).json({
            message: 'Internal server Error.',
            errorCode: 1
        })
    }
};

// 3️⃣ Refund Ride
const refundRide = async (req, res) => {
    logger.info(`Refund Endpoint hit`);
    try {
        const { rideId, refund_amount } = req.body;
        const ride = await rideRequestSchema.findById(rideId);
        if (!ride) return res.status(404).json({ message: "Ride not found" });

        if (ride.payment_status !== 'Paid') {
            logger.info(`Refund not Prossesed Because payment not done yet.`);
            return res.status(400).json({ message: "Cannot refund unpaid ride" });
        }
        console.log(ride.payment_id, '=== Order id ====')
        const refund = await razorpay.payments.refund(ride.payment_id, { amount: refund_amount * 100 });
        ride.refund_status = 'Processed';
        ride.refund_amount = refund_amount;
        await ride.save();
        logger.info(`Refund Successfully Prossesed.`);
        res.status(200).json({ success: true, refund, ride });
    } catch (err) {
        logger.error(`Internal server error! ${err.message}`);

        res.status(500).json({ success: false, message: err.message });
    }
};

// 4️⃣ Cancel Ride & Apply Cancellation Fee
const cancelRide = async (req, res) => {
    logger.info(`Cancel Ride Endpoint hit`);
    try {
        const { rideId } = req.body;
        const ride = await rideRequestSchema.findById(rideId);
        if (!ride) return res.status(404).json({ message: "Ride not found" });

        const cancellationFee = Math.round(ride.payment_value * 0.1); // 10% example
        ride.cancellation_fee = cancellationFee;
        ride.payment_value = ride.payment_value - cancellationFee;
        ride.status = 'cancelled';
        await ride.save();
        logger.info(`Cancel Ride Successfully.`);
        res.status(200).json({ success: true, ride });
    } catch (err) {
        logger.error(`Internal server error! ${err.message}`);
        res.status(500).json({ success: false, message: err.message });
    }
};

module.exports = {
    createRideWithPaymentLink,
    handleWebhook,
    refundRide,
    cancelRide
};
