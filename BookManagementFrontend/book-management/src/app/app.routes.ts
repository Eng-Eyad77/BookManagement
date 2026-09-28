import { Routes } from '@angular/router';

export const routes: Routes = [
	{
		path: '',
		pathMatch: 'full',
		redirectTo: 'dashboard'
	},
	{
		path: 'dashboard',
		loadComponent: () => import('./dashboard/dashboard').then((module) => module.Dashboard)
	},
	{
		path: 'books',
		pathMatch: 'full',
		loadComponent: () => import('./books/pages/books/books').then((module) => module.Books),
		title: 'Books'
	},
	{
		path: 'books/new',
		loadComponent: () => import('./books/components/book-form/book-form').then((module) => module.BookForm),
		title: 'Add Book'
	},
	{
		path: 'books/:id/edit',
		loadComponent: () => import('./books/components/book-form/book-form').then((module) => module.BookForm),
		title: 'Edit Book'
	},
	{
		path: 'books/:id',
		loadComponent: () => import('./books/components/book-details/book-details').then((module) => module.BookDetails),
		title: 'Book Details'
	},
	{
		path: 'categories',
		loadComponent: () => import('./categories/categories').then((module) => module.Categories),
		title: 'Categories'
	},
	{
		path: '**',
		redirectTo: 'dashboard'
	}
];
