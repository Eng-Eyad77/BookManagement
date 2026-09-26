using System.ComponentModel.DataAnnotations;

namespace BookManagement.Api.Dtos;

public record class CreateBookDto
(
    [Required][StringLength(50)] string Name,
    [Required] int CategoryId,
    [Range(1, 1000)] decimal Price,
    DateOnly PublishedDate
);
