using Microsoft.EntityFrameworkCore;

namespace BookManagement.Api.Data;

public static class DataExtensions
{
    public static void AddBookManagementDb(this WebApplicationBuilder builder)
    {
        var connectionString = builder.Configuration.GetConnectionString("BookManagement");
        builder.Services.AddSqlite<BookManagementContext>(connectionString);
        
    }

    public static void MigrateDb(this WebApplication app)
    {
        using var scope = app.Services.CreateScope();
        var dbContext = scope.ServiceProvider.GetRequiredService<BookManagementContext>();
        dbContext.Database.Migrate();
    }
}
