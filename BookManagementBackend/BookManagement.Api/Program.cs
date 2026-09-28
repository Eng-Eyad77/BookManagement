using BookManagement.Api.Data;


var builder = WebApplication.CreateBuilder(args);

// Register MVC controller services so ASP.NET Core can discover and create controllers.
builder.Services.AddControllers();

builder.AddBookManagementDb(); // must be above var app = builder.Build();

builder.AddBookManagementCors();

var app = builder.Build();
app.UseCors("_myAllowSpecificOrigins");
app.MigrateDb();

// Map attribute-routed controller actions such as [HttpGet] and [HttpPost].
app.MapControllers();
app.Run();
