namespace BookManagement.Api.Data;

using BookManagement.Api.models;
using Microsoft.EntityFrameworkCore;

public class BookManagementContext(DbContextOptions<BookManagementContext> options)
: DbContext(options)
{
    public DbSet<Category> Categories => Set<Category>();

    public DbSet<Book> Books => Set<Book>();
}
