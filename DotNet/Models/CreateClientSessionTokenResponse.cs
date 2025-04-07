namespace BasicImplementationDotNet.Models;

public class CreateClientSessionTokenResponse : BaseResponse
{
    public string ClientTransactionUniqueReference { get; set; }
    public string ClientToken { get; set; }
    public string ClientTokenExpirationDate { get; set; }
    public string TraceId { get; set; }
}