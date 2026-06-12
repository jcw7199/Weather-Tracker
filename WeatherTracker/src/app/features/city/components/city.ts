import { Component, ElementRef, ViewChild, AfterViewInit, Injectable, EnvironmentInjector, inject, runInInjectionContext } from '@angular/core';
import { Chart, registerables } from 'chart.js';
import { CityWeatherService } from '../../../core/services/city-weather-service';

Chart.register(...registerables)
@Component({
   selector: 'app-city',
   templateUrl: './city.html',
   styleUrl: './city.css',
 })
 

@Injectable({
  providedIn: 'root'
})
export class City implements AfterViewInit {
   @ViewChild('myChart', { static: false }) myChart!: ElementRef;
   
   private environmentInjector = inject(EnvironmentInjector);
   public cities: string[] = [""];
   
   public type = 'bar';
   

   private chart!: Chart; 
   private data = {
                labels: ['Red', 'Blue', 'Yellow', 'Green', 'Purple', 'Orange'],
                datasets: [{
                    label: '# of Votes',
                    data: [12, 19, 3, 5, 2, 3],
                    borderWidth: 1
                }]
                }
    private options = {
        scales: {
            y: {
            beginAtZero: true
            }
        }
        }
   changeChartType(){
      console.log(this.type);

      runInInjectionContext(this.environmentInjector, () => {
        var weather = inject(CityWeatherService);      
        //this.cities = weather.getCities("New York");

      })
      this.chart.destroy();       
      if(this.type == 'bar')
      {
        this.chart = new Chart(this.myChart.nativeElement, {
            type: 'line',
            data: this.data,
            options: this.options
        })
        this.type = 'line'
      }
      else
      {
        this.chart = new Chart(this.myChart.nativeElement, {
            type: 'bar',
            data: this.data,
            options: this.options
        })
        this.type = 'bar'
      }
      
   }
   ngAfterViewInit(){
    this.chart = new Chart(this.myChart.nativeElement, {
        type: 'bar',
        data: this.data ,
        options: this.options
    });
   }
 }