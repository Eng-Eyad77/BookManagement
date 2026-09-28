import { ChangeDetectionStrategy, Component, OnInit, inject, signal } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { Book } from '../../book';
import { BookService } from '../../book.service';

@Component({
  selector: 'app-book-details',
  imports: [RouterLink],
  templateUrl: './book-details.html',
  styleUrl: './book-details.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class BookDetails implements OnInit {
  private readonly bookService = inject(BookService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

  protected readonly book = signal<Book | null>(null);
  protected readonly isLoading = signal(true);
  protected readonly loadError = signal<string | null>(null);
  protected readonly deleteError = signal<string | null>(null);
  protected readonly showDeleteDialog = signal(false);
  protected readonly isDeleting = signal(false);

  ngOnInit(): void {
    this.loadBook();
  }

  private loadBook(): void {
    this.isLoading.set(true);
    this.loadError.set(null);
    const id = Number(this.route.snapshot.paramMap.get('id'));
    this.bookService.getBook(id).subscribe({
      next: (book) => { this.book.set(book); this.isLoading.set(false); },
      error: () => { this.isLoading.set(false); this.loadError.set('We could not load the book. Please try again.'); }
    });
  }

  protected retryLoading(): void {
    if (this.isLoading()) {
      return;
    }

    this.loadBook();
  }

  protected formatDate(date: string): string {
    return new Intl.DateTimeFormat('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' }).format(new Date(`${date}T00:00:00`));
  }

  protected formatPrice(price: number): string {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(price);
  }

  protected openDeleteDialog(): void {
    if (!this.isDeleting()) {
      this.deleteError.set(null);
      this.showDeleteDialog.set(true);
    }
  }

  protected closeDeleteDialog(): void {
    if (this.isDeleting()) {
      return;
    }

    this.deleteError.set(null);
    this.showDeleteDialog.set(false);
  }

  protected confirmDelete(): void {
    const book = this.book();
    if (!book || this.isDeleting()) { return; }
    this.deleteError.set(null);
    this.isDeleting.set(true);
    this.bookService.deleteBook(book.id).subscribe({
      next: () => this.router.navigate(['/books'], { state: { feedback: 'Book deleted successfully.' } }),
      error: (error: HttpErrorResponse) => {
        this.isDeleting.set(false);
        this.deleteError.set(error.status === 404 ? 'That book no longer exists.' : 'We could not delete the book. Please try again.');
      }
    });
  }
}