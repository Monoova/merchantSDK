document.addEventListener('DOMContentLoaded', async (event) => {
    function toggleErrorDisplay(message) {
       const errorBox = $('#error-box');
       if (message) {
          errorBox.addClass('active').html(`<span class="ErrorText">${message}</span>`);
       } else {
          errorBox.removeClass('active').empty();
       }
    }

    async function submitPayment() {
       try {
          toggleErrorDisplay();
          const tokenResponse = await fetch('/token', {
             method: 'POST',
             headers: {
                'Content-Type': 'application/json'
             },
          })
             .then(response => {
                console.log("Response from /token:", response.status, response.statusText);
                response.clone().json()
                   .then(data => console.log(JSON.stringify(data, null, 2)))
                   .catch(() => console.log("Response from /token could not be parsed as JSON"));
                if (!response.ok) {
                   $('#checkout-container').hide();
                   return response.json().then(errorData => {
                      throw new Error(errorData.error || 'Server error');
                   });
                }
                else if (response.ok) {
                   toggleErrorDisplay();
                   $('#checkout-container').show();
                   return response.json();
                }
             });

          if (!tokenResponse || !tokenResponse.clientToken) {
             throw new Error('Invalid server response, clientToken not found');
          }

          const { clientToken } = tokenResponse;


          // custom configuration of the universal checkout is done with the options object below
          const options = {
             // Specify the selector of the html element where the universal checkout will be displayed
             // in checkout.html it is currently <div id="checkout-container"></div>
             container: '#checkout-container',
             style: {
                submitButton: {
                   base: {
                      color: '#ffffff',
                      background: '#2ab5c4',
                      borderRadius: '10px',
                      fontFamily: 'courier new',
                      fontWeight: 'bold',
                      boxShadow: 'none',
                   },
                   disabled: {
                      color: '#9b9b9b',
                      background: '#e1deda',
                   },
                },
                loadingScreen: {
                   // Color of the loading screen indicator
                   color: '#2ab5c4',
                }
             },
             errorMessage: {
                // Disable the appearance of the default error message 
                // Default to false
                disabled: true,

                // A callback for when the error message should be displayed
                onErrorMessageShow(message) {
                   var txtMsg = message;
                   // Choose to use provided message for own purposes
                },

                // A callback for when the error message
                //should be hidden
                onErrorMessageHide() {
                   // Update own UI accordingly
                },
             },

             // Change the message of the default success screen
             successScreen: {
                type: 'CHECK',
                title: 'This is a custom success message!',
             },

             //Payment lifecycle callbacks
             /**
              * When the checkout flow has been completed, you'll receive
              * the successful payment via `onCheckoutComplete`.
              * Implement this callback to redirect the user to an order confirmation page and fulfill the order.
              */
             onCheckoutComplete({ payment }) {
                var paymentJson = JSON.stringify(payment, null, 2)
                console.log('onCheckoutComplete - Checkout successful');
                console.log(paymentJson);
             },

             onCheckoutFail(error, { payment }, handler) {
                var paymentJson = JSON.stringify(payment, null, 2)
                var errorJson = JSON.stringify(error, null, 2)
                console.log('onCheckoutFail - Checkout Failed');
                console.log('errorJson:' + errorJson);

                toggleErrorDisplay("Your Payment could not be processed. Please try again later.(This is a custom error message)");
             }

          };

          // once a token is obtained the checkout dialog will be displayed to take in credit card details
          console.log("display universalCheckout");

          const universalCheckout = await Primer.showUniversalCheckout(clientToken, options);
       } catch (error) {

          if (error.errors) {
             const errorMessages = error.errors.map(err => err.errorMessage).join('<br>');
             toggleErrorDisplay(errorMessages);
          } else {
             toggleErrorDisplay(error.message || 'An error occurred, please try again later.');
          }

          console.error('Error in submitPayment:', error);
       }

    };
    submitPayment();
 });