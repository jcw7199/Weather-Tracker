import { Component, signal } from '@angular/core';
import { RouterOutlet, RouterLink } from '@angular/router';
import { Home} from './features/home/components/home';
import { City } from './features/city/components/city';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, RouterLink, Home, City],
  template: `<router-outlet />`,
  styleUrl: './app.css'
})

export class App {
  protected readonly title = signal('WeatherTracker');
}
