namespace BasicImplementationDotNet.Models;

public class BaseResponse
{
    public List<Error> Errors { get; set; }
}

public class Error
{
    public string ErrorCode { get; set; }

    public string ErrorMessage { get; set; }
}