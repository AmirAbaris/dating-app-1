var builder = WebApplication.CreateBuilder(args);

#region Nginx
// Production

// Register User Secrets for Nginx
// builder.Configuration.AddUserSecrets<Program>();

// builder.WebHost.ConfigureKestrel(serverOptions =>
// {
//     if (builder.Environment.IsProduction())
//         serverOptions.ListenLocalhost(7100); // Listen for incoming HTTP connections on port 7100
// });
#endregion

#region Add services to the container.
builder.Services.AddControllers();

// From customized ServiceExtensions (Extensions folder) for a claen maintained code //
builder.Services.AddApplicationServices(builder.Configuration, builder.Environment);
builder.Services.AddIdentityServices(builder.Configuration);
builder.Services.AddRepositoryServices();
#endregion

if (builder.Environment.IsProduction())
{
    // Production Azure: If no WEBSITE_PORT exists set to 8080
    var port = Environment.GetEnvironmentVariable("WEBSITE_PORT") ?? "8080";
    builder.WebHost.ConfigureKestrel(serverOptions =>
    {
        serverOptions.ListenAnyIP(int.Parse(port));
    });
}

#region Configure the HTTP request pipeline.
var app = builder.Build();

// created a customized ExceptionMiddleware
app.UseMiddleware<ExceptionMiddleware>();

if (app.Environment.IsProduction()) // https for production only
    app.UseHttpsRedirection();

app.UseStaticFiles();

app.UseCors();

app.UseAuthentication();

app.UseAuthorization();

app.MapControllers();

app.Run();
#endregion