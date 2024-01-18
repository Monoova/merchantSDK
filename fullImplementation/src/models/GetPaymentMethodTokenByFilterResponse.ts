export interface PaymentMethodTokenDetail {
    clientPaymentTokenUniqueReference: string;
    customer: Customer;
    creationDateTime: string;
    lastTransactionDate: string;
    expirationMonth: string;
    expirationYear: string;
    status: string;
}

export interface Customer {
    customerId: string;
    billingAddress: BillingAddress;
    emailAddress: string;
}

export interface BillingAddress {
    firstName: string;
    lastName: string;
    street: string[];
    suburb: string;
    state: string;
    postalCode: string;
    countryCode: string;
}
