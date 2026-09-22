using System.ComponentModel.DataAnnotations;

namespace BookManagement.Api.Dtos;

public record class CreateCategoryDto
(
    [Required] [StringLength(50)] string Name
    // the shape of the response to the client "201"
);
