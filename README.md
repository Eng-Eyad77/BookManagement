# Book Management System

A full-stack educational application for managing books and categories through an ASP.NET Core Web API and an Angular frontend.

[![ASP.NET Core](https://img.shields.io/badge/ASP.NET%20Core-10.0-512BD4?logo=dotnet&logoColor=white)](https://dotnet.microsoft.com/apps/aspnet)
[![.NET](https://img.shields.io/badge/.NET-10.0-512BD4?logo=dotnet&logoColor=white)](https://dotnet.microsoft.com/)
[![Entity Framework Core](https://img.shields.io/badge/Entity%20Framework%20Core-10.0.12-512BD4?logo=dotnet&logoColor=white)](https://learn.microsoft.com/ef/core/)
[![SQLite](https://img.shields.io/badge/SQLite-003B57?logo=sqlite&logoColor=white)](https://www.sqlite.org/)
[![Angular](https://img.shields.io/badge/Angular-20.0.5-DD0031?logo=angular&logoColor=white)](https://angular.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.8.2-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![SCSS](https://img.shields.io/badge/SCSS-Styles-CC6699?logo=sass&logoColor=white)](https://sass-lang.com/)
[![RxJS](https://img.shields.io/badge/RxJS-7.8-B7178C?logo=reactivex&logoColor=white)](https://rxjs.dev/)

## Project Overview

Book Management System is a full-stack application for maintaining a library catalog. Users can manage books and categories, search and inspect books, view dashboard statistics, and work with real data stored by the ASP.NET Core API.

The project is organized as a separate ASP.NET Core backend and Angular frontend.

## Features

- Book CRUD operations
- Category CRUD operations
- Book search by name or category
- Book details view
- Add and edit book forms
- Category selection using real category data
- Reactive form validation
- Dashboard book and category statistics
- Recently published books sorted by `PublishedDate`
- Frontend-calculated book counts per category
- Loading, error, retry, empty, and operation feedback states
- Delete confirmation dialogs
- Responsive application layout

## Project Structure

```text
BookManagement/
├── BookManagementBackend/
│   ├── BookManagement.slnx
│   └── BookManagement.Api/
├── BookManagementFrontend/
│   └── book-management/
└── README.md
```

- `BookManagementBackend/` contains the ASP.NET Core API, EF Core data access, SQLite configuration, models, DTOs, controllers, and migrations.
- `BookManagementFrontend/` contains the Angular standalone application, feature components, services, forms, routing, and SCSS styles.

## Backend

### Technologies

- ASP.NET Core on .NET 10 (`net10.0`)
- Entity Framework Core `10.0.12`
- SQLite through `Microsoft.EntityFrameworkCore.Sqlite`
- Attribute-routed ASP.NET Core controllers
- C# nullable reference types and implicit usings

### Architecture

The API project is organized into the following areas:

- `Controllers/` contains `BooksController` and `CategoriesController`.
- `Dtos/` contains response and request contracts for books and categories.
- `models/` contains the `Book` and `Category` entities.
- `Data/` contains `BookManagementContext`, database extensions, CORS configuration, and EF Core migrations.
- `Program.cs` registers controllers, the SQLite database, CORS, migrations, and controller routing.

### Database

The application uses SQLite with the connection string:

```text
Data Source=BookManagement.db
```

The database contains two entities:

- `Category`: `Id`, `Name`
- `Book`: `Id`, `Name`, `Price`, `PublishedDate`, and `CategoryId`

Each book belongs to a category through a required foreign-key relationship. The database relationship is configured with cascade delete for books when their category is deleted.

On application startup, the API applies EF Core migrations. If the category table is empty, the configured database seeding creates the initial `Programming`, `History`, and `Fantasy` categories.

### API Endpoints

#### Categories

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/categories` | Returns all categories. |
| `GET` | `/categories/{id}` | Returns one category by ID. |
| `POST` | `/categories` | Creates a category from `Name`. |
| `PUT` | `/categories/{id}` | Updates a category from `Name`. |
| `DELETE` | `/categories/{id}` | Deletes a category by ID. |

Category names are required and limited to 50 characters by the request DTOs.

#### Books

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/books` | Returns all books with category name, price, and published date. |
| `GET` | `/books/{id}` | Returns one book by ID. |
| `POST` | `/books` | Creates a book from name, category ID, price, and published date. |
| `PUT` | `/books/{id}` | Updates a book from name, category ID, price, and published date. |
| `DELETE` | `/books/{id}` | Deletes a book by ID. |

Book names are required and limited to 50 characters. Book prices must be between 1 and 1000. The response contract exposes `CategoryName`; create and update requests use `CategoryId`.

## Frontend

### Technologies

- Angular `20.0.5`
- TypeScript `5.8.2`
- SCSS
- RxJS `7.8`
- Angular standalone components
- Angular Reactive Forms

### Pages and Routes

| Route | Page |
|-------|------|
| `/` | Redirects to the Dashboard. |
| `/dashboard` | Dashboard overview. |
| `/books` | Books list with search and actions. |
| `/books/new` | Add Book form. |
| `/books/:id` | Book Details page. |
| `/books/:id/edit` | Edit Book form. |
| `/categories` | Categories management page. |

### Frontend Architecture

The frontend uses standalone Angular components and lazy-loaded routes. The main application shell provides the sidebar, header, and router outlet.

Feature code is organized under `src/app/`:

- `dashboard/` contains the Dashboard component and its presentation styles.
- `books/` contains book models, `BookService`, the Books page, Book Details, and the shared Add/Edit Book form.
- `categories/` contains category models, `CategoryService`, and the Categories page.
- `app.routes.ts` defines the application routes.
- `app.config.ts` provides the Angular router, `HttpClient`, browser error listeners, and zoneless change detection.

The application uses signals for local component state, Angular control flow such as `@if` and `@for`, Reactive Forms for input validation, and `HttpClient` services for API communication.

### API Integration

`BookService` and `CategoryService` communicate directly with the ASP.NET Core API using real HTTP requests:

```text
http://localhost:5101/books
http://localhost:5101/categories
```

The Dashboard combines real book and category responses. Category book counts are calculated in the frontend by matching each book's `categoryName` with a category's `name`.

## API / Frontend Communication

The configured development URLs are:

```text
Frontend: http://localhost:4200
Backend:  http://localhost:5101
```

The backend configures CORS to allow the Angular development origin `http://localhost:4200`, including the headers and HTTP methods used by the frontend.

The frontend does not use a development proxy; its services call the backend URL directly.

## Getting Started

### Prerequisites

- .NET 10 SDK
- Node.js and npm

### Backend

From the repository root:

```bash
cd BookManagementBackend
dotnet run --project BookManagement.Api/BookManagement.Api.csproj --launch-profile http
```

The HTTP development profile starts the API at `http://localhost:5101`.

### Frontend

From the repository root:

```bash
cd BookManagementFrontend/book-management
npm install
npm start
```

The Angular development server starts at `http://localhost:4200`.

### Build and Tests

```bash
npm run build
npm test -- --watch=false --browsers=ChromeHeadless
```

## Development Notes

- SQLite stores the database in `BookManagement.db`.
- EF Core migrations are applied when the backend starts.
- Initial categories are seeded only when the category table is empty.
- CORS allows the local Angular development origin.
- The frontend calls the backend directly on port `5101`.
- The Angular project uses lazy-loaded standalone components for feature pages.

## Project Status

> Completed — Core book and category management flows are implemented.

## Author

Eyad Makkawi
