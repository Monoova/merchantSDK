function toggleLoadingDisplay(show) {
  const loader = $('#loader');
  const formWrapper = $('#mov-form-wrapper');
  loader.toggleClass('d-flex', show).toggle(show);
  formWrapper.toggle(!show);
}

function filterAlphanumeric(s) {
  return s.replace(/[^a-zA-Z0-9_-]/g, '');
}

function toggleErrorDisplay(message) {
  const errorBox = $('#error-box');
  if (message) {
    errorBox
      .addClass('active')
      .html(`<span class="ErrorText">${message}</span>`);
  } else {
    errorBox.removeClass('active').empty();
  }
}

async function fetchCountries() {
  const response = await fetch('/api/countries');
  return response.json();
}

function initializeSelect2() {
  $('#billingCountry, #billingState').select2({
    width: 'resolve',
  });
}

function setDefaultStateForAustralia(selectedCountryCode, stateSelect) {
  if (selectedCountryCode === 'AU') {
    stateSelect.value = 'NSW';
  }
}

function populateCountryDropdown(data, countrySelect) {
  const countriesArray = Object.keys(data).map((countryCode) => ({
    code: countryCode,
    name: data[countryCode].name,
  }));
  countriesArray.sort((a, b) => a.name.localeCompare(b.name));

  countriesArray.forEach((country) => {
    const option = new Option(country.name, country.code);
    countrySelect.add(option);
  });
  countrySelect.value = 'AU';
}

function populateStateDropdown(data, selectedCountryCode, stateSelect) {
  stateSelect.innerHTML = '';
  const subdivisions = data[selectedCountryCode]?.sub || {};
  Object.keys(subdivisions).forEach((subCode) => {
    const subName = subdivisions[subCode].name;
    const stateCode = subCode.split('-').pop();
    const option = new Option(subName, stateCode);
    stateSelect.add(option);
  });
  setDefaultStateForAustralia(selectedCountryCode, stateSelect);
}

$(function () {
  $("input[data-type='currency']").on({
    keyup: function () {
      formatCurrency($(this));
    },
    blur: function () {
      formatCurrency($(this), 'blur');
    },
  });

  initializeSelect2();

  const countrySelect = document.getElementById('billingCountry');
  const stateSelect = document.getElementById('billingState');

  fetchCountries().then((data) => {
    populateCountryDropdown(data, countrySelect);

    // Populate states for the default or selected country
    populateStateDropdown(data, countrySelect.value, stateSelect);

    $('#billingCountry').on('change', function () {
      const selectedCountryCode = this.value;
      populateStateDropdown(data, selectedCountryCode, stateSelect);
    });
  });

  function formatNumber(n) {
    // format number 1000000 to 1,234,567
    return n.replace(/\D/g, '').replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  }

  function formatCurrency(input, blur) {
    // appends $ to value, validates decimal side
    var input_val = input.val();
    if (input_val === '') {
      return;
    }
    var original_len = input_val.length;
    var caret_pos = input.prop('selectionStart');
    if (input_val.indexOf('.') >= 0) {
      // get position of first decimal,  this prevents multiple decimals from being entered
      var decimal_pos = input_val.indexOf('.');
      // split number by decimal point
      var left_side = input_val.substring(0, decimal_pos);
      var right_side = input_val.substring(decimal_pos);
      // add commas to left side of number
      left_side = formatNumber(left_side);
      // validate right side
      right_side = formatNumber(right_side);
      // On blur make sure 2 numbers after decimal
      if (blur === 'blur') {
        right_side += '00';
      }
      // Limit decimal to only 2 digits
      right_side = right_side.substring(0, 2);
      // join number by .
      input_val = '$' + left_side + '.' + right_side;
    } else {
      // no decimal entered
      // add commas to number
      // remove all non-digits
      input_val = formatNumber(input_val);
      input_val = '$' + input_val;
      // final formatting
      if (blur === 'blur') {
        input_val += '.00';
      }
    }
    // send updated string to input
    input.val(input_val);
    // put caret back in the right position
    var updated_len = input_val.length;
    caret_pos = updated_len - original_len + caret_pos;
    input[0].setSelectionRange(caret_pos, caret_pos);
  }
});

validateForm = (data) => {
  const missingFields = [];
  Object.keys(data).forEach((key) => {
    if (data[key] === null || data[key] === '') {
      const label = $(`label[for="${key}"]`).text();
      missingFields.push(label || key);
    }
  });
  return missingFields;
};

