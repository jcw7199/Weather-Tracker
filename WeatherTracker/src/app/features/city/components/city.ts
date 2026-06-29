import { Component, ElementRef, ViewChild, AfterViewInit, Injectable, EnvironmentInjector, inject, runInInjectionContext } from '@angular/core';
import { Chart, ChartConfiguration, ChartData, registerables } from 'chart.js';
import { CityWeatherService } from '../../../core/services/city-weather-service';
import { ActivatedRoute, Router } from '@angular/router';
import { MyCity } from '../../../core/services/city-weather-service';
import { ChangeDetectorRef } from '@angular/core';
import { ValidationErrors } from '@angular/forms';
import { AbstractControl, FormControl, FormsModule, ValidatorFn } from '@angular/forms';
import { RegularExpressionLiteral } from '@angular/compiler';
import { map } from 'rxjs';
Chart.register(...registerables)
@Component({
  selector: 'app-city',
  templateUrl: './city.html',
  styleUrl: './city.css',
  imports: [FormsModule]
})


export class City implements AfterViewInit {
  @ViewChild('myChart', { static: false }) myChart!: ElementRef;
  @ViewChild('unitSelect', { static: false }) unitSelect!: ElementRef;
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
  private currentWeatherMode: string = this.weatherMode;

  public unit: string = "";
  public unitsList: any[] = [];
  public currrentUnit: string = this.unit;
  private currentUnits: any = {
    temperature: "celsius",
    precipitation: "mm",
    windSpeed: "kmh"
  };

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
    this.changeUnits();
  

