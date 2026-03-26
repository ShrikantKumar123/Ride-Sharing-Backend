const swaggerJsdoc = require("swagger-jsdoc");
const swaggerUi = require("swagger-ui-express");

const options = {
    definition: {
        openapi: "3.0.0",
        info: {
            title: "Ride-Sharing-Backend",
            version: "1.0.0",
            description: "Backend API for a ride booking system supporting riders and drivers. Includes authentication, ride management, and driver location tracking.",
        },
        servers: [
            {
                url: "http://localhost:3000/api/v1",
            },
        ],
    },
    apis: ["./Router/*.js"],
};

const specs = swaggerJsdoc(options);

module.exports = (app) => {
    app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(specs));
};