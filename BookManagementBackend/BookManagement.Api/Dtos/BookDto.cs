namespace BookManagement.Api.Dtos;

public record class BookDto
(
  int Id,
  string Name,
  string CategoryName,
  decimal Price,
  DateOnly PublishedDate
);
