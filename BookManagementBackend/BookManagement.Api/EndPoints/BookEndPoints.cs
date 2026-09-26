using System;
using BookManagement.Api.Data;
using BookManagement.Api.Dtos;
using BookManagement.Api.models;
using Microsoft.EntityFrameworkCore;

namespace BookManagement.Api.EndPoints;

public static class BookEndPoints
{
    const string GetBookById = "GetBookById";
    public static void MapBookEndPoints(this WebApplication app)
    {
        var group = app.MapGroup("/books");

        // GET /books 
        group.MapGet("/", async (BookManagementContext dbContext)
        => await dbContext.Books
                                .Select(book => new BookDto(book.Id, book.Name, book.Category.Name, book.Price, book.PublishedDate))
                                .AsNoTracking()
                                .ToListAsync()
        );


        //GET /books/id
        group.MapGet("/{id}", async (int id, BookManagementContext dbContext) =>
        {
            // Include the related Category, then find the Book by its ID
            var book = await dbContext.Books.Include(book => book.Category).FirstOrDefaultAsync(book => book.Id == id);

            return book is null ? Results.NotFound() : Results.Ok(
             new BookDto(
                book.Id,
                book.Name,
                book.Category.Name,
                book.Price,
                book.PublishedDate
             )
            );

        }


        )
        .WithName(GetBookById); // to store the endpoint into asp without the endPoint url "internal name"


        //POST /books
        group.MapPost("/", async (BookManagementContext dbContext, CreateBookDto newBook) =>
        {
            var existingCategory = await dbContext.Categories.FindAsync(newBook.CategoryId);

            if (existingCategory is null)
            {
                return Results.NotFound();
            }
            Book book = new()
            {
                Name = newBook.Name,
                Price = newBook.Price,
                CategoryId = newBook.CategoryId,
                PublishedDate = newBook.PublishedDate
            };

            dbContext.Books.Add(book);
            await dbContext.SaveChangesAsync();

            BookDto bookDto = new(
                book.Id,
                book.Name,
                existingCategory.Name,
                book.Price,
                book.PublishedDate
            );
            return Results.CreatedAtRoute(GetBookById, new { id = book.Id }, bookDto);
        });



        //PUT /books/id
        group.MapPut("/{id}", async (int id, BookManagementContext dbContext, UpdateBookDto updatedBook) =>
        {
            var existingBook = await dbContext.Books.FindAsync(id);

            if (existingBook is null)
            {
                return Results.NotFound();
            }

            var existingCategory = await dbContext.Categories.FindAsync(updatedBook.CategoryId);

            if (existingCategory is null)
            {
                return Results.NotFound();
            }

            existingBook.Name = updatedBook.Name;
            existingBook.CategoryId = updatedBook.CategoryId;
            existingBook.Price = updatedBook.Price;
            existingBook.PublishedDate = updatedBook.PublishedDate;

            await dbContext.SaveChangesAsync();
            return Results.NoContent();
        });



        //DELETE Book By Id
        group.MapDelete("/{id}", async (int id, BookManagementContext dbContext)=>
        {
            var deleteRowCount = await dbContext.Books
                                                       .Where(book => book.Id == id)
                                                       .ExecuteDeleteAsync();

            if (deleteRowCount == 0)
            {
                return Results.NotFound();
            }

            return Results.NoContent();

        });



    }
}
