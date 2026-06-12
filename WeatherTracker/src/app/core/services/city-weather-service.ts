import {inject, Injectable, input} from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { each } from 'chart.js/helpers';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class CityWeatherService{
    
    private http = inject(HttpClient);
    public getWeather(){

        // replace the "demo" apikey below with your own key from https://www.alphavantage.co/support/#api-key
        
                
    }   


    public getCities(city: string): Observable<Object>{
        
        var url = `https://geocoding-api.open-meteo.com/v1/search?name=${city}&count=10&language=en&format=json`;
        var data: Observable<Object>;
    
        data = this.http.get(url)

        return data;

    }
}