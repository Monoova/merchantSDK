import fetch from 'node-fetch';
import config from 'config';

import { MonoovaLoginResponse } from '../models/MonoovaLoginResponse';
import { CreateClientSessionTokenRequest } from '../models/CreateClientSessionTokenRequest';
import { CreateClientSessionTokenResponse } from '../models/CreateClientSessionTokenResponse';
import { PaymentMethodTokenDetail } from '../models/GetPaymentMethodTokenByFilterResponse';
import { CreatePaymentFromTokenRequest } from '../models/CreatePaymentFromTokenRequest';
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

export const getPaymentMethodTokenByFilter = async (token: string, customerId: string):
    Promise<PaymentMethodTokenDetail[]> => {

    const baseUrl: string | undefined = config.get<string>('CCM_Base_url');
    if (!baseUrl) {
        throw new Error('Ccm URL is not defined in the configuration');
    }

    const apiUrl = `${baseUrl}PaymentMethodToken?customerId=${customerId}`;
    const authorizationHeader: string = `Bearer ${token}`;

    const response = await fetch(apiUrl, {
        method: 'GET',
        headers: {
            'Authorization': authorizationHeader
        },
    });

    console.log("API Request URL:");
    console.log(apiUrl);

    if (response.ok) {
        const responseData = await response.json();
        console.log("API Response:");
        console.log(JSON.stringify(responseData, null, 2));
        return responseData.paymentMethodTokenDetails;
    } else {
        throw new Error(`API call failed with status code ${response.status}`);
    }
};

export const createPaymentFromToken = async (
    token: string, 
    createPaymentFromTokenRequest: CreatePaymentFromTokenRequest
): Promise<CreateClientSessionTokenResponse> => {

    const baseUrl: string | undefined = config.get<string>('CCM_Base_url');
    if (!baseUrl) {
        throw new Error('Ccm URL is not defined in the configuration');
    }

    const apiUrl = `${baseUrl}CreditCardTransaction/payment`;
    if (!apiUrl) {
        throw new Error('Payment API URL is not defined in the configuration');
    }

    const authorizationHeader: string = `Bearer ${token}`;
    const paymentResponse = await fetch(apiUrl, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': authorizationHeader
        },
        body: JSON.stringify(createPaymentFromTokenRequest)
    });

    console.log("createPaymentFromTokenRequest");
    console.log(JSON.stringify(createPaymentFromTokenRequest, null, 2));
        
    const paymentResponseData: CreateClientSessionTokenResponse = await paymentResponse.json();
    console.log("paymentResponse");
    console.log(JSON.stringify(paymentResponseData, null, 2));

    const statusCode = paymentResponse.status;
    if (paymentResponse.ok || statusCode == 400)
        return paymentResponseData;
    else if (!paymentResponse.ok) {
        throw new Error(`Payment creation failed with status code ${statusCode}`);
    }

    return paymentResponseData;
};
