using HuflitCampus.Api.Authorization;
using HuflitCampus.Api.Middleware;
using HuflitCampus.Application;
using HuflitCampus.Infrastructure;
using HuflitCampus.Infrastructure.Notifications;
using HuflitCampus.Infrastructure.Persistence;
using HuflitCampus.Infrastructure.Persistence.Seed;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddApplication();
builder.Services.AddInfrastructure(builder.Configuration);
builder.Services.AddHuflitCampusAuth();

builder.Services.AddControllers()
    .AddJsonOptions(options =>
    {
        options.JsonSerializerOptions.Converters.Add(new System.Text.Json.Serialization.JsonStringEnumConverter());
    });
builder.Services.AddProblemDetails();
builder.Services.AddHealthChecks()
    .AddDbContextCheck<ApplicationDbContext>();

builder.Services.AddCors(options =>
{
    options.AddPolicy("Frontend", policy =>
    {
        var origins = builder.Configuration.GetSection("Cors:Origins").Get<string[]>()
                      ?? ["http://localhost:5173"];

        policy
            .WithOrigins(origins)
            .AllowAnyHeader()
            .AllowAnyMethod()
            .AllowCredentials();
    });
});

builder.Services.AddEndpointsApiExplorer();
builder.Services.AddHuflitCampusSwagger();

var app = builder.Build();

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();

    // DbSeeder.MigrateAsync + seed demo admin / sample events
    await DbSeeder.SeedAsync(app.Services);
}

app.UseMiddleware<ExceptionHandlingMiddleware>();

app.UseHttpsRedirection();
app.UseCors("Frontend");
app.UseStaticFiles();
app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();
app.MapHub<NotificationHub>("/hubs/notifications");
app.MapHealthChecks("/health");

app.Run();
