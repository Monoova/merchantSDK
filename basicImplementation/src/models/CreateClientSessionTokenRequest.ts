/**
 * @openapi
 * components:
 *   schemas:
 *     CreateClientSessionTokenRequest:
 *       type: object
 *       required:
 *         - customer
 *         - paymentDetails
 *         - amount
 *         - clientTransactionUniqueReference
 *       properties:
 *         customer:
 *           $ref: '#/components/schemas/Customer'
 *         paymentDetails:
 *           $ref: '#/components/schemas/PaymentDetails'
 *         amount:
 *           $ref: '#/components/schemas/Amount'
 *         clientTransactionUniqueReference:
 *           type: string
 *     Customer:
 *       type: object
 *       required:
 *         - emailAddress
 *         - billingAddress
 *       properties:
 *         customerId:
 *           type: string
 *         emailAddress:
 *           type: string
 *         billingAddress:
 *           $ref: '#/components/schemas/BillingAddress'
 *     BillingAddress:
 *       type: object
 *       required:
 *         - firstName
 *         - lastName
 *         - postalCode
 *         - street
 *         - countryCode
 *         - suburb
 *         - state
 *       properties:
 *         firstName:
 *           type: string
 *         lastName:
 *           type: string
 *         postalCode:
 *           type: string
 *         street:
 *           type: array
 *           items:
 *             type: string
 *         countryCode:
 *           type: string
 *         suburb:
 *           type: string
 *         state:
 *           type: string
 *     PaymentDetails:
 *       type: object
 *       required:
 *         - cardType
 *         - description
 *         - saveOnSuccess
 *       properties:
 *         cardType:
 *           type: string
 *         description:
 *           type: string
 *         saveOnSuccess:
 *           type: boolean
 *         clientPaymentTokenUniqueReference:
 *           type: string
 *     Amount:
 *       type: object
 *       required:
 *         - currencyAmount
 *       properties:
 *         currencyAmount:
 *           type: string
 */
export interface CreateClientSessionTokenRequest {
  customer: Customer
  paymentDetails: PaymentDetails
  amount: Amount
  clientTransactionUniqueReference: string
}

export interface Customer {
  customerId?: string
  emailAddress: string
  billingAddress: BillingAddress
}

export interface BillingAddress {
  firstName: string
  lastName: string
  postalCode: string
  street: string[]
  countryCode: string
  suburb: string
  state: string
}

export interface Amount {
  currencyAmount: string
}

export interface PaymentDetails {
  cardType: string
  description: string
  saveOnSuccess: boolean
  clientPaymentTokenUniqueReference?: string
}
