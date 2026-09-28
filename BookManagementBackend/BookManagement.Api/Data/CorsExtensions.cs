using System;

namespace BookManagement.Api.Data;

public static class CorsExtensions
{
    public static void AddBookManagementCors(this WebApplicationBuilder builder)
    {
        var myAngularApp = "_myAllowSpecificOrigins";

        builder.Services.AddCors(options =>
{
    options.AddPolicy(myAngularApp,
                          policy =>
                          {
                              policy.WithOrigins("http://localhost:4200")
                                                  .AllowAnyHeader()
                                                  .AllowAnyMethod();
                          });
});
    }
}