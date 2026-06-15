import { Component, inject, ChangeDetectorRef} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CityWeatherService } from '../../../core/services/city-weather-service';
import { JsonPipe } from '@angular/common';
import { Subject } from 'rxjs';
import { ViewChild, ElementRef } from '@angular/core';
import { RouterModule, RouterLink} from '@angular/router';
@Component({
   selector: 'app-home',
   templateUrl: './home.html',
   styleUrl: './home.css',
   standalone: true,
   imports: [FormsModule, JsonPipe, RouterModule, RouterLink]
})


export class Home {
   public cityInput: string = "";
   @ViewChild('pageSizeSelect', { static: false }) pageSizeSelect!: ElementRef;
   @ViewChild('pageNumberInput', { static: false }) pageNumberInput!: ElementRef;

   private allCities: MyCity[] = [];
   public cities: MyCity[] = [];
   private service = inject(CityWeatherService);      
   private pageSize: number = 10;
   private cdr = inject(ChangeDetectorRef);
   private totalPages: number = 1;


   //grab the first 10 results, max number of results from api is 100.
   public searchResultStartIndex = 0;
   public searchResultEndIndex = this.pageSize;
   public prevButtonDisabled = true;
   public nextButtonDisabled = true;
   public changePageButtonDisabled = true;
   updateSearch(value: string) {
      console.log("searching from: "  + " to " + this.searchResultEndIndex);
      
      
      // reset variables if search term has updated. Then assign new term to variable.
      if (this.cityInput != value)
      {
         this.searchResultStartIndex = 0;
         this.searchResultEndIndex = this.pageSize;
         this.prevButtonDisabled = true;
         this.nextButtonDisabled = true;
         this.cityInput = value;
      }

      // grab list of cities that match the given term using api
      var data = this.service.getCities(value);


      data.subscribe((resp: any) => {
         var results = resp["results"];
         console.log(results);
         if (results != null)
         {
            this.cities = []; //stores the cities seen on the page, for example 10 at a time
            this.allCities = []; // all cities returned from api that will be iterated through
            var resultNum = 1; // The number of the result (1st, 2nd, etc.) 
            results.map((city: any) => {

               //create object for storing cities found.
               var myCity = new MyCity()
               {  
                  myCity.cityID = resultNum,
                  myCity.cityCountry = city["country"],
                  myCity.cityName = city["name"],
                  myCity.cityLatitude = city["latitude"],
                  myCity.cityLongitude = city["longitude"]
                  myCity.cityStr = city["country"] + " - " + city["name"] + ", " + 
                     (city["admin1"] ? city["admin1"] + ", " : "" ) + 
                     (city["admin2"] ? city["admin2"] + ", " : "" ) + 
                     (city["admin3"] ? city["admin3"] + ", " : "" ) + 
                     (city["admin4"] ? city["admin4"] : "" )
               }
               resultNum++;
               myCity.cityStr = myCity.cityStr.trim();

               if (myCity.cityStr[myCity.cityStr.length - 1] == ",")
               {
                  myCity.cityStr = myCity.cityStr.substring(0, myCity.cityStr.length - 1);
               }
               // add city to list all cities.
               this.allCities = this.allCities.concat(myCity)
            })
         }
         else
         {
            //reset if no results returned, usually from empty string. E.g., user clears input completely.
            this.allCities = [];
            this.searchResultStartIndex = 0;
            this.searchResultEndIndex = this.pageSize;
         }
         
         // disable next button if at the end of all cities list.
         if(this.allCities.length > this.searchResultEndIndex)
         {
            this.nextButtonDisabled = false;
         }
         else
         {
            this.nextButtonDisabled = true;
         }

         // disable previous button if at the beginning of all cities list.
         if(this.searchResultStartIndex <= 0)
         {
            this.prevButtonDisabled = true;
         }
         else
         {
            this.prevButtonDisabled = false;
         }

         //disable or enable page button depending on if there are enough
         //cities to page through.
         if (this.allCities.length <= this.pageSize)
         {
            console.log("Disabling page btn");
            this.changePageButtonDisabled = true;
         }
         else  
         {
            console.log("Enabling page btn");

            this.changePageButtonDisabled = false;

         }
         //grab a number of cities, equal to the page size, starting at the beginning of the specified index.
         //an index range in this case represents the beginning and the end of specific pages.
         this.cities = this.allCities.slice(this.searchResultStartIndex, this.searchResultEndIndex);

         //rerender angular to show updated list of cities.
         this.cdr.detectChanges();
      
      })

      
   }

   getPreviousSearchResults(){

      // if the start index minus the page size is greater than zero, go back a page.
      if (this.searchResultStartIndex - this.pageSize >= 0){
         this.searchResultStartIndex -= this.pageSize;
         this.searchResultEndIndex -= this.pageSize;

         // if the start index minus the page size is no longer greater than zero, disable button.
         if (this.searchResultStartIndex <= 0)
         {
            this.prevButtonDisabled = true;
         }
      }
      else
      {
         this.searchResultStartIndex = 0;
         this.searchResultEndIndex = this.pageSize;
      }

      //update search to show next page
      this.updateSearch(this.cityInput);
         
      // renable next button after going back so you can go back forward.
      if (this.nextButtonDisabled == true)
      {
         this.nextButtonDisabled = false;
      }
   }

   getNextSearchResults(){

      // if the start index + the page size is still less than the length of all the cities, go to the next page.
      if (this.searchResultStartIndex + this.pageSize <= this.allCities.length){
         this.searchResultStartIndex += this.pageSize;
         this.searchResultEndIndex += this.pageSize;
         console.log("World: ", this.allCities.length, this.searchResultEndIndex);

         // if the start index + the page size is no longer less than the length of all the cities, disable button.
         if (this.searchResultEndIndex >= this.allCities.length)
         {  
            console.log("Disabling");
            this.nextButtonDisabled = true;
         }
      }
      else // at last page
      {
         if (this.searchResultEndIndex >= this.allCities.length)
         {
            this.searchResultStartIndex += this.pageSize;
            this.searchResultEndIndex = this.allCities.length;
         }
      }
       //update search to show next page

      this.updateSearch(this.cityInput);
      
      // renable previous button so you can go back after moving forward
      if (this.prevButtonDisabled == true){
         this.prevButtonDisabled = false;
      }
   }

   changePageSize(){

      this.pageSize = parseInt(this.pageSizeSelect.nativeElement.value);
      this.searchResultEndIndex  = this.searchResultStartIndex + this.pageSize;
      this.updateSearch(this.cityInput);      
   }

   changePage() {
      var pageNum = this.pageNumberInput.nativeElement.value;
      this.totalPages = Math.ceil(this.allCities.length / this.pageSize)
      
      console.log(this.pageNumberInput.nativeElement.value, " + ", this.totalPages)

      if (this.totalPages > 1)
      {
         if (pageNum <= 1)
         {
            this.searchResultStartIndex = 0;
            this.searchResultEndIndex = this.pageSize;
         }
         else
         {
            if (pageNum > this.totalPages)
            {
               pageNum = this.totalPages;
            }
            this.searchResultEndIndex = this.pageSize * pageNum;
            this.searchResultStartIndex = this.searchResultEndIndex - this.pageSize;
         }

         this.updateSearch(this.cityInput);
      }
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

