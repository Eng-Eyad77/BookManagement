namespace BookManagement.Api.models;

public class Book
{
    public int Id { get; set; }

    public required string Name { get; set; }

    public decimal Price { get; set; }

    public Category? Category { get; set; }
    public DateOnly PublishedDate { get; set; }

    public int CategoryId { get; set; }

}
