using BasicImplementationDotNet.Models;

namespace BasicImplementationDotNet.Services;

public interface IMonoovaApiService
{
    Task<MonoovaLoginResponse> LoginToMonoovaAsync(CancellationToken cancellationToken);
    Task<CreateClientSessionTokenResponse> CreateClientSessionTokenAsync(string authToken, CreateClientSessionTokenRequest request, CancellationToken cancellationToken);
}