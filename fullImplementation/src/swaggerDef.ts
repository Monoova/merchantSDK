import swaggerJsdoc from 'swagger-jsdoc'

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'My API',
      version: '1.0.0',
      description: 'Example Full Implementation'
    },
    servers: [
      {
        url: 'http://localhost:8080',
        description: 'Development server'
      }
    ]
  },

  apis: ['./src/**/*.ts']
}

const swaggerSpec = swaggerJsdoc(options)
export default swaggerSpec
