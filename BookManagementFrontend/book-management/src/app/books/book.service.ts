import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Book, SaveBookRequest } from './book';

@Injectable({ providedIn: 'root' })
export class BookService {
  private readonly http = inject(HttpClient);
  private readonly booksUrl = 'http://localhost:5101/books';

  // Components manage screen state; this service keeps all Book HTTP requests in one place.
  getBooks(): Observable<Book[]> {
    return this.http.get<Book[]>(this.booksUrl);
  }

  getBook(id: number): Observable<Book> {
    return this.http.get<Book>(`${this.booksUrl}/${id}`);
  }

  createBook(request: SaveBookRequest): Observable<Book> {
    return this.http.post<Book>(this.booksUrl, request);
  }

  updateBook(id: number, request: SaveBookRequest): Observable<void> {
    return this.http.put<void>(`${this.booksUrl}/${id}`, request);
  }

  deleteBook(id: number): Observable<void> {
    return this.http.delete<void>(`${this.booksUrl}/${id}`);
  }
}