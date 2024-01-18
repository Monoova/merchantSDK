// tokenController.ts
import { Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import * as monoovaService from '../services/monoovaService';
import { MonoovaLoginResponse } from '../models/MonoovaLoginResponse';
import { CreateClientSessionTokenRequest } from '../models/CreateClientSessionTokenRequest';
import { CreatePaymentFromTokenRequest } from '../models/CreatePaymentFromTokenRequest';


/**
 * @openapi
 * /token:
 *   post:
 *     summary: Create a new token
 *     tags:
 *       - Token
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateClientSessionTokenRequest'
 *     responses:
 *       200:
 *         description: Successfully created token
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/CreateClientSessionTokenResponse'
 *       400:
 *         description: Bad Request
 *       500:
 *         description: Internal Server Error
 */
export const createToken = async (req: Request, res: Response) => {
    try {
        const createClientSessionTokenRequest: CreateClientSessionTokenRequest = req.body;
        if (!createClientSessionTokenRequest.clientTransactionUniqueReference) {
            createClientSessionTokenRequest.clientTransactionUniqueReference = uuidv4();
        }

        const loginResponse: MonoovaLoginResponse = await monoovaService.loginToMonoova();

        const createTokenResponse = await monoovaService.createClientSessionToken(loginResponse.token, createClientSessionTokenRequest)

        if (createTokenResponse.errors && createTokenResponse.errors.length > 0) {
            const errorDetails = createTokenResponse.errors.map(error => error.errorMessage).join('; ');
            return res.status(400).json({ error: errorDetails });
        }

        res.json(createTokenResponse);
    } catch (error) {
        console.error('Error processing /token endpoint:', error);
        if (error instanceof Error) {
            res.status(500).json({ error: error.message });
        } else {
            res.status(500).json({ error: 'Internal Server Error' });
        }
    }
};

export const getMethods = async (req: Request, res: Response) => {
    try {
        const email = req.query.custId as string; // Cast email to string since query parameters are always strings

        if (!email) {
            return res.status(400).json({ error: 'Email query parameter is required' });
        }

        const loginResponse: MonoovaLoginResponse = await monoovaService.loginToMonoova();

        const getMethodsResponse = await monoovaService.getPaymentMethodTokenByFilter(loginResponse.token, email);

        const activeMethods = getMethodsResponse.filter(method => method.status === 'Active');
        console.log(activeMethods);

        if (activeMethods.length === 0) {
            return res.status(404).render('methods-list', { activeMethods: [], customerId: email });
        }

        res.render('methods-list', { activeMethods, customerId: email });
    } catch (error) {
        console.error('Error processing /token endpoint:', error);
        if (error instanceof Error) {
            res.status(500).json({ error: error.message });
        } else {
            res.status(500).json({ error: 'Internal Server Error' });
        }
    }
};

export const resumePayment = async (req: Request, res: Response) => {
    try {
        const formData = req.body;
        const createPaymentFromTokenRequest: CreatePaymentFromTokenRequest = {
            clientTransactionUniqueReference: formData.clientTransactionUniqueReference,
            customer: {
                customerId: formData.customer.customerId,
            },
            paymentDetails: {
                clientPaymentTokenUniqueReference: formData.paymentDetails.clientPaymentTokenUniqueReference,
                description: formData.paymentDetails.description
            },
            amount: {
                currencyAmount: formData.amount.currencyAmount
            }
        };

        if (!createPaymentFromTokenRequest.clientTransactionUniqueReference) {
            createPaymentFromTokenRequest.clientTransactionUniqueReference = uuidv4();
        }

        const loginResponse: MonoovaLoginResponse = await monoovaService.loginToMonoova();

        const reuseTokenResponse = await monoovaService.createPaymentFromToken(loginResponse.token, createPaymentFromTokenRequest)

        if (reuseTokenResponse.errors && reuseTokenResponse.errors.length > 0) {
            const errorDetails = reuseTokenResponse.errors.map(error => error.errorMessage).join('; ');
            return res.status(400).json({ error: errorDetails });
        }

        res.json(reuseTokenResponse);
    } catch (error) {
        console.error('Error processing /token endpoint:', error);
        if (error instanceof Error) {
            res.status(500).json({ error: error.message });
        } else {
            res.status(500).json({ error: 'Internal Server Error' });
        }
    }
};

export const backendHandshake = async () => {
    try {
        const token = await monoovaService.loginToMonoova();
        return token;
    } catch (error) {
        throw new Error("Could not generate token");
    }
};