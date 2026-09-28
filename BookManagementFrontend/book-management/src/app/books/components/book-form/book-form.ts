import { ChangeDetectionStrategy, Component, DestroyRef, OnInit, inject, signal } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Observable, catchError, forkJoin, of } from 'rxjs';
import { Category } from '../../../categories/category';
import { CategoryService } from '../../../categories/category.service';
import { BookService } from '../../book.service';
import { SaveBookRequest } from '../../book';

@Component({
  selector: 'app-book-form',
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './book-form.html',
  styleUrl: './book-form.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class BookForm implements OnInit {
  private readonly formBuilder = inject(FormBuilder);
  private readonly bookService = inject(BookService);
  private readonly categoryService = inject(CategoryService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);

  protected readonly categories = signal<Category[]>([]);
  protected readonly isEdit = signal(false);
  protected readonly isLoading = signal(true);
  protected readonly isSaving = signal(false);
  protected readonly loadError = signal<string | null>(null);
  protected readonly saveError = signal<string | null>(null);
  protected bookId: number | null = null;

  protected readonly bookForm = this.formBuilder.nonNullable.group({
    name: ['', [Validators.required, Validators.maxLength(50)]],
    categoryId: [0, [Validators.required, Validators.min(1)]],
    price: [0, [Validators.required, Validators.min(1), Validators.max(1000)]],
    publishedDate: ['', Validators.required]
  });

  ngOnInit(): void {
    this.bookForm.valueChanges
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => this.saveError.set(null));

    const id = this.route.snapshot.paramMap.get('id');
    this.bookId = id === null ? null : Number(id);
    this.isEdit.set(this.bookId !== null);

    if (this.bookId === null) {
      this.loadCategories();
      return;
    }

    this.loadEditData(this.bookId);
  }

  protected loadCategories(): void {
    this.isLoading.set(true);
    this.loadError.set(null);
    this.categoryService.getCategories().subscribe({
      next: (categories) => {
        this.categories.set(categories);
        this.isLoading.set(false);
      },
      error: () => {
        this.isLoading.set(false);
        this.loadError.set('We could not load categories. Please try again.');
      }
    });
  }

  private loadEditData(id: number): void {
    this.isLoading.set(true);
    this.loadError.set(null);
    forkJoin({
      book: this.bookService.getBook(id).pipe(catchError(() => of(null))),
      categories: this.categoryService.getCategories().pipe(catchError(() => of(null)))
    }).subscribe({
      next: ({ book, categories }) => {
        if (!book && !categories) {
          this.loadError.set('We could not load the book or categories. Please try again.');
          this.isLoading.set(false);
          return;
        }

        if (!book) {
          this.loadError.set('We could not load the book. Please try again.');
          this.isLoading.set(false);
          return;
        }

        if (!categories) {
          this.loadError.set('We could not load categories. Please try again.');
          this.isLoading.set(false);
          return;
        }

        const selectedCategory = categories.find((category) => category.name === book.categoryName);
        if (!selectedCategory) {
          this.loadError.set('The book category is no longer available.');
          this.isLoading.set(false);
          return;
        }

        this.categories.set(categories);
        this.bookForm.reset({
          name: book.name,
          categoryId: selectedCategory.id,
          price: book.price,
          publishedDate: book.publishedDate
        });
        this.isLoading.set(false);
      },
      error: () => undefined
    });
  }

  protected retryLoading(): void {
    if (this.isLoading()) {
      return;
    }

    if (this.bookId === null) {
      this.loadCategories();
    } else {
      this.loadEditData(this.bookId);
    }
  }

  protected cancel(): void {
    if (!this.isSaving()) {
      this.router.navigate(['/books']);
    }
  }

  protected submitBook(): void {
    if (this.bookForm.invalid || this.isSaving() || this.isLoading()) {
      this.bookForm.markAllAsTouched();
      return;
    }

    this.isSaving.set(true);
    this.saveError.set(null);
    const value = this.bookForm.getRawValue();
    const request: SaveBookRequest = {
      name: value.name.trim(),
      categoryId: value.categoryId,
      price: value.price,
      publishedDate: value.publishedDate
    };
    const request$: Observable<unknown> = this.bookId === null
      ? this.bookService.createBook(request)
      : this.bookService.updateBook(this.bookId, request);

    request$.subscribe({
      next: () => {
        this.isSaving.set(false);
        this.router.navigate(['/books'], { state: { feedback: this.isEdit() ? 'Book updated successfully.' : 'Book created successfully.' } });
      },
      error: (error: HttpErrorResponse) => {
        this.isSaving.set(false);
        this.saveError.set(error.status === 400
          ? 'Please check the book details and try again.'
          : 'We could not save the book. Please try again.');
      }
    });
  }
}