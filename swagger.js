const swaggerJsdoc = require("swagger-jsdoc");

const options = {
    definition: {
        openapi: "3.0.0",
        info: {
            title: "E-commerce Backend API",
            version: "1.0.0",
            description: "Node.js + Express + PostgreSQL Backend"
        },
        servers: [
            {
                url: "http://localhost:5000"
            }
        ]
    },
    apis: [
        "./routes/*.js",
        "./auth/*.js",
        "./cart/*.js",
        "./orders/*.js",
        "./payment/*.js"
    ]
};

module.exports = swaggerJsdoc(options);