//submit form
async function submitPayment(e) {
  const form = $('#mov-payment-form');
  toggleErrorDisplay();

  const formData = Object.fromEntries(new FormData(form[0]));
  const isSaveOnSuccessChecked = $('#saveOnSuccess').is(':checked');

  // Adjust validation logic based on saveOnSuccess state
  let fieldsToValidate = [
    // List of field names that are always required
    'amount',
    'cardType',
    'email',
    'billingFirstName',
    'billingLastName',
    'billingStreet',
    'billingSuburb',
    'billingCountry',
    'billingState',
    'billingPostCode',
  ];

  // Add conditional fields if saveOnSuccess is checked
  if (isSaveOnSuccessChecked) {
    fieldsToValidate.push('clientPaymentTokenUniqueReference');
  }

  const missingFields = fieldsToValidate.filter(
    (field) => !formData[field] || formData[field].trim() === ''
  );

  if (missingFields.length > 0) {
    const missingFieldsText = missingFields.join(', ');
    toggleErrorDisplay(
      `Please fill the following fields: ${missingFieldsText}`
    );
    return;
  }

  toggleErrorDisplay();
  toggleLoadingDisplay(true);

  try {
    var saveOnSuccess = $('#saveOnSuccess').is(':checked'); // Check if checkbox is checked
    var customerId = isSaveOnSuccessChecked
      ? filterAlphanumeric($('#email').val())
      : null;
    var clientPaymentTokenUniqueReference = isSaveOnSuccessChecked
      ? filterAlphanumeric($('#clientPaymentTokenUniqueReference').val())
      : null;
    console.log('saveOnSuccess:' + saveOnSuccess);
    console.log('customerId:' + customerId);
    console.log(
      'clientPaymentTokenUniqueReference:' + clientPaymentTokenUniqueReference
    );

    const postData = JSON.stringify({
      // 2 or 3 character countryCode is used to create the session
      // for example AU for Australia
      customer: {
        // emailAddress and billingAddress are required for 3DS
        customerId: customerId,
        emailAddress: formData.email,
        billingAddress: {
          firstName: formData.billingFirstName,
          lastName: formData.billingLastName,
          postalCode: formData.billingPostCode,
          street: [formData.billingStreet],
          countryCode: formData.billingCountry,
          suburb: formData.billingSuburb,
          state: formData.billingState,
        },
      },
      paymentDetails: {
        cardType: formData.cardType,
        //payment description . This will be saved in Monoova's system. This will not be passed to  issuer.
        description: 'sample token create',
        clientPaymentTokenUniqueReference: clientPaymentTokenUniqueReference,
        saveOnSuccess: saveOnSuccess,
      },
      amount: {
        currencyAmount: formData.amount.replace('$', ''),
      },
    });

    const tokenResponse = await fetch('/token', {
      method: 'post',
      headers: {
        'Content-Type': 'application/json',
      },
      body: postData,
    }).then((response) => {
      console.log(
        'Response from /token:',
        response.status,
        response.statusText
      );
      response
        .clone()
        .json()
        .then((data) => console.log(JSON.stringify(data, null, 2)))
        .catch(() =>
          console.log('Response from /token could not be parsed as JSON')
        );

      toggleLoadingDisplay(false);

      if (!response.ok) {
        $('#checkout-container').hide();
        return response.json().then((errorData) => {
          throw new Error(errorData.error || 'Server error');
        });
      } else if (response.ok) {
        toggleErrorDisplay();
        $('#checkout-container').show();
        return response.json();
      }
    });

    if (!tokenResponse || !tokenResponse.clientToken) {
      throw new Error('Invalid server response, clientToken not found');
    }

    $('#mov-form-wrapper').hide();

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
        },
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
        var paymentJson = JSON.stringify(payment, null, 2);
        console.log('onCheckoutComplete - Checkout successful');
        console.log(paymentJson);
      },

      onCheckoutFail(error, { payment }, handler) {
        var paymentJson = JSON.stringify(payment, null, 2);
        var errorJson = JSON.stringify(error, null, 2);
        console.log('onCheckoutFail - Checkout Failed');
        console.log('errorJson:' + errorJson);

        toggleErrorDisplay(
          'Your Payment could not be processed. Please try again later.(This is a custom error message)'
        );
      },
    };

    // once a token is obtained the checkout dialog will be displayed to take in credit card details
    console.log('display universalCheckout');
    const universalCheckout = await Primer.showUniversalCheckout(
      clientToken,
      options
    );
  } catch (error) {
    toggleLoadingDisplay(false);

    if (error.errors) {
      const errorMessages = error.errors
        .map((err) => err.errorMessage)
        .join('<br>');
      toggleErrorDisplay(errorMessages);
    } else {
      toggleErrorDisplay(
        error.message || 'An error occurred, please try again later.'
      );
    }

    console.error('Error in submitPayment:', error);
  }
}

$(window).resize(initializeSelect2);

$(document).ready(function () {
  $('#saveOnSuccess').change(function () {
    // Using jQuery's toggleClass to add or remove the 'd-none' class based on the checkbox state
    $('#paymentTokenContainer').toggleClass('d-none', !this.checked);
    $('#paymentTokenNote').toggleClass('d-none', !this.checked);
  });

  $('#continueButton').click(function () {
    var email = $('#emailForDemo').val();
    if (email && filterAlphanumeric(email)) {
      // Check if the email is not empty
      window.location.href =
        '/continue?custId=' + encodeURIComponent(filterAlphanumeric(email));
    } else {
      alert('Please enter a valid email address.'); // Alert if the email input is empty
    }
  });
});
