// tokenController.ts
import { Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import * as monoovaService from '../services/monoovaService';
import { MonoovaLoginResponse } from '../models/MonoovaLoginResponse';
import { CreateClientSessionTokenRequest } from '../models/CreateClientSessionTokenRequest';


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

export const backendHandshake = async () => {
    try {
        const token = await monoovaService.loginToMonoova();
        return token;
    } catch (error) {
        throw new Error("Could not generate token");
    }
};