import { Component, inject, signal } from '@angular/core';
import { NavigationEnd, Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { filter } from 'rxjs';

@Component({
  selector: 'app-root',
  imports: [RouterLink, RouterLinkActive, RouterOutlet],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App {
  private readonly router = inject(Router);
  protected readonly pageTitle = signal('Dashboard');

  constructor() {
    this.router.events
      .pipe(filter((event): event is NavigationEnd => event instanceof NavigationEnd))
      .subscribe((event) => this.pageTitle.set(this.getPageTitle(event.urlAfterRedirects)));
  }

  private getPageTitle(url: string): string {
    if (url.startsWith('/categories')) {
      return 'Categories';
    }

    if (url.startsWith('/books')) {
      return 'Books';
    }

    return 'Dashboard';
  }
}
