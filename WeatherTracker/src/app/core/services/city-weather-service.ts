import {inject, Injectable, input} from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { each } from 'chart.js/helpers';
import { Observable } from 'rxjs';
import { formatDate } from '@angular/common';

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

    public async getTodaysHourlyTemperature(city: MyCity, tempUnit: string, date: string)
    {
        console.log(date)

        var forecastUrl = `https://api.open-meteo.com/v1/forecast?latitude=${city.cityLatitude}&longitude=${city.cityLongitude}&hourly=temperature_2m&timezone=auto&start_date=${date}&end_date=${date}&temperature_unit=${tempUnit}`;

        var archiveUrl = `https://archive-api.open-meteo.com/v1/archive?latitude=${city.cityLatitude}&longitude=${city.cityLongitude}&hourly=temperature_2m&timezone=auto&start_date=${date}&end_date=${date}&temperature_unit=${tempUnit}`;
        var data: Observable<Object>;
        
        const currentDate = new Date().toISOString().split('T')[0]; // "YYYY-MM-DD"
        
          
        
        if (date <= currentDate)
        {
            data = this.http.get(archiveUrl);
        }
        else
        {
            data = this.http.get(forecastUrl);
        }

        return data;
    }

    myFormatDate(date: Date)
    {
        var year = date.getFullYear();
        var day = date.getDate();
        var month = date.getMonth() + 1;
        console.log(day)

        console.log(`${year}-${month >= 10 ? `${month}` : `0${month}` }-${day >= 10 ? `${day}` : `0${day}`}`)
        return `${year}-${month >= 10 ? month : `0${month}` }-${day >= 10 ? day : `0${day}`}`
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