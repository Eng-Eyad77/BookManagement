import { ChangeDetectionStrategy, Component, OnInit, computed, inject, signal } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { CurrencyPipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { Book } from '../../book';
import { BookService } from '../../book.service';

@Component({
  selector: 'app-books',
  imports: [RouterLink, CurrencyPipe],
  templateUrl: './books.html',
  styleUrl: './books.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class Books implements OnInit {
  private readonly bookService = inject(BookService);

  protected readonly books = signal<Book[]>([]);
  protected readonly searchTerm = signal('');
  protected readonly isLoading = signal(true);
  protected readonly loadError = signal<string | null>(null);
  protected readonly feedback = signal<string | null>(null);
  protected readonly deleteError = signal<string | null>(null);
  protected readonly selectedBook = signal<Book | null>(null);
  protected readonly isDeleting = signal(false);
  protected readonly showDeleteDialog = signal(false);
  protected readonly filteredBooks = computed(() => {
    const search = this.searchTerm().trim().toLowerCase();
    if (!search) {
      return this.books();
    }

    return this.books().filter((book) =>
      book.name.toLowerCase().includes(search) ||
      book.categoryName.toLowerCase().includes(search));
  });

  ngOnInit(): void {
    const navigationState = history.state as { feedback?: string };
    if (navigationState.feedback) {
      this.feedback.set(navigationState.feedback);
      history.replaceState({}, document.title);
    }

    this.loadBooks();
  }

  protected loadBooks(): void {
    this.isLoading.set(true);
    this.loadError.set(null);

    this.bookService.getBooks().subscribe({
      next: (books) => {
        this.books.set(books);
        this.isLoading.set(false);
      },
      error: () => {
        this.isLoading.set(false);
        this.loadError.set('We could not load books. Please try again.');
      }
    });
  }

  protected retryLoading(): void {
    if (this.isLoading()) {
      return;
    }

    this.loadBooks();
  }

  protected updateSearch(event: Event): void {
    this.searchTerm.set((event.target as HTMLInputElement).value);
  }

  protected openDeleteDialog(book: Book): void {
    this.selectedBook.set(book);
    this.deleteError.set(null);
    this.showDeleteDialog.set(true);
  }

  protected closeDeleteDialog(): void {
    if (!this.isDeleting()) {
      this.showDeleteDialog.set(false);
      this.selectedBook.set(null);
      this.deleteError.set(null);
    }
  }

  protected confirmDelete(): void {
    const book = this.selectedBook();
    if (!book || this.isDeleting()) {
      return;
    }

    this.deleteError.set(null);
    this.isDeleting.set(true);
    this.bookService.deleteBook(book.id).subscribe({
      next: () => {
        this.isDeleting.set(false);
        this.closeDeleteDialog();
        this.feedback.set('Book deleted successfully.');
        this.loadBooks();
      },
      error: (error: HttpErrorResponse) => {
        this.isDeleting.set(false);
        this.deleteError.set(error.status === 404
          ? 'That book no longer exists.'
          : 'We could not delete the book. Please try again.');
      }
    });
  }

  protected formatDate(date: string): string {
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    }).format(new Date(`${date}T00:00:00`));
  }
}