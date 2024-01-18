import express, { Express, Request, Response } from 'express';
import path from 'path';
import dotenv from 'dotenv';
import iso3166 from 'iso-3166-2';
import swaggerUi from 'swagger-ui-express';
import swaggerSpec from './swaggerDef';
import { auth } from 'express-openid-connect';
import config from 'config';

import * as tokenController from './controllers/tokenController';

dotenv.config();

const app: Express = express();

app.set('view engine', 'ejs');

app.use(express.json());
app.use('/static', express.static(path.join(__dirname, 'static')));
app.use(express.static('public'));

// Swagger Setup
app.use('/swagger', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

const checkoutPage = path.join(__dirname, 'static', 'checkout.html' )

// Routes
app.get('/', (req, res) => {
    return res.sendFile(
      checkoutPage
      );
  });
  
app.post('/token', tokenController.createToken);

app.get('/continue', tokenController.getMethods);

app.post('/resume-payment', tokenController.resumePayment);

app.get('/api/countries', (req: Request, res: Response) => {
    res.json(iso3166.data);
});

tokenController.backendHandshake();

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => console.log(`Server is running on http://localhost:${PORT}`));
