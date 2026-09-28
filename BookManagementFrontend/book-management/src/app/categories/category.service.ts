import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Category, SaveCategoryRequest } from './category';

@Injectable({ providedIn: 'root' })
export class CategoryService {
  private readonly http = inject(HttpClient);
  private readonly categoriesUrl = 'http://localhost:5101/categories';

  // The service owns HTTP communication; components only coordinate screen state.
  getCategories(): Observable<Category[]> {
    return this.http.get<Category[]>(this.categoriesUrl);
  }

  getCategory(id: number): Observable<Category> {
    return this.http.get<Category>(`${this.categoriesUrl}/${id}`);
  }

  createCategory(request: SaveCategoryRequest): Observable<Category> {
    return this.http.post<Category>(this.categoriesUrl, request);
  }

  updateCategory(id: number, request: SaveCategoryRequest): Observable<void> {
    return this.http.put<void>(`${this.categoriesUrl}/${id}`, request);
  }

  deleteCategory(id: number): Observable<void> {
    return this.http.delete<void>(`${this.categoriesUrl}/${id}`);
  }
}