import { Routes, RouterLink } from '@angular/router';
import { Home } from './features/home/components/home';
import { City } from './features/city/components/city';


export const routes: Routes = [
    {
        path: '',
        component: Home,
    },
    {
        path: 'city/:name',
        component: City,
    },
];
