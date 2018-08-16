import { Component, OnInit } from '@angular/core';
import { FlightService } from '../providers/flight.service';
import { FormGroup, FormBuilder, Validators} from '@angular/forms';

@Component({
  selector: 'app-flight-list',
  templateUrl: './flight-list.component.html',
  styleUrls: ['./flight-list.component.scss']
})
export class FlightListComponent implements OnInit{

  private formFlightOption: FormGroup;

  private flights: any;
  private routes: any;
  private originKey: string = "";
  private destinationKey: string = "";
  private numberOfFlights: number = 0;
  private numberFlightFilters: number = 0;
  private optionsStops: number[] = [];
  private optionsCarriers: any[] = [];

  constructor(private flightServ: FlightService,
              private formBuilder: FormBuilder) {}

  ngOnInit() {
  // Se crear el formulario.
    this.initForm();

    // Se obtiene la información de los carriers.
    this.flightServ.getCarriersData();
    // Se obtiene la información de los vuelos, rutas, numero de paradas y aereolineas.
    this.flightServ.getAllFlights().subscribe(
      (data: any) => {
        if(data){
          this.flights = this.flightServ.getAllFlightsInfo();
          this.routes = this.flightServ.getAllRoutesInfo();
          
          this.optionsStops = this.flightServ.getOptionsStops();
          this.optionsCarriers = this.flightServ.getOptionsCarriers();

          this.setOriginAndDestinationRoute();
          this.getNumberOfFlights();
          this.getNumberOfFlightsFilter(this.flights.length);
        }
      }
    );
  }

  // Se muestran las diferentes alternativas de salida por aereolinea.
  showDepartureOptions(flight){
    if(!flight.hasOwnProperty('flagAvailableOption')){
      flight.flagAvailableOption = true;
    }else{
      flight.flagAvailableOption = !flight.flagAvailableOption;
    }
  }
  
  /* Se muestran las opciones de retorno cuando se hace click en una opcion de salida. Ademas esto permite mostrar solo la opción activa de salida y
     ocultar aquellas que no lo estan.*/
  showReturnOptions(event){
    let element = document.getElementById(event.target.id);
    let foc = element.closest('.flight-options-container');

    if(!element.closest('.departure-flights').classList.contains('active-departure-option')){
      element.closest('.departure-flights').classList.add('active-departure-option');
    }else{
      element.closest('.departure-flights').classList.remove('active-departure-option');
    }

    if(foc){
      let departureFlights = foc.getElementsByClassName('departure-flights');

      if(foc.getElementsByClassName('active-departure-option').length > 0){
        for(let i = 0; i < departureFlights.length; i++){
          if(!departureFlights[i].classList.contains('active-departure-option')){
            if(departureFlights[i].classList.contains('hidden-depature-flights')){
               departureFlights[i].classList.remove('hidden-depature-flights');
            }else{
              departureFlights[i].classList.add('hidden-depature-flights');
            }
          }
        }
      }else{
        for(let i = 0; i < departureFlights.length; i++){
            if(departureFlights[i].classList.contains('hidden-depature-flights')){
               departureFlights[i].classList.remove('hidden-depature-flights');
            }
          }
        }     

      let returnFlights = foc.getElementsByClassName('return-flights');
      for(let i = 0; i < returnFlights.length; i++){
        if(returnFlights[i].classList.contains('hidden-all-return-flights')){
           returnFlights[i].classList.remove('hidden-all-return-flights');
        }else{
          returnFlights[i].classList.add('hidden-all-return-flights');
        }
      }
    }
  }

  /* Esto permite mostrar solo la opción activa de retorno ocultar aquellas que no lo estan.*/
  hiddenInactiveReturnOptions(event){
    let element = document.getElementById(event.target.id);
    let foc = element.closest('.flight-options-container');

    if(!element.closest('.return-flights').classList.contains('active-return-option')){
      element.closest('.return-flights').classList.add('active-return-option');
    }else{
      element.closest('.return-flights').classList.remove('active-return-option');
    }

    if(foc){
      let returnFlights = foc.getElementsByClassName('return-flights');

      if(foc.getElementsByClassName('active-return-option').length > 0){
        for(let i = 0; i < returnFlights.length; i++){
          if(!returnFlights[i].classList.contains('active-return-option')){
            if(returnFlights[i].classList.contains('hidden-return-flights')){
               returnFlights[i].classList.remove('hidden-return-flights');
            }else{
              returnFlights[i].classList.add('hidden-return-flights');
            }
          }
        }
      }else{
        for(let i = 0; i < returnFlights.length; i++){
            if(returnFlights[i].classList.contains('hidden-return-flights')){
               returnFlights[i].classList.remove('hidden-return-flights');
            }
          }
        }     
    }
  }

  // Se llama al metodo getFlightByStop para realizar un filtrado por paradas.
  filterByStop(value: number){
    this.flights = this.flightServ.getFlightByStop(value);
    // Llama al metodo que actualiza la cantidad de vuelos mostrados en el sidebar
    this.getNumberOfFlightsFilter(this.flights.length);
  }

  // Se llama al metodo getFlightBySupplier para realizar un filtrado por aereolineas.
  filterBySupplier(value: string){
    this.flights = this.flightServ.getFlightBySupplier(value);
    // Llama al metodo que actualiza la cantidad de vuelos mostrados en el sidebar.
    this.getNumberOfFlightsFilter(this.flights.length);
  }

  // Calcula y almacena el numero total de vuelos. Solo se llama al cargar la app
  private getNumberOfFlights(){
    this.numberOfFlights = this.flights.length;
  }

  // Actualiza la cantidad de vuelos mostrados en el sidebar
  private getNumberOfFlightsFilter(qty: number){
    this.numberFlightFilters = qty;
  }

  // Almacena el orgen y el desino.
  private setOriginAndDestinationRoute(){
      this.originKey = this.routes[0].key;
      this.destinationKey = this.routes[1].key;
  }

  // Se inicializa el formulario
  private initForm(){
    this.formFlightOption = this.formBuilder.group({
      flightOption: ['', Validators.required]
    });
  }
}
