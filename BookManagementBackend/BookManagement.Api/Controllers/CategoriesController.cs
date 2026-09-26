using BookManagement.Api.Data;
using BookManagement.Api.Dtos;
using BookManagement.Api.models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace BookManagement.Api.Controllers;

[ApiController]
[Route("categories")]
public class CategoriesController : ControllerBase
{
    private const string GetCategoryById = "GetCategory";
    private readonly BookManagementContext dbContext;

    // Controllers are created by ASP.NET Core's dependency injection container.
    // The registered EF Core context is supplied to this constructor automatically.
    public CategoriesController(BookManagementContext dbContext)
    {
        this.dbContext = dbContext;
    }

    // [HttpGet] maps this action to GET /categories.
    // The route prefix comes from the controller's [Route] attribute.
    [HttpGet]
    public async Task<ActionResult<IEnumerable<CategoryDto>>> GetAll()
    {
        var categories = await dbContext.Categories
            .Select(category => new CategoryDto(category.Id, category.Name))
            .AsNoTracking()
            .ToListAsync();

        return categories;
    }

    // The Name creates a named route that POST can use with CreatedAtRoute().
    [HttpGet("{id}", Name = GetCategoryById)]
    public async Task<ActionResult<CategoryDto>> GetById(int id)
    {
        var category = await dbContext.Categories.FindAsync(id);

        if (category is null)
        {
            return NotFound();
        }

        return new CategoryDto(category.Id, category.Name);
    }

    // [FromBody] binds the JSON request body to the DTO parameter.
    // [ApiController] also applies DTO data-annotation validation automatically.
    [HttpPost]
    public async Task<ActionResult<CategoryDto>> Create([FromBody] CreateCategoryDto newCategory)
    {
        Category category = new()
        {
            Name = newCategory.Name
        };

        dbContext.Categories.Add(category);
        await dbContext.SaveChangesAsync();

        CategoryDto categoryDto = new(category.Id, category.Name);

        return CreatedAtRoute(
            GetCategoryById,
            new { id = category.Id },
            categoryDto);
    }

    // {id} is bound from the URL route, while the DTO is bound from the body.
    [HttpPut("{id}")]
    public async Task<IActionResult> Update(int id, [FromBody] UpdateCategoryDto updatedCategory)
    {
        var existingCategory = await dbContext.Categories.FindAsync(id);

        if (existingCategory is null)
        {
            return NotFound();
        }

        existingCategory.Name = updatedCategory.Name;
        await dbContext.SaveChangesAsync();

        return NoContent();
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(int id)
    {
        var deleteRowCount = await dbContext.Categories
            .Where(category => category.Id == id)
            .ExecuteDeleteAsync();

        if (deleteRowCount == 0)
        {
            return NotFound();
        }

        return NoContent();
    }
}
