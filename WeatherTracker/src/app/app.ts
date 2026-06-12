import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Home} from './features/home/components/home';
import { City } from './features/city/components/city';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, Home, City],
  template: `<app-home> </app-home>`,
  styleUrl: './app.css'
})

export class App {
  protected readonly title = signal('WeatherTracker');
}
