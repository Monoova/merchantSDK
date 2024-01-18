using BasicImplementationDotNet.Models;
using BasicImplementationDotNet.Services;
using Microsoft.AspNetCore.Mvc;

namespace BasicImplementationDotNet.Controllers;

[ApiController]
[Route("[controller]")]
public class TokenController : ControllerBase
{
    private readonly ILogger _logger;
    private readonly IMonoovaApiService _monoovaApiService;

    public TokenController(
        ILogger<TokenController> logger,
        IMonoovaApiService monoovaApiService)
    {
        _logger = logger;
        _monoovaApiService = monoovaApiService;
    }

    /// <summary>
    /// use this endpoint to create a client session token with sample input from PopulateRequestSample() method
    /// </summary>
    [HttpPost]
    public async Task<ActionResult<CreateClientSessionTokenResponse>> GetClientSessionTokenAsync(
        CancellationToken cancellationToken)
    {
        var request = PopulateRequestSample();
        _logger.LogInformation("Received request to create Client Session Token for {request}", request);
        var loginResponse = await _monoovaApiService.LoginToMonoovaAsync(cancellationToken);
        if (loginResponse.Errors != null)
            return BadRequest(loginResponse);

        _logger.LogInformation("Successfully logged in with bearer token: {token}", loginResponse.Token);
        
        var tokenResponse = await _monoovaApiService.CreateClientSessionTokenAsync(loginResponse.Token, request, cancellationToken);
        if (tokenResponse.Errors != null)
            return BadRequest(tokenResponse);

        _logger.LogInformation("Successfully created Client Session Token: {token}", tokenResponse.ClientToken);
        return tokenResponse;
    }

    
    /// <summary>
    /// use this endpoint to create a client session token with custom input
    /// </summary>
    [HttpPost]
    [Route("TokenCustomInput")]
    public async Task<ActionResult<CreateClientSessionTokenResponse>> CreateClientSessionTokenWithCustomPayloadAsync(
        [FromBody] CreateClientSessionTokenRequest request,
        CancellationToken cancellationToken)
    {
        _logger.LogInformation("Received request to create Client Session Token for {request}", request);
        var loginResponse = await _monoovaApiService.LoginToMonoovaAsync(cancellationToken);
        if (loginResponse.Errors != null)
            return BadRequest(loginResponse);
        _logger.LogInformation("Successfully logged in with bearer token: {token}", loginResponse.Token);
        
        var tokenResponse = await _monoovaApiService.CreateClientSessionTokenAsync(loginResponse.Token, request, cancellationToken);
        if (tokenResponse.Errors != null)
            return BadRequest(tokenResponse);

        _logger.LogInformation("Successfully created Client Session Token: {token}", tokenResponse.ClientToken);
        return tokenResponse;
    }


    private static CreateClientSessionTokenRequest PopulateRequestSample()
    {
        var request = new CreateClientSessionTokenRequest
        {
            Customer = new Customer
            {
                CustomerId = "testCustomerId",
                EmailAddress = "test@gmail.com",
                BillingAddress = new BillingAddress
                {
                    FirstName = "testFirstName",
                    LastName = "testLastName",
                    PostalCode = "2000",
                    Street = new List<string> { "100 Sussex street" },
                    CountryCode = "AU",
                    Suburb = "SYDNEY",
                    State = "NSW"
                }
            },
            PaymentDetails = new PaymentDetails
            {
                CardType = "Visa",
                Description = "sample token create",
                SaveOnSuccess = false
            },
            Amount = new Amount
            {
                CurrencyAmount = "1.00"
            },
            ClientTransactionUniqueReference = Guid.NewGuid().ToString()
        };
        return request;
    }
}