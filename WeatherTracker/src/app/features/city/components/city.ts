import { Component, ElementRef, ViewChild, AfterViewInit, Injectable, EnvironmentInjector, inject, runInInjectionContext } from '@angular/core';
import { Chart, ChartData, registerables } from 'chart.js';
import { CityWeatherService } from '../../../core/services/city-weather-service';
import { ActivatedRoute, Router } from '@angular/router';
import { MyCity } from '../../../core/services/city-weather-service';

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
  @ViewChild('tempUnitSelect', { static: false }) tempUnit!: ElementRef;
  @ViewChild('chartTypeSelect', { static: false }) chartType!: ElementRef;
  
  private service = inject(CityWeatherService);
  private activatedRoute = inject(ActivatedRoute);
  private router = inject(Router);
  public cityName: string | null = "";
  public cityObj!: MyCity;
  public temperatureUnit: string = "";
  
  private chart!: Chart; 
  private chartData!: ChartData;
  private options = {
      scales: {
          y: {
            title: {
          display: true,
          align: 'center',
          text: '',
          color: 'black',
          font: {
            family: 'Arial',
            size: 14,
            weight: 'bold',
          },
          padding: {
            top: 10,
            bottom: 5,
            left: 0,
            right: 0,
          },
            }
          },
          x: {
            title: 
            {
              display: true,
              align: 'center',
              text: '',
              color: 'black',
              font: {
                family: 'Arial',
                size: 14,
                weight: 'bold',
              },
              padding: {
                top: 10,
                bottom: 5,
                left: 0,
                right: 0,
              },
            }
          }
      }
    }

  ngOnInit(){
    console.log(this.cityObj)
    this.cityName = this.activatedRoute.snapshot.paramMap.get('name');
    this.activatedRoute.queryParams.subscribe((params) => {
    })
    

    this.cityObj = history.state?.['city'];
      

    console.log("City: ", this.cityObj);

  }

  ngAfterViewInit(){
    this.getTodaysHourlyTemperature();
  }


  changeChartType(){
    this.chart.destroy();       
    
    this.chart = new Chart(this.myChart.nativeElement, {
      type: this.chartType.nativeElement.value,
      data: this.chartData,
      options: this.options
    })
    
  }

  getTodaysHourlyTemperature(){
    if(this.chart)
      this.chart.destroy()
    var tempData = this.service.getTodaysHourlyTemperature(this.cityObj, this.tempUnit.nativeElement.value);
    
    tempData.subscribe((temp: any) => {
    this.temperatureUnit = temp["hourly_units"]["temperature_2m"];
    console.log(this.temperatureUnit)
    var xAxisData = temp["hourly"]["time"];
    var xAxisLabel = new Date(xAxisData[1]).toDateString();
    var yAxisLabel = this.tempUnit.nativeElement.value;
    yAxisLabel = yAxisLabel.charAt(0).toUpperCase() + yAxisLabel.slice(1);


    this.options.scales.x.title.text = xAxisLabel;
    this.options.scales.y.title.text = "Temperature in " + yAxisLabel;
    xAxisData = xAxisData.map((time: string) => time.split('T')[1])
    
    this.chartData = {
            labels: xAxisData,
            datasets: [{
                label: 'Today\'s Temperature',
                data: temp["hourly"]["temperature_2m"],
                borderWidth: 1
            }]
            }
    
            
    this.chart = new Chart(this.myChart.nativeElement, {
        type: this.chartType.nativeElement.value,
        data: this.chartData,
        options: this.options
    })
    }
    )


  }
}