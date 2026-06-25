import { Component, ElementRef, ViewChild, AfterViewInit, Injectable, EnvironmentInjector, inject, runInInjectionContext } from '@angular/core';
import { Chart, ChartConfiguration, ChartData, registerables } from 'chart.js';
import { CityWeatherService } from '../../../core/services/city-weather-service';
import { ActivatedRoute, Router } from '@angular/router';
import { MyCity } from '../../../core/services/city-weather-service';
import { ChangeDetectorRef } from '@angular/core';
import { ValidationErrors } from '@angular/forms';
import { AbstractControl, FormControl, FormsModule, ValidatorFn } from '@angular/forms';
import { RegularExpressionLiteral } from '@angular/compiler';
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
  @ViewChild('startDatePicker', { static: false }) startDatePickerValidator!: ElementRef<HTMLInputElement>;
  @ViewChild('endDatePicker', { static: false }) endDatePicker!: ElementRef;
  @ViewChild('endDatePicker', { static: false }) endDatePickerValidator!: ElementRef<HTMLInputElement>;
  @ViewChild('weatherModeSelect', { static: false }) weatherModeSelect!: ElementRef;
  private service = inject(CityWeatherService);
  private activatedRoute = inject(ActivatedRoute);
  private router = inject(Router);
  public cityName: string | null = "";
  public cityObj!: MyCity;

  public defaultDate = (new Date()).toISOString().split('T')[0];
  private weatherMode: string = "temperature_2m";
  //public dateControl = new FormControl('validDates', [this.checkDates()])

  public unit: string = "";
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
    this.getHourlyWeather();
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

  changeWeatherMode(){
    this.weatherMode = this.weatherModeSelect.nativeElement.value;

    this.cdr.detectChanges();
  }

  async getHourlyWeather(){

    console.log("START: ", this.startDatePicker.nativeElement.value)
    var weatherData = this.service.getHourlyWeather(this.cityObj, 
                                                          this.tempUnit.nativeElement.value, 
                                                          this.startDatePicker.nativeElement.value, this.weatherMode);
    
    (await weatherData).subscribe((data: any) => {
    this.unit = data["hourly_units"][this.weatherMode];
    console.log(this.unit)
    var xAxisData = data["hourly"]["time"];
    var xAxisLabel = new Date(xAxisData[1]).toDateString();
    var yAxisLabel = this.tempUnit.nativeElement.value;
    yAxisLabel = yAxisLabel.charAt(0).toUpperCase() + yAxisLabel.slice(1);

    
    this.options.scales.x.title.text = xAxisLabel;
    this.options.scales.y.title.text = `${this.weatherModeSelect.nativeElement.options[this.weatherModeSelect.nativeElement.selectedIndex].text} in ` + yAxisLabel;
    xAxisData = xAxisData.map((time: string) => time.split('T')[1])
    
    this.chartData = {
            labels: xAxisData,
            datasets: [{
                label: `${this.weatherModeSelect.nativeElement.options[this.weatherModeSelect.nativeElement.selectedIndex].text}`,
                data: data["hourly"][this.weatherMode],
                borderWidth: 1
            }]
            }
    
    if(this.chart)
    {
      console.log("X: ", xAxisData);
      console.log("Y: ", data["hourly"][this.weatherMode])
      this.chart.data.labels = xAxisData;
      this.chart.data.datasets[0].label = `${this.weatherModeSelect.nativeElement.options[this.weatherModeSelect.nativeElement.selectedIndex].text}`;

      this.chart.data.datasets[0].data = data["hourly"][this.weatherMode];
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

  async getAverageWeatherPerDay(){
    var start: Date = new Date(this.startDatePicker.nativeElement.value + "T12:00:00");
    var end: Date = new Date(this.endDatePicker.nativeElement.value + "T12:00:00");
    var averages: number[] = [];
    var labels: string[] = [];


    if(this.startDatePicker.nativeElement.value && this.endDatePicker.nativeElement.value)
    {
      if(start.toISOString() <= end.toISOString())
      {
        const date1: Date = start; 
        const date2: Date = end;

        const differenceInMs: number = Math.abs(date2.getTime() - date1.getTime());

        const millisecondsInDay: number = 1000 * 60 * 60 * 24;

        this.differenceInDays = Math.floor(differenceInMs / millisecondsInDay);
        const totalDays = this.differenceInDays;
    
        console.log('Number of days between the two dates:', this.differenceInDays);
        this.resetChartData();
        
        this.options.scales.x.title.text = "Dates";
        this.options.scales.y.title.text = `Average ${this.weatherModeSelect.nativeElement.options[this.weatherModeSelect.nativeElement.selectedIndex].text}`;
        this.isChartLoading = false;
        if (this.chart)
          this.chart.data.datasets[0].label = `${this.weatherModeSelect.nativeElement.options[this.weatherModeSelect.nativeElement.selectedIndex].text}`;
        while(start <= end)
        {
          this.chart?.data.labels?.push(start.toISOString().split('T')[0])
          await new Promise(r => setTimeout(r, 500));   
          var tempData = this.service.getHourlyWeather(this.cityObj, 
                                                            this.tempUnit.nativeElement.value, 
                                                            start.toISOString().split('T')[0], this.weatherMode);
          
          (await tempData).subscribe((temp: any) =>{
            console.log(temp["hourly"][this.weatherMode])

            var avg = temp["hourly"][this.weatherMode].reduce((acc: number, current: number) => acc += current) / 24;
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
        this.checkDates();
      }
    }
    else
    {
      if(!this.startDatePicker.nativeElement.value)
      {
        this.startDatePickerValidator.nativeElement.setCustomValidity("Please pick a start date first");
        this.startDatePickerValidator.nativeElement.reportValidity();
      }

      if(!this.endDatePicker.nativeElement.value)
      {
        this.endDatePickerValidator.nativeElement.setCustomValidity("Please pick an end date first");
        this.endDatePickerValidator.nativeElement.reportValidity();
      }
    }
  }
}