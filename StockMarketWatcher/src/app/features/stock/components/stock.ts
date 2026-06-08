import { Component, ElementRef, ViewChild, AfterViewInit } from '@angular/core';
import { Chart, registerables } from 'chart.js';

Chart.register(...registerables)
@Component({
   selector: 'app-stock',
   templateUrl: './stock.html',
   styleUrl: './stock.css',
 })


export class Stock implements AfterViewInit {
   @ViewChild('myChart', { static: false }) myChart!: ElementRef;
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