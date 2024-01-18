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

$(function () {
  $("input[data-type='currency']").on({
    keyup: function () {
      formatCurrency($(this));
    },
    blur: function () {
      formatCurrency($(this), 'blur');
    },
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

//submit form
async function submitPayment(e) {
  const form = $('#mov-payment-form');
  toggleErrorDisplay('');

  // Capture form data
  const selectedMethod = $('#selectMethod').val();
  const amount = $('#amount').val().replace('$', '').replace(/,/g, ''); // Remove $ and commas
  const description = $('#description').val();
  const customerId = $('#customerId').val();

  // Validate required fields
  if (!selectedMethod || !amount || !description || !customerId) {
    toggleErrorDisplay('Please fill all the required fields.');
    return;
  }

  toggleLoadingDisplay(true);

  const postData = {
    customer: {
      customerId: customerId,
    },
    paymentDetails: {
      clientPaymentTokenUniqueReference: selectedMethod,
      description: description,
    },
    amount: {
      currencyAmount: parseFloat(amount),
    },
  };

  try {
    // Send request to /resume-payment endpoint
    const response = await fetch('/resume-payment', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(postData),
    });

    toggleLoadingDisplay(false);

    if (!response.ok) {
      // Display a generic error message for all HTTP errors
      toggleErrorDisplay(
        'A problem occurred with your request. Please try again later.'
      );
      return;
    }

    const responseData = await response.json();
    console.log('Response Data:', responseData);

    $('#mov-form-wrapper').hide();
    $('#mov-status-wrapper').show();

    if (responseData.status === 'Declined') {
      // Handle the declined status
      $('#response-status').text('Payment Declined');
      $('#response-text').text(
        'Your payment request was declined. Please try again or contact support.'
      );
    } else {
      // Handle successful status
      $('#response-status').text('Payment Successful');
      $('#response-text').text(
        `Transaction Reference: ${responseData.clientTransactionUniqueReference}`
      );
    }
  } catch (error) {
    console.error('Error in submitPayment:', error);
    toggleErrorDisplay(
      error.message || 'An error occurred, please try again later.'
    );
  }
}

$(document).ready(function () {});
