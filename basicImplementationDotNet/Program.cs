using System.Text.Json;
using System.Text.Json.Serialization;

using BasicImplementationDotNet.Configuration;
using BasicImplementationDotNet.Middleware;
using BasicImplementationDotNet.Services;
using Microsoft.Extensions.FileProviders;
using NLog;
using NLog.Web;

var logger = LogManager.Setup().LoadConfigurationFromAppSettings().GetCurrentClassLogger();
logger.Debug("init app");
try
{
    var builder = WebApplication.CreateBuilder(args);
    builder.Logging.ClearProviders();
    builder.Host.UseNLog(new NLogAspNetCoreOptions
    {
        CaptureMessageTemplates = true,
        CaptureMessageProperties = true,
        IncludeScopes = true,
    });
    builder.Services.AddControllers()
        .AddJsonOptions(options =>
        {
            options.JsonSerializerOptions.PropertyNamingPolicy = JsonNamingPolicy.CamelCase;
            options.JsonSerializerOptions.DefaultIgnoreCondition = JsonIgnoreCondition.WhenWritingNull;
        });
    builder.Services.AddEndpointsApiExplorer();
    builder.Services.AddSwaggerGen();

    builder.Services.Configure<MonoovaSettings>(builder.Configuration.GetSection("MonoovaSettings"));
    builder.Services.AddScoped<IMonoovaApiService, MonoovaApiService>();

    var app = builder.Build();
    Console.WriteLine(app.Environment.EnvironmentName);
    logger.Info($"ASP.NET Core Environment: {app.Environment.EnvironmentName}");

    // Configure the HTTP request pipeline.
    if (app.Environment.IsDevelopment())
    {
        app.UseDeveloperExceptionPage();
        app.UseSwagger();
        app.UseSwaggerUI(c => c.SwaggerEndpoint("/swagger/v1/swagger.json", "Example Implementation"));
    }
    
    var staticFilesPath = Path.Combine(app.Environment.WebRootPath ?? "wwwroot");
    app.UseStaticFiles(new StaticFileOptions
    {
        FileProvider = new PhysicalFileProvider(staticFilesPath),
        RequestPath = "/static"
    });

    app.UseMiddleware<ExceptionHandlingMiddleware>();

    app.UseHttpsRedirection();
    app.UseAuthorization();
    app.MapControllers();

    // serve the checkout page when navigating to http://localhost:{port}/
    // this will then call the TokenController /Token endpoint to create a client session token 
    app.MapGet("/", async context =>
    {
        var filePath = Path.Combine(staticFilesPath, "checkout.html");
        context.Response.ContentType = "text/html";
        await context.Response.SendFileAsync(filePath);
    });

    app.Run();
}
catch (Exception exception)
{
    logger.Fatal(exception, "Stopped app because of exception");
    throw;
}
finally
{
    LogManager.Shutdown();
}