const express = require('express');
const paymentRouter = express.Router();
const paymentController = require('../Controller/Payment-Controller');

paymentRouter.post('/ride/create/:id', paymentController.createRideWithPaymentLink);
paymentRouter.post('/ride/webhook', paymentController.handleWebhook);
paymentRouter.post('/ride/refund', paymentController.refundRide);
paymentRouter.post('/ride/cancel', paymentController.cancelRide);

module.exports = paymentRouter;
