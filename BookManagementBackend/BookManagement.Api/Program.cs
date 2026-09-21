using BookManagement.Api.Data;


var builder = WebApplication.CreateBuilder(args);

builder.AddBookManagementDb(); // must be above var app = builder.Build();

var app = builder.Build();

app.MigrateDb();


app.Run();
