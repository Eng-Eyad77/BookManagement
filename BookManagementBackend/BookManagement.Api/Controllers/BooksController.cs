using BookManagement.Api.Data;
using BookManagement.Api.Dtos;
using BookManagement.Api.models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace BookManagement.Api.Controllers;

[ApiController]
[Route("books")]
public class BooksController : ControllerBase
{
    private const string GetBookById = "GetBookById";
    private readonly BookManagementContext dbContext;

    // ASP.NET Core resolves the EF Core context from dependency injection
    // and passes it to the controller constructor.
    public BooksController(BookManagementContext dbContext)
    {
        this.dbContext = dbContext;
    }

    // [HttpGet] maps this action to GET /books.
    // The projection preserves the API contract: BookDto exposes CategoryName,
    // not the CategoryId used by the create and update request DTOs.
    [HttpGet]
    public async Task<ActionResult<IEnumerable<BookDto>>> GetAll()
    {
        var books = await dbContext.Books
            .Select(book => new BookDto(
                book.Id,
                book.Name,
                book.Category.Name,
                book.Price,
                book.PublishedDate))
            .AsNoTracking()
            .ToListAsync();

        return books;
    }

    // Include loads the related Category before the BookDto is created.
    // The named route is used by POST when it returns CreatedAtRoute().
    [HttpGet("{id}", Name = GetBookById)]
    public async Task<ActionResult<BookDto>> GetById(int id)
    {
        var book = await dbContext.Books
            .Include(book => book.Category)
            .FirstOrDefaultAsync(book => book.Id == id);

        if (book is null)
        {
            return NotFound();
        }

        return new BookDto(
            book.Id,
            book.Name,
            book.Category.Name,
            book.Price,
            book.PublishedDate);
    }

    // [FromBody] binds the incoming JSON object to CreateBookDto.
    // [ApiController] automatically applies the DTO's data-annotation validation.
    [HttpPost]
    public async Task<ActionResult<BookDto>> Create([FromBody] CreateBookDto newBook)
    {
        // Preserve the existing business rule: a book requires an existing category.
        var existingCategory = await dbContext.Categories.FindAsync(newBook.CategoryId);

        if (existingCategory is null)
        {
            return NotFound();
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
            book.PublishedDate);

        return CreatedAtRoute(
            GetBookById,
            new { id = book.Id },
            bookDto);
    }

    // The id parameter is bound from the URL; the DTO is bound from the JSON body.
    [HttpPut("{id}")]
    public async Task<IActionResult> Update(
        int id,
        [FromBody] UpdateBookDto updatedBook)
    {
        var existingBook = await dbContext.Books.FindAsync(id);

        if (existingBook is null)
        {
            return NotFound();
        }

        // Preserve the existing validation for the replacement category.
        var existingCategory = await dbContext.Categories.FindAsync(updatedBook.CategoryId);

        if (existingCategory is null)
        {
            return NotFound();
        }

        existingBook.Name = updatedBook.Name;
        existingBook.CategoryId = updatedBook.CategoryId;
        existingBook.Price = updatedBook.Price;
        existingBook.PublishedDate = updatedBook.PublishedDate;

        await dbContext.SaveChangesAsync();
        return NoContent();
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(int id)
    {
        var deleteRowCount = await dbContext.Books
            .Where(book => book.Id == id)
            .ExecuteDeleteAsync();

        if (deleteRowCount == 0)
        {
            return NotFound();
        }

        return NoContent();
    }
}
