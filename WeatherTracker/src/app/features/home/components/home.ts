import { Component, inject, ChangeDetectorRef} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CityWeatherService } from '../../../core/services/city-weather-service';
import { JsonPipe } from '@angular/common';
import { Subject } from 'rxjs';

@Component({
   selector: 'app-home',
   templateUrl: './home.html',
   styleUrl: './home.css',
   standalone: true,
   imports: [FormsModule, JsonPipe]
})


export class Home {
   public cityInput: string = "";

   public cities: MyCity[] = [];
   private service = inject(CityWeatherService);      

   private cdr = inject(ChangeDetectorRef);

   updateSearch(value: string) {
      console.log("value:", value);
      console.log("cityInput:", this.cityInput);

      
      this.cityInput = value;

      
      var data = this.service.getCities(value);
      data.subscribe((resp: any) => {
         var results = resp["results"];
         console.log(results);
         if (results != null)
         {
            this.cities = [];
            results.map((city: any) => {
               var myCity = new MyCity()
               {
                  myCity.cityID = city["id"],
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
               this.cities = this.cities.concat(myCity)
            })
         }
         else
         {
            this.cities = [];
         }

         this.cdr.detectChanges();
         
      })

      
   }
}
class MyCity {
   public cityID: number = -1;
   public cityName: string = "";
   public cityCountry: string = "";
   public cityLatitude: number = -1;
   public cityLongitude: number = -1;
   public cityStr: string = "";
}

