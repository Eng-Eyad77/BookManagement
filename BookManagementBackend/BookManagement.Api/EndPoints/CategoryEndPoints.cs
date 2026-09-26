using System;
using System.Runtime.CompilerServices;
using BookManagement.Api.Data;
using BookManagement.Api.Dtos;
using BookManagement.Api.models;
using Microsoft.EntityFrameworkCore;

namespace BookManagement.Api.EndPoints;

public static class CategoryEndPoints
{

    const string GetCategoryById = "GetCategory";
    public static void MapCategoryEndPoints(this WebApplication app)
    {
        var group = app.MapGroup("/categories");


        //GET /categories
        group.MapGet("/", async (BookManagementContext dbContext)
            => await dbContext.Categories
                                        .Select(category => new CategoryDto(category.Id, category.Name))
                                        .AsNoTracking()
                                        .ToListAsync()


         );



        //GET /categories/id
        group.MapGet("/{id}", async (int id, BookManagementContext dbContext) =>
        {
            var category = await dbContext.Categories.FindAsync(id);

            return category is null ? Results.NotFound() : Results.Ok(
               new CategoryDto(
                   category.Id,
                   category.Name
               )
            );
        }

       )
       .WithName(GetCategoryById); // to store the endpoint into asp without the endPoint url "internal name"

        //POST /Categories
        group.MapPost("/", async (CreateCategoryDto newCategory, BookManagementContext dbContext)
            =>
            {
            Category category = new()
            {
                Name = newCategory.Name
            };
            dbContext.Categories.Add(category);
            await dbContext.SaveChangesAsync();



            CategoryDto categoryDto = new(category.Id,category.Name); // category.name is the model
            // new category dto is for sending the response to the client 

            return Results.CreatedAtRoute(GetCategoryById, new {id = category.Id}, categoryDto);
            }
        );

        //PUT /categories/id
        group.MapPut("/{id}", async (int id, UpdateCategoryDto updatedCategory , BookManagementContext dbContext)
        =>
        {
            var existingCategory = await dbContext.Categories.FindAsync(id);

            if(existingCategory is null)
            {
                return Results.NotFound();
            }

            existingCategory.Name = updatedCategory.Name;   

            await dbContext.SaveChangesAsync();

            return Results.NoContent();
        }
         );



         //DELETE categories/id
         group.MapDelete("/{id}", async (int id, BookManagementContext dbContext )
         =>
            {
            int deleteRowCount = await dbContext.Categories
                                        .Where(Category => Category.Id == id)
                                        .ExecuteDeleteAsync();

             if(deleteRowCount == 0)
            {
                    return Results.NotFound();
            }
            return Results.NoContent();
            }
         
         );


    }
}
