import fetch from 'node-fetch';
import config from 'config';

import { MonoovaLoginResponse } from '../models/MonoovaLoginResponse';
import { CreateClientSessionTokenRequest } from '../models/CreateClientSessionTokenRequest';
import { CreateClientSessionTokenResponse } from '../models/CreateClientSessionTokenResponse';
import jwt from 'jsonwebtoken';

let tokenCache = {
    token: null as MonoovaLoginResponse | null,
    expiry: new Date()
};

export const loginToMonoova = async (): Promise<MonoovaLoginResponse> => {
    if (tokenCache.token && new Date() < tokenCache.expiry) {
        return tokenCache.token;
    }

    const monoovaLoginUrl: string | undefined = config.get<string>('Monoova_Token_url');
    if (!monoovaLoginUrl) {
        throw new Error('Monoova login URL is not defined in the configuration');
    }

    const userName = config.get('Mov_username');
    const password = config.get('Mov_password');
    const credentials = Buffer.from(`${userName}:${password}`).toString('base64');
    const basicAuthHeaderValue = `Basic ${credentials}`;

    const loginResponse = await fetch(monoovaLoginUrl, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': basicAuthHeaderValue
        }
    });

    if (!loginResponse.ok) {
        throw new Error(`Error logging into Monoova: ${loginResponse.statusText}`);
    }

    const monoovaLoginResponse: MonoovaLoginResponse = await loginResponse.json();

    // Decode the token to get the expiry time
    const decodedToken = jwt.decode(monoovaLoginResponse.token);
    if (decodedToken && typeof decodedToken === 'object' && 'exp' in decodedToken && decodedToken.exp) {
        tokenCache.expiry = new Date(decodedToken.exp * 1000);
        tokenCache.token = monoovaLoginResponse;
    } else {
        // Token does not have an expiry time or is not decodable
        throw new Error('Invalid token structure received from Monoova');
    }

    return monoovaLoginResponse;
};

export const createClientSessionToken = async (token: string, createClientSessionTokenRequest: CreateClientSessionTokenRequest):
    Promise<CreateClientSessionTokenResponse> => {

    const createClientSessionApiUrl: string | undefined = config.get<string>('Client_Session_Token_url');
    if (!createClientSessionApiUrl) {
        throw new Error('Create client session API URL is not defined in the configuration');
    }

    const createClientSessionAuthorizationHeader: string = `Bearer ${token}`;
    const createClientSessionResponse = await fetch(createClientSessionApiUrl, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': createClientSessionAuthorizationHeader
        },
        body: JSON.stringify(createClientSessionTokenRequest)
    });

    console.log("createClientSessionTokenRequest");
    console.log(JSON.stringify(createClientSessionTokenRequest, null, 2));
        
    const createClientSessionResponseData: CreateClientSessionTokenResponse = await createClientSessionResponse.json();
    console.log("createClientSessionResponse");
    console.log(JSON.stringify(createClientSessionResponseData, null, 2));

    const statusCode = createClientSessionResponse.status;
    if (createClientSessionResponse.ok || statusCode == 400)
        return createClientSessionResponseData;
    else if (!createClientSessionResponse.ok) {
        throw new Error(`Client session token creation failed with status code ${statusCode}`);
    }

    return createClientSessionResponseData;
};