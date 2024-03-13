/**
 * @openapi
 * components:
 *   schemas:
 *     MonoovaApiError:
 *       type: object
 *       properties:
 *         errorCode:
 *           type: string
 *           description: The error code
 *         errorMessage:
 *           type: string
 *           description: A descriptive error message
 *
 *     MonoovaApiBaseResponse:
 *       type: object
 *       properties:
 *         errors:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/MonoovaApiError'
 *
 *     CreateClientSessionTokenResponse:
 *       type: object
 *       properties:
 *         clientTransactionUniqueReference:
 *           type: string
 *           description: Unique reference for the client transaction
 *         clientToken:
 *           type: string
 *           description: The client token
 *         clientTokenExpirationDate:
 *           type: string
 *           format: date-time
 *           description: Expiration date of the client token
 *         traceId:
 *           type: string
 *           description: Trace ID for debugging and tracing
 *       required:
 *         - clientTransactionUniqueReference
 *         - clientToken
 *         - clientTokenExpirationDate
 *         - traceId
 *       allOf:
 *         - $ref: '#/components/schemas/MonoovaApiBaseResponse'
 */
export interface CreateClientSessionTokenResponse extends MonoovaApiBaseResponse {
  clientTransactionUniqueReference: string
  clientToken: string
  clientTokenExpirationDate: string
  traceId: string
}

export interface MonoovaApiError {
  errorCode: string
  errorMessage: string
}

export interface MonoovaApiBaseResponse {
  errors: MonoovaApiError[]
}