    console.log("City: ", this.cityObj);
  
  }

  ngAfterViewInit(){
    console.log("After View INIT", this.defaultDate)
    this.getHourlyWeather();
  }


  async changeChartType(){

    if (this.chart)
    {
      var config: any = this.chart.config;
      config.type = this.chartType.nativeElement.value;      
      this.chart.update('active');
    }
  }

  async resetChartData()
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

  async convertUnit(){
    
    switch(this.currentWeatherMode)
    {
      case 'temperature_2m':
        await this.convertTemperatureUnit();
        break;
      case 'rain':
      case 'snowfall':
        await this.convertPrecipitationUnit();
        break;
      case 'wind_speed_10m':
        await this.convertWindSpeedUnit();
        break;
      default:
        break;
    }
    this.currrentUnit = this.unitSelect.nativeElement.value
    this.options.scales.y.title.text = `${this.weatherModeSelect.nativeElement.options[this.weatherModeSelect.nativeElement.selectedIndex].text} in ` + 
                                       `${this.unitSelect.nativeElement.options[this.unitSelect.nativeElement.selectedIndex].text}`;

    this.chart?.update('active');

  }
  
  async convertTemperatureUnit(){
    console.log(this.unitSelect.nativeElement.value)
    var arr: any = [];
    if (this.unitSelect.nativeElement.value == "celsius")
    {
      this.chart?.data.datasets.forEach( (dataset) => {
        dataset.data.map((element: any) => {
          arr.push((element - 32) / (9/5));
          console.log(element)
        })

        dataset.data = arr;
        arr = [];
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
        arr = [];
      });
    }
    
    this.currentUnits.temperature = this.unitSelect.nativeElement.value
    console.log(this.chart?.data.datasets[0].data)
    this.chart?.update('active');
  }

  async convertPrecipitationUnit(){
  
    var arr: any = [];

    if(this.unitSelect.nativeElement.value == 'mm')
    {
      //convert from inches to millimeters
      this.chart?.data.datasets.forEach( (dataset) => {
        dataset.data.map((element: any) => {
          arr.push(element * 25.4);
          console.log(element)
        })

        dataset.data = arr;
        arr = [];
      });
    }
    else
    {
      //convert from millimeters to inches.
      this.chart?.data.datasets.forEach( (dataset) => {
        dataset.data.map((element: any) => {
          arr.push(element * 0.0393700787);
          console.log(element)
        })

        dataset.data = arr;
        arr = [];
      });
    }
    this.currentUnits.precipitation = this.unitSelect.nativeElement.value

    this.chart?.update('active');

  }
  
  async convertWindSpeedUnit(){
    var arr: any = [];
    
    this.chart?.data.datasets.forEach(dataset => {
      dataset.data.forEach((element: any) => {
        console.log("Wind: ", element)
        switch(this.currrentUnit)
        {
          case "kmh":
            switch (this.unitSelect.nativeElement.value)
            {
              //kilometers per hour to miles per hour
              case "mph":
                arr.push(element * 1.609344);
                break;

              //kilometers per hour to meters per second
              case "ms":
                arr.push(element * 3.6);
                break;
              
              //kilometers per hour to knots
              case "kn":
                arr.push(element * 1.852);     
                break;
            }
            break;

          case "mph":
            switch (this.unitSelect.nativeElement.value)
            {
              case "kmh":
                arr.push(element * 0.6213711922); 
                break;

              case "ms":
                arr.push(element * 2.2369362921); 
                break;
              case "kn":
                arr.push(element * 1.150779448); 
                break;
            }
            break;

          case "ms":
            switch (this.unitSelect.nativeElement.value)
            {
              case "mph":
                arr.push(element * 0.44704); 
                break;

              case "kmh":
                arr.push(element * 0.2777777778); 
                break;

              case "kn":
                arr.push(element * 0.51444424416); 
                break;
            }
            break;

          case "kn":
            switch (this.unitSelect.nativeElement.value)
            {
              case "mph":
                arr.push(element * 0.868976); 
                break;

              case "ms":
                arr.push(element * 1.9438444924574); 
                break;

              case "kmh":
                arr.push(element * 0.5399568035); 
                break;
            }
            break;

          default:
            break;
        }
      });

      dataset.data = arr;
      arr = [];
    });
    
    this.currentUnits.windSpeed = this.unitSelect.nativeElement.value

    this.chart?.update('active');
    

  }



  async checkDates() {
    if(this.endDatePicker.nativeElement.value < this.startDatePicker.nativeElement.value)
    {
      var val = this.endDatePicker.nativeElement.value;

      this.endDatePickerValidator.nativeElement.setCustomValidity('End date should be greater than start date');
      this.endDatePickerValidator.nativeElement.reportValidity();
      console.log(val);
      this.endDatePicker.nativeElement.value = val;
    }
    
  }

  async changeWeatherMode(){
    this.weatherMode = this.weatherModeSelect.nativeElement.value;

    this.cdr.detectChanges();
  }

  async changeUnits(){
    switch(this.currentWeatherMode)
    {
      case 'temperature_2m':
        this.unitsList = [{label: "Celsius", value: "celsius"}, {label: "Fahrenheit", value: "fahrenheit"}]
        break;
      case 'rain':
      case 'snowfall':
        this.unitsList = [{label: "Millimeters", value: "mm"}, {label: "Inches", value: "inch"}]
        break;
      case 'wind_speed_10m':
        this.unitsList = [
          {label: "Kilometers Per Hour", value: "kmh"}, {label: "Meters per Second", value: "ms"},
          {label: "Miles per Hour", value: "mph"}, {label: "Knots", value: "kn"}
        ]
        break;
      default:
        this.unitsList = [];
        break;
    }

    if (this.unitsList.length > 0)
    {
      this.currrentUnit = this.unitsList[0].value;

    }
    
    this.cdr.detectChanges();

  }

  async getHourlyWeather(){

    console.log("START: ", this.startDatePicker.nativeElement.value)
    var weatherData = this.service.getHourlyWeather(this.cityObj, 
                                                    this.startDatePicker.nativeElement.value, 
                                                    this.weatherMode, this.currentUnits);
    
    (await weatherData).subscribe((data: any) => {
    this.unit = data["hourly_units"][this.weatherMode];
    console.log(this.unit)
    var xAxisData = data["hourly"]["time"];
    var xAxisLabel = new Date(xAxisData[1]).toDateString();
    var yAxisLabel = `${this.unitSelect.nativeElement.options[this.unitSelect.nativeElement.selectedIndex].text}`;

    
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

    this.currentWeatherMode = this.weatherMode;
    this.changeUnits();
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
        await this.resetChartData();
        
        this.options.scales.x.title.text = "Dates";
        this.options.scales.y.title.text = `Average ${this.weatherModeSelect.nativeElement.options[this.weatherModeSelect.nativeElement.selectedIndex].text}`;
        this.isChartLoading = false;
        if (this.chart)
          this.chart.data.datasets[0].label = `${this.weatherModeSelect.nativeElement.options[this.weatherModeSelect.nativeElement.selectedIndex].text}`;
        while(start <= end)
        {
          this.chart?.data.labels?.push(start.toISOString().split('T')[0])
          await new Promise(r => setTimeout(r, 500));   
          var tempData = this.service.getHourlyWeather(this.cityObj, start.toISOString().split('T')[0], 
                                                       this.weatherMode, this.currentUnits);
          
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

        this.currentWeatherMode = this.weatherMode;

        this.changeUnits();        


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