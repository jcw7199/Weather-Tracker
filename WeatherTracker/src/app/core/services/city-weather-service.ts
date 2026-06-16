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
    private RESULT_SIZE: number = 100;

    public getCities(city: string): Observable<Object>{
        
        var url = `https://geocoding-api.open-meteo.com/v1/search?name=${city}&count=${this.RESULT_SIZE}&language=en&format=json`;
        var data: Observable<Object>;
    
        data = this.http.get(url)

        return data;

    }

    public getTodaysHourlyTemperature(city: MyCity, tempUnit: string)
    {
        var url = `https://api.open-meteo.com/v1/forecast?latitude=${city.cityLatitude}&longitude=${city.cityLongitude}&hourly=temperature_2m&timezone=auto&forecast_days=1&temperature_unit=${tempUnit}`;
        var data: Observable<Object>;
    
        data = this.http.get(url)

        return data;
    }
}

export class MyCity {
   public cityID: number = -1;
   public cityName: string = "";
   public cityCountry: string = "";
   public cityLatitude: number = -1;
   public cityLongitude: number = -1;
   public cityStr: string = "";
}