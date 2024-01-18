using System.Net;
using BasicImplementationDotNet.Models;
using Newtonsoft.Json;
using Newtonsoft.Json.Serialization;

namespace BasicImplementationDotNet.Middleware;

public class ExceptionHandlingMiddleware
{
    private readonly RequestDelegate _requestDelegate;
    private readonly ILogger<ExceptionHandlingMiddleware> _logger;

    public ExceptionHandlingMiddleware(RequestDelegate requestDelegate, ILogger<ExceptionHandlingMiddleware> logger)
    {
        _requestDelegate = requestDelegate;
        _logger = logger;
    }

    public async Task Invoke(HttpContext context)
    {
        try
        {
            await _requestDelegate(context);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "error in exception handling middleware");

            var response = context.Response;
            response.ContentType = "application/json";
            response.StatusCode = (int) HttpStatusCode.InternalServerError;
            var errorResponse = new BaseResponse
            {
                Errors = new List<Error>()
                {
                    new()
                    {
                        ErrorCode = "InternalServerError", 
                        ErrorMessage = ex.ToString()
                    }
                }
            };

            var json = JsonConvert.SerializeObject(errorResponse, new JsonSerializerSettings
            {
                NullValueHandling = NullValueHandling.Ignore,
                ContractResolver = new CamelCasePropertyNamesContractResolver()
            });

            await response.WriteAsync(json);
        }
    }
}