import { Component, ElementRef, ViewChild, AfterViewInit, Injectable, EnvironmentInjector, inject, runInInjectionContext } from '@angular/core';
import { Chart, ChartConfiguration, ChartData, registerables } from 'chart.js';
import { CityWeatherService } from '../../../core/services/city-weather-service';
import { ActivatedRoute, Router } from '@angular/router';
import { MyCity } from '../../../core/services/city-weather-service';
import { ChangeDetectorRef } from '@angular/core';
import { ValidationErrors } from '@angular/forms';
import { AbstractControl, FormControl, FormsModule, ValidatorFn } from '@angular/forms';
Chart.register(...registerables)
@Component({
  selector: 'app-city',
  templateUrl: './city.html',
  styleUrl: './city.css',
  imports: [FormsModule]
})


export class City implements AfterViewInit {
  @ViewChild('myChart', { static: false }) myChart!: ElementRef;
  @ViewChild('tempUnitSelect', { static: false }) tempUnit!: ElementRef;
  @ViewChild('chartTypeSelect', { static: false }) chartType!: ElementRef;
  @ViewChild('startDatePicker', { static: false }) startDatePicker!: ElementRef;
  @ViewChild('endDatePicker', { static: false }) endDatePicker!: ElementRef;
  @ViewChild('endDatePicker', { static: false }) endDatePickerValidator!: ElementRef<HTMLInputElement>;
  private service = inject(CityWeatherService);
  private activatedRoute = inject(ActivatedRoute);
  private router = inject(Router);
  public cityName: string | null = "";
  public cityObj!: MyCity;

  public defaultDate = (new Date()).toISOString().split('T')[0];

  //public dateControl = new FormControl('validDates', [this.checkDates()])

  public temperatureUnit: string = "";
  private cdr = inject(ChangeDetectorRef);
  public differenceInDays: number = 0;
  public chartLoadPercentage: number = 0;
  public isChartLoading = true;
  private chart: Chart | null = null; 
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
            },
            beginAtZero: true
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
      },
      animations: {
      tension: {
        duration: 1000,
        easing: 'linear',
        from: 1,
        to: 0,
        loop: true
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
    console.log("INIT", this.defaultDate)
    this.getTodaysHourlyTemperature();
  }


  changeChartType(){

    if (this.chart)
    {
      var config: any = this.chart.config;
      config.type = this.chartType.nativeElement.value;      
      this.chart.update('active');
    }
  }

  resetChartData()
  {
    if(this.chartData)
    {
      this.chartData.labels = [];
      this.chartData.datasets = [{
                label: '',
                data: [],
                borderWidth: 1
            }]

      this.options.scales.x.title.text = "";
      this.options.scales.y.title.text = "";

      if (this.chart)      
        this.chart.data = this.chartData;
      this.chart?.update('active');
    }
    else{
      console.log("No")
    }
  }

  convertTemperatureUnit(){
    console.log(this.tempUnit.nativeElement.value)
    var arr: any = [];
    if (this.tempUnit.nativeElement.value == "celsius")
    {
      this.chart?.data.datasets.forEach( (dataset) => {
        dataset.data.map((element: any) => {
          arr.push((element - 32) / (9/5));
          console.log(element)
        })

        dataset.data = arr;
      });

      console.log(arr)
    }
    else
    {
      this.chart?.data.datasets.forEach( (dataset) => {
        dataset.data.map((element: any) => {
          arr.push(element * (9/5) + 32);
          console.log(element)
        })

        dataset.data = arr;
      });
    }

    
    console.log(this.chart?.data.datasets[0].data)
    this.chart?.update('active');
  }

  
  checkDates() {
    if(this.endDatePicker.nativeElement.value < this.startDatePicker.nativeElement.value)
    {
      var val = this.endDatePicker.nativeElement.value;

      this.endDatePickerValidator.nativeElement.setCustomValidity('End date should be greater than start date');
      this.endDatePickerValidator.nativeElement.reportValidity();
      console.log(val);
      this.endDatePicker.nativeElement.value = val;
    }
    
  }
  async getTodaysHourlyTemperature(){

    console.log("START: ", this.startDatePicker.nativeElement.value)
    var tempData = this.service.getTodaysHourlyTemperature(this.cityObj, 
                                                          this.tempUnit.nativeElement.value, 
                                                          this.startDatePicker.nativeElement.value);
    
    (await tempData).subscribe((temp: any) => {
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
                label: 'Hours of the Day',
                data: temp["hourly"]["temperature_2m"],
                borderWidth: 1
            }]
            }
    
    if(this.chart)
    {
      console.log("X: ", xAxisData);
      console.log("Y: ", temp["hourly"]["temperature_2m"])
      this.chart.data.labels = xAxisData;
      this.chart.data.datasets[0].data = temp["hourly"]["temperature_2m"];
      this.chart.update('active');
    }
    else{
        this.chart = new Chart(this.myChart.nativeElement, {
        type: this.chartType.nativeElement.value,
        data: this.chartData,
        options: this.options
    })
    }      
    
    }
    )


  }

  async getAverageTemperaturePerDay(){
    var start: Date = new Date(this.startDatePicker.nativeElement.value + "T12:00:00");
    var end: Date = new Date(this.endDatePicker.nativeElement.value + "T12:00:00");
    var averages: number[] = [];
    var labels: string[] = [];

    // Create Date objects representing the two dates
    const date1: Date = start; 
    const date2: Date = end;

    // Calculate the difference in 
    // milliseconds between the two dates
    const differenceInMs: number = 
    Math.abs(date2.getTime() - date1.getTime());

    // Define the number of milliseconds in a day
    const millisecondsInDay: number = 1000 * 60 * 60 * 24;

    // Calculate the difference in days by 
    // dividing the difference in milliseconds by 
    // milliseconds in a day
    this.differenceInDays = 
    Math.floor(differenceInMs / millisecondsInDay);
    const totalDays = this.differenceInDays;
    // Output the result
    console.log(
    'Number of days between the two dates:', this.differenceInDays);
    
    if(start.toISOString() <= end.toISOString())
    {
      this.resetChartData();
      
      this.options.scales.x.title.text = "Dates";
      this.options.scales.y.title.text = "Average Temperature";
      this.isChartLoading = false;
      if (this.chart)
        this.chart.data.datasets[0].label = "Temperature";
      while(start <= end)
      {
        this.chart?.data.labels?.push(start.toISOString().split('T')[0])
        await new Promise(r => setTimeout(r, 500));   
        var tempData = this.service.getTodaysHourlyTemperature(this.cityObj, 
                                                          this.tempUnit.nativeElement.value, 
                                                          start.toISOString().split('T')[0]);
        
        (await tempData).subscribe((temp: any) =>{
          console.log(temp["hourly"]["temperature_2m"])

          var avg = temp["hourly"]["temperature_2m"].reduce((acc: number, current: number) => acc += current) / 24;
          this.chart?.data.datasets[0].data.push(avg);

          this.chart?.update('active');
          this.differenceInDays--;
        })
        start.setDate(start.getDate() + 1);
        this.chartLoadPercentage = Math.round(((totalDays - this.differenceInDays) / totalDays) * 100);
        this.cdr.detectChanges();
      }
      this.differenceInDays = 0;
      this.chartLoadPercentage = 0;
      this.isChartLoading = true;
      this.cdr.detectChanges();
      


    }
    else
    {
      //notify user to fix date format.
    }


  }
}