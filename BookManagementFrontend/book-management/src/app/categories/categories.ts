import { ChangeDetectionStrategy, Component, OnInit, computed, inject, signal } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Observable, catchError, forkJoin, of } from 'rxjs';
import { CategoryService } from './category.service';
import { Category } from './category';
import { Book } from '../books/book';
import { BookService } from '../books/book.service';

type Modal = 'create' | 'edit' | 'delete' | null;

@Component({
  selector: 'app-categories',
  imports: [ReactiveFormsModule],
  templateUrl: './categories.html',
  styleUrl: './categories.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class Categories implements OnInit {
  private readonly categoryService = inject(CategoryService);
  private readonly bookService = inject(BookService);
  private readonly formBuilder = inject(FormBuilder);

  protected readonly categories = signal<Category[]>([]);
  protected readonly books = signal<Book[]>([]);
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
  protected readonly isLoading = signal(true);
  protected readonly isFormLoading = signal(false);
  protected readonly isSaving = signal(false);
  protected readonly isDeleting = signal(false);
  protected readonly loadError = signal<string | null>(null);
  protected readonly createError = signal<string | null>(null);
  protected readonly updateError = signal<string | null>(null);
  protected readonly deleteError = signal<string | null>(null);
  protected readonly editLoadError = signal<string | null>(null);
  protected readonly feedback = signal<{ type: 'success' | 'error'; message: string } | null>(null);
  protected readonly modal = signal<Modal>(null);
  protected selectedCategory = signal<Category | null>(null);
  protected editingCategoryId: number | null = null;

  protected readonly categoryForm = this.formBuilder.nonNullable.group({
    name: ['', [Validators.required, Validators.maxLength(50)]]
  });

  ngOnInit(): void {
    this.loadCategories();
  }

  protected loadCategories(): void {
    this.isLoading.set(true);
    this.loadError.set(null);

    // Both lists are real API responses; the view derives each count from their category names.
    forkJoin({
      categories: this.categoryService.getCategories().pipe(catchError(() => of(null))),
      books: this.bookService.getBooks().pipe(catchError(() => of(null)))
    }).subscribe({
      next: ({ categories, books }) => {
        if (!categories && !books) {
          this.loadError.set('We could not load categories or books. Please try again.');
          this.isLoading.set(false);
          return;
        }

        if (!categories) {
          this.loadError.set('We could not load categories. Please try again.');
          this.isLoading.set(false);
          return;
        }

        if (!books) {
          this.loadError.set('We could not load books. Please try again.');
          this.isLoading.set(false);
          return;
        }

        this.categories.set(categories);
        this.books.set(books);
        this.isLoading.set(false);
      },
      error: () => {
        this.isLoading.set(false);
        this.loadError.set('We could not load categories. Please try again.');
      }
    });
  }

  protected openCreateModal(): void {
    this.editingCategoryId = null;
    this.categoryForm.reset({ name: '' });
    this.createError.set(null);
    this.feedback.set(null);
    this.modal.set('create');
  }

  protected openEditModal(category: Category): void {
    this.editingCategoryId = category.id;
    this.selectedCategory.set(category);
    this.editLoadError.set(null);
    this.updateError.set(null);
    this.feedback.set(null);
    this.isFormLoading.set(true);
    this.modal.set('edit');

    // Editing loads the record by id so the form is populated from the API response.
    this.loadEditCategory(category.id);
  }

  private loadEditCategory(id: number): void {
    this.isFormLoading.set(true);
    this.editLoadError.set(null);
    this.categoryService.getCategory(id).subscribe({
      next: (loadedCategory) => {
        this.categoryForm.reset({ name: loadedCategory.name });
        this.isFormLoading.set(false);
      },
      error: () => {
        this.isFormLoading.set(false);
        this.editLoadError.set('We could not load that category. Please try again.');
      }
    });
  }

  protected retryEditLoading(): void {
    if (this.isFormLoading() || this.editingCategoryId === null) {
      return;
    }

    this.loadEditCategory(this.editingCategoryId);
  }

  protected openDeleteModal(category: Category): void {
    this.selectedCategory.set(category);
    this.deleteError.set(null);
    this.feedback.set(null);
    this.modal.set('delete');
  }

  protected closeModal(): void {
    if (this.isFormLoading() || this.isSaving() || this.isDeleting()) {
      return;
    }

    this.modal.set(null);
    this.isFormLoading.set(false);
    this.categoryForm.reset({ name: '' });
    this.createError.set(null);
    this.updateError.set(null);
    this.deleteError.set(null);
    this.editLoadError.set(null);
  }

  protected submitCategory(): void {
    if (this.categoryForm.invalid || this.isSaving() || this.isFormLoading()) {
      this.categoryForm.markAllAsTouched();
      return;
    }

    this.isSaving.set(true);
    if (this.editingCategoryId === null) {
      this.createError.set(null);
    } else {
      this.updateError.set(null);
    }
    const request = { name: this.categoryForm.controls.name.value.trim() };
    const request$: Observable<unknown> = this.editingCategoryId === null
      ? this.categoryService.createCategory(request)
      : this.categoryService.updateCategory(this.editingCategoryId, request);

    request$.subscribe({
      next: () => {
        this.isSaving.set(false);
        this.closeModal();
        this.loadCategories();
        this.showSuccess(this.editingCategoryId === null ? 'Category created successfully.' : 'Category updated successfully.');
      },
      error: (error: HttpErrorResponse) => {
        this.isSaving.set(false);
        const message = this.getOperationError(error, 'save');
        if (this.editingCategoryId === null) {
          this.createError.set(message);
        } else {
          this.updateError.set(message);
        }
      }
    });
  }

  protected confirmDelete(): void {
    const category = this.selectedCategory();
    if (!category || this.isDeleting()) {
      return;
    }

    this.deleteError.set(null);
    this.isDeleting.set(true);
    this.categoryService.deleteCategory(category.id).subscribe({
      next: () => {
        this.isDeleting.set(false);
        this.closeModal();
        this.loadCategories();
        this.showSuccess('Category deleted successfully.');
      },
      error: (error: HttpErrorResponse) => {
        this.isDeleting.set(false);
        this.deleteError.set(this.getOperationError(error, 'delete'));
      }
    });
  }

  protected retryLoading(): void {
    if (this.isLoading()) {
      return;
    }

    this.loadCategories();
  }

  protected clearFeedback(): void {
    this.feedback.set(null);
  }

  private showSuccess(message: string): void {
    this.feedback.set({ type: 'success', message });
  }

  private getOperationError(error: HttpErrorResponse, operation: 'save' | 'delete'): string {
    if (error.status === 400) {
      return 'Please check the category name and try again.';
    }

    if (error.status === 404) {
      return operation === 'delete'
        ? 'That category no longer exists.'
        : 'That category could not be found.';
    }

    return operation === 'delete'
      ? 'We could not delete the category. Please try again.'
      : 'We could not save the category. Please try again.';
  }
}