# Introduction

This sample application was developed using Node.js and the [Express.js](https://expressjs.com/) framework. It demonstrates how to integrate with a Card Gateway for a sample customer.

We also include a .NET solution and a basic implementation for your convenience. These can be run independently of each other and are included for demonstration and simplified prototyping.

This repository also includes a GitHub Action that triggers on every code check-in to automatically compute a SHA256 checksum for any modified files. The computed checksums are stored in a file named FILE_CHECKSUMS.txt, ensuring file integrity and providing a reliable reference for verifying that files remain unaltered.

# Prerequisites

Before running this sample application, you must obtain an `mAccount` to gain access to the API Gateway.

You can acquire an `mAccount` through Monoova's Developer Portal https://developer.monoova.com/ or, by contacting [Monoova Support directly](https://www.monoova.com/contact).

You will also need to install Node.js to run the sample application.

The .NET solution uses .NET 7.0, and the solution (.sln) file can be opened with an IDE such as Visual Studio 2022.

# Getting Started

1. Clone the Repo.

- The repo has two implementations
  - ExpressJS folder: Does not include the HTML form to take inputs to create a client session. Instead, it is hardcoded in the expressjs application.
  - DotNet folder: Intended to show the same information as the ExpressJS code. Here, the build process matches the general workflow for .NET applications in Visual Studio, including normal steps building and debugging a .Net 7 app (which run when you select and run a debugger).
- choose your implementation in your editor of choice; Visual Studio code is an example. To open DotNet we recommend using Visual Studio 2022 or above.

2. Navigate to your `config/sandbox.json` and make any necessary edits to the configuration settings.
   (Note: DotNet requires customising `appsettings.json` or `appsettings.Development.json`)

```json
{
  "Mov_username": "your mAccount number (e.g., 62************)",
  "Mov_password": "your password (e.g., 67A***-****-****-*****-*****)",
  "APIM_Token_URL": "Monoova Supplied URL to generate Bearer token to access CC services",
  "Client_Session_token_url": "Monoova Provided Url to create a Client session."
}
```

# Running

Finally, you can run the npm commands (you will need npm installed):

- npm install
- npm start

This will run a local instance of the code.

# Application Overview

This Node.js Express application serves up a `checkout.html` page, which includes a form for customer details. The form payload is sent to the `/token` endpoint upon submission.

The `/token` endpoint handles authentication with Monoova using credentials from the configuration file, returning a bearer token. This bearer token is then used in subsequent requests to create a client session.

A test credit card can be used with the following details:

- **Number**: 4111111111111111
- **Expiration**: 12/31
- **CCV**: 111
- **Name**: Any name

# Steps to rebuild the sample app

1. Add checkout scripts in your application (from `checkout.html`)
2. Generate the bearer token using the Token URL, using the mAccount number as username and the API key as password, with the Basic auth scheme.
3. Call `Client_Session_token_url` using the Bearer token in the header (generated earlier) with the Customer details in the body (as captured in `Checkout.html` in Demo).

## Customer details

The customer details are shown below and will be serialised and sent as a body to generate a Client Session via "Client_Session_token_url":

```json
{
  "customer": {
    "customerId": "",
    "emailAddress": "",
    "billingAddress": {
      "firstName": "",
      "lastName": "",
      "postalCode": "",
      "street": [""],
      "countryCode": "",
      "suburb": "",
      "state": ""
    }
  },
  "paymentDetails": {
    "cardType": "",
    "description": "sample token create",
    "saveOnSuccess": false,
    "capturePayment": false,
    "clientPaymentTokenUniqueReference": "",
    "applySurcharge": false
  },
  "amount": {
    "currencyAmount": ""
  },
  "clientTransactionUniqueReference": ""
}
```

## Updating the SDK Version

New versions are released periodically with additional features and performance improvements. To update the SDK to the latest version, replace the version number in the stylesheet link and Primer script.

```html
<link rel="stylesheet" href="https://sdk.primer.io/web/v2.45.8/Checkout.css" />
<script
  src="https://sdk.primer.io/web/v2.45.8/Primer.min.js"
  crossorigin="anonymous"
></script>
```

The current version of the SDK is 2.45.8.

## Client.js

This script initiates a server request to the `/token` endpoint. It utilises the provided JSON body for the request. Upon successfully retrieving the token, it invokes the Universal Checkout process.

The client session and any UI customisation options are passed along during this step.

## Callback Handling

The `options` object facilitates the integration of several callback functions to manage different stages of the checkout process, enhancing user experience and providing detailed feedback on transaction outcomes. Primarily, it includes onCheckoutComplete and onCheckoutFail callbacks but can be extended with additional callbacks for a more nuanced handling of the checkout lifecycle.

- onCheckoutComplete
  This callback is invoked with a payment object when a payment has been successfully processed. It allows you to transition users to a success state, such as redirecting them to an order confirmation page and performing any necessary post-payment actions like updating the database with the order status.
  ```javascript
  onCheckoutComplete: (payment) => {
    console.log(payment);
  };
  ```
- onCheckoutFail  
  Triggered in the event of a payment processing error or failure. It receives an error object detailing the cause of the failure, the payment object (if available), and a handler for implementing custom actions based on the error. This allows for tailored error messaging or attempts to retry the payment.
  ```javascript
  onCheckoutFail: (error, data, handler) => {
    if (!handler) {
      return;
    }
    // Show a default error message
    handler.showErrorMessage();
    // Or show a custom error message
    // handler.showErrorMessage('This is my custom message');
  };
  ```

Additional Callbacks  
For a comprehensive handling of other possible checkout scenarios, consider implementing these additional callbacks:

- onBeforeCheckoutStart: Invoked right before the checkout process begins. Useful for pre-checkout validations or configurations.
- onCheckoutStart: Called when the checkout process officially starts, allowing for UI adjustments or analytics tracking.
- onCheckoutCancel: Triggered if the user cancels the checkout process, enabling cleanup actions or UI updates to reflect the cancellation.
- onPaymentMethodShow and onPaymentMethodHide: These callbacks are useful for managing UI elements based on the visibility of payment methods, aiding in creating a dynamic and responsive checkout experience.

## Tokenising Card Details

Customer card details can be saved as a token and used for subsequent purchases by setting `saveOnSuccess` to true in the client session payload. If the card details are validated as correct, this will result in a token being generated and saved against the customers `customerId`.

To save card details without taking an upfront payment, pass `saveOnSuccess` as `true`, `capturePayment` as `false`, and the `amount` as $0.01.

## Surcharging

To add a surcharge to the card payment, pass `ApplySurcharge` as true. Monoova will identify the card type used in the transaction and apply the preconfigured surcharge amount. This surcharge amount is configured in the Monoova backend and can be changed by contacting Monoova support.

## Options Style customisation

Edit Checkout.html and style.css to apply Host themes.

As an iframe is used for PCI reasons, not all host styles are inherited by the card form, such as font-family. The CSS for the card form is contained in #Checkout-container ID. A default style will be used for elements where custom CSS is not passed.

Include CSS styles for form fields in:

```css
{
  "input": {
    "base": {
      "borderStyle": "none none solid none",
      "borderColor": "#000000",
      "boxShadow": "0px",
      "background": "#ffffff",
      "fontFamily": "courier new",
      "borderRadius": "0px",
      "paddingHorizontal": "0px",
      "lineHeight": "",
      "color": "#000000"
    },
    "error": {
      "borderStyle": "solid",
      "borderColor": "#d0021b"
    }
  }
}
```

Include CSS Styles for the submit button in:

```json
{
  "submitButton": {
    "base": {
      "color": "#ffffff",
      "background": "#2ab5c4",
      "borderRadius": "10px",
      "fontFamily": "sans-serif",
      "fontWeight": "bold",
      "boxShadow": "none"
    }
  }
}
```

For other style options, such as error styles, disabled form styles and loading styles please contact Monoova support.

## Server.ts

This file is the backend application written in expressJS, handling all API calls to Monoova. It abstracts the details of each specific call.

- The application serves a `checkout.html` page with a form to capture customer details.
- The form payload is sent to the `/token` endpoint when the form is submitted.
  The `/token` endpoint authenticates with Monoova using credentials provided from the configuration file and returns a bearer token.
- The bearer token is used in the subsequent request to create a client session.
- there is also a `/swagger` endpoint when running either implementation to test custom token payloads.
