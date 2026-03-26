const swaggerJSDoc = require("swagger-jsdoc");
const swaggerUi = require("swagger-ui-express");

const options = {
    definition: {
        openapi: "3.0.0",
        info: {
            title: "Telegram Clone API",
            version: "1.0.0",
            description: "Node.js, Sequelize va PostgreSQL yordamida yaratilgan Chat API",
        },
        // SERVERS qismini mana shunday massiv ko'rinishida yozamiz
        servers: [
            {
                url: "https://chat-mates-backend-spen.onrender.com",
                description: "Production server (Render)",
            },
            {
                url: "http://localhost:5000",
                description: "Local server",
            },
        ],
        components: {
            securitySchemes: {
                bearerAuth: {
                    type: "http",
                    scheme: "bearer",
                    bearerFormat: "JWT",
                },
            },
        },
    },
    apis: ["./routes/*.js"],
};

const swaggerSpec = swaggerJSDoc(options);

const setupSwagger = (app) => {
    app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));
    // Logda qaysi serverda ishlayotganini ko'rsatish uchun:
    const port = process.env.PORT || 5000;
    console.log(`📖 Swagger dokumentatsiyasi portda ishlamoqda: ${port}`);
};

module.exports = setupSwagger;