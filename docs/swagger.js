const swaggerJSDoc = require("swagger-jsdoc");
const swaggerUi = require("swagger-ui-express");

const swaggerOptions = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Your API Title",
      version: "1.0.0",
      description: "API Documentation",
    },
    servers: [
      {
        url: `https://localhost:${process.env.PORT || 5000}`, // Use HTTPS and specify the correct port
      },
    ],
    components: {
      securitySchemes: {
        ApiKeyAuth: {
          type: "apiKey",
          in: "header",
          name: "Authorization",
          description: "Enter your bearer token (with the `Bearer ` prefix).",
        },
      },
    },
    security: [
      {
        ApiKeyAuth: [],
      },
    ],
  },
  apis: ["./routes/*.js"], // Path to the API docs
};

const swaggerDocs = swaggerJSDoc(swaggerOptions);

module.exports = { swaggerUi, swaggerDocs };
