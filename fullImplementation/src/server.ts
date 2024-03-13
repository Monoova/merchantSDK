import express, { Express, Request, Response } from 'express'
import path from 'path'
import dotenv from 'dotenv'
import iso3166 from 'iso-3166-2'
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

app.get('/api/countries', (req: Request, res: Response) => {
  res.json(iso3166.data)
})

tokenController.backendHandshake()

const PORT = process.env.PORT || 8080
app.listen(PORT, () => console.log(`Server is running on http://localhost:${PORT}`))
