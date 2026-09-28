import { CurrencyPipe, DatePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, OnInit, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Book } from '../books/book';
import { BookService } from '../books/book.service';
import { Category } from '../categories/category';
import { CategoryService } from '../categories/category.service';
import { catchError, forkJoin, of } from 'rxjs';

@Component({
  selector: 'app-dashboard',
  imports: [CurrencyPipe, DatePipe, RouterLink],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class Dashboard implements OnInit {
  private readonly bookService = inject(BookService);
  private readonly categoryService = inject(CategoryService);

  protected readonly books = signal<Book[]>([]);
  protected readonly categories = signal<Category[]>([]);
  protected readonly isLoading = signal(true);
  protected readonly loadError = signal<string | null>(null);
  protected readonly recentBooks = computed(() =>
    [...this.books()]
      .sort((firstBook, secondBook) => secondBook.publishedDate.localeCompare(firstBook.publishedDate))
      .slice(0, 5)
  );
  protected readonly categoryBookCounts = computed(() => {
    const booksByCategory = new Map<string, number>();
    for (const book of this.books()) {
      booksByCategory.set(book.categoryName, (booksByCategory.get(book.categoryName) ?? 0) + 1);
    }

    return this.categories().map((category) => ({
      category,
      bookCount: booksByCategory.get(category.name) ?? 0
    }));
  });

  ngOnInit(): void {
    this.loadDashboard();
  }

  private loadDashboard(): void {
    // Combine the real API responses so statistics and lists use the same dashboard snapshot.
    this.isLoading.set(true);
    forkJoin({
      books: this.bookService.getBooks().pipe(catchError(() => of(null))),
      categories: this.categoryService.getCategories().pipe(catchError(() => of(null)))
    }).subscribe({
      next: ({ books, categories }) => {
        if (!books && !categories) {
          this.loadError.set('We could not load books or categories. Please try again.');
          this.isLoading.set(false);
          return;
        }

        if (!books) {
          this.loadError.set('We could not load books. Please try again.');
          this.isLoading.set(false);
          return;
        }

        if (!categories) {
          this.loadError.set('We could not load categories. Please try again.');
          this.isLoading.set(false);
          return;
        }

        this.books.set(books);
        this.categories.set(categories);
        this.isLoading.set(false);
      },
      error: () => {
        this.isLoading.set(false);
        this.loadError.set('We could not load the dashboard data. Please try again.');
      }
    });
  }

  protected retryLoading(): void {
    if (this.isLoading()) {
      return;
    }

    this.loadError.set(null);
    this.loadDashboard();
  }
}