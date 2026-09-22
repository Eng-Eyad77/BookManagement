using BookManagement.Api.models;
using Microsoft.EntityFrameworkCore;

namespace BookManagement.Api.Data;

public static class DataExtensions
{
    public static void AddBookManagementDb(this WebApplicationBuilder builder)
    {
        var connectionString = builder.Configuration.GetConnectionString("BookManagement");
        builder.Services.AddSqlite<BookManagementContext>(connectionString,
        optionsAction: options =>  options.UseSeeding((context, _)
            => {
            if(!context.Set<Category>().Any())
            {
                context.Set<Category>().AddRange(
                    new Category {Name = "Programming"},
                    new Category {Name = "History"},
                    new Category {Name = "Fantasy"}
                );

                context.SaveChanges();
            }
        }
        )
            );
        
    }

    public static void MigrateDb(this WebApplication app)
    {
        using var scope = app.Services.CreateScope();
        var dbContext = scope.ServiceProvider.GetRequiredService<BookManagementContext>();
        dbContext.Database.Migrate();
    }
}
