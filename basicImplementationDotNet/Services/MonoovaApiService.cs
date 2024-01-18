using System.Net;
using System.Text;
using BasicImplementationDotNet.Configuration;
using BasicImplementationDotNet.Models;
using Flurl.Http;
using Microsoft.Extensions.Options;

namespace BasicImplementationDotNet.Services;

public class MonoovaApiService : IMonoovaApiService
{
    private readonly ILogger<MonoovaApiService> _logger;
    private readonly IOptions<MonoovaSettings> _monoovaSettings;

    public MonoovaApiService(
        ILogger<MonoovaApiService> logger, 
        IOptions<MonoovaSettings> monoovaSettings)
    {
        _logger = logger;
        _monoovaSettings = monoovaSettings;
    }

    public async Task<MonoovaLoginResponse> LoginToMonoovaAsync(CancellationToken cancellationToken)
    {
        try
        {
            var username = _monoovaSettings.Value.Username;
            var password = _monoovaSettings.Value.Password;
            var basicAuth = $"{username}:{password}";
            var basicAuthHeader = $"Basic {Convert.ToBase64String(Encoding.UTF8.GetBytes(basicAuth))}";
            var url = _monoovaSettings.Value.MonoovaLoginUrl;

            var response = await url
                .AllowHttpStatus("401")
                .WithHeader("Authorization", basicAuthHeader)
                .PostAsync(cancellationToken: cancellationToken);

            var httpResponse = response.ResponseMessage;
            
            if (!httpResponse.IsSuccessStatusCode && httpResponse.StatusCode == HttpStatusCode.Unauthorized)
            {
                return new MonoovaLoginResponse()
                {
                    Errors = new List<Error>()
                    {
                        new()
                        {
                            ErrorCode = "Unauthorized",
                            ErrorMessage = "Unauthorized Invalid username / password combination",
                        }
                    }
                };
            }

            var result = await response.GetJsonAsync<MonoovaLoginResponse>();
            return result;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "error logging into Monoova");
            throw;
        }
    }

    public async Task<CreateClientSessionTokenResponse> CreateClientSessionTokenAsync(string authToken, CreateClientSessionTokenRequest request, CancellationToken cancellationToken)
    {
        try
        {
            var url = _monoovaSettings.Value.ClientSessionTokenUrl;
            
            var response = await url
                .AllowHttpStatus("400")
                .WithOAuthBearerToken(authToken)
                .WithHeader("mAccount", _monoovaSettings.Value.Username)
                .PostJsonAsync(request, cancellationToken);

            var httpResponse = response.ResponseMessage;

            if (!httpResponse.IsSuccessStatusCode)
            {
                var errorContent = await httpResponse.Content.ReadAsStringAsync(cancellationToken);
                _logger.LogError("Error creating client session token. Response: {ResponseContent}", errorContent);
            }

            var result = await response.GetJsonAsync<CreateClientSessionTokenResponse>();
            return result;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error creating client session token in Monoova");
            throw;
        }
    }
}