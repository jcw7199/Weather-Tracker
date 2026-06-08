import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Home } from './features/home/components/home';
import { Stock } from './features/stock/components/stock';

@Component({
  selector: 'app-root',
  imports: [Home, Stock, RouterOutlet],
  template: `<app-stock> <app-stock/>`,
  styleUrl: './app.css',
})
export class App {
  protected readonly title = signal('StockMarketWatcher');
}
