using BookManagement.Api.Data;
using BookManagement.Api.EndPoints;


var builder = WebApplication.CreateBuilder(args);

builder.AddBookManagementDb(); // must be above var app = builder.Build();

var app = builder.Build();

app.MigrateDb();

app.MapCategoryEndPoints();
app.MapBookEndPoints();
app.Run();
