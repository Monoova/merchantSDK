export interface BillingAddress {
    firstName?: string;
    lastName?: string;
    street: string[];
    suburb?: string;
    state?: string;
    postalCode?: string;
    countryCode?: string;
}

export interface Customer {
    customerId: string;
    billingAddress?: BillingAddress;
    emailAddress?: string;
}

export interface PaymentDetails {
    clientPaymentTokenUniqueReference: string;
    description: string;
}

export interface Amount {
    currencyAmount: number;
}

export interface CreatePaymentFromTokenRequest {
    clientTransactionUniqueReference: string;
    customer: Customer;
    paymentDetails: PaymentDetails;
    amount: Amount;
}
