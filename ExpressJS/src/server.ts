import express, { Express, Request, Response } from 'express'
import path from 'path'
import dotenv from 'dotenv'
import swaggerUi from 'swagger-ui-express'
import swaggerSpec from './swaggerDef'

import * as tokenController from './controllers/tokenController'

dotenv.config()

const app: Express = express()

app.use(express.json())
app.use('/static', express.static(path.join(__dirname, 'static')))
app.use(express.static('public'))

// Swagger Setup
app.use('/swagger', swaggerUi.serve, swaggerUi.setup(swaggerSpec))

// Routes
app.get('/', (req: Request, res: Response) =>
  res.sendFile(path.join(__dirname, 'static', 'checkout.html'))
)

app.post('/token', tokenController.createToken)

app.post('/createTokenCustomInput', tokenController.createTokenCustomInput)

const PORT = process.env.PORT || 8080
app.listen(PORT, () => console.log(`Server is running on http://localhost:${PORT}`))
