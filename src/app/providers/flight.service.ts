import { Injectable } from '@angular/core';
import { Http, Response } from '@angular/http';

import { map, tap } from 'rxjs/operators';
import 'rxjs';


@Injectable()
export class FlightService {

  // Declaración de  variables
  private airPricePointList: any[];
  private airSegment: any[];
  private fareInfo: any[];
  private airPricePoint: any[];
  private routeList: any[];
  private routes: any[];
  private carriers: any[] = [];
  private optionsStops: number[] = [];
  private copyOptionsStop: any[] = [];
  private optionsCarriers: any[] = [];
  private copyOptionsCarriers: any[] = [];
  private flightsKeys: any[] = [];
  private flights: any[] = [];
  private copyFlights: any[];

  constructor(private http: Http) { }

  // Esta funcion recive la data de la api y luego inicializa algunas variables antes de pasar el resultado al Observer
  getAllFlights(){
    return this.http.get('https://agenciadeviajesmayorista.com/travelport/paso1.php').pipe(
      map(
        (res: Response) => {
          return res.json();
        }
      ),
      tap(
        (data: any) => {
          if(data.hasOwnProperty('AirPricePointList')){
            this.airPricePointList = data.AirPricePointList.AirPricePointList;
            this.airSegment = data.AirSegmentList.AirSegmentList[0].AirSegment;
            this.fareInfo = data.FareInfoList.FareInfoList[0].FareInfo;
            this.routeList = data.RouteList.RouteList[0].Route.Route[0].Leg;
            
            this.getFlightsKeys();
            this.getFlights();
          }
        }
      )
    )
  }

  // Se obtiene la data de las aereolineas (carriers o supplier) y luego se almacena en la variable global carries.
  getCarriersData(){
    this.http.get("/assets/AirSupplier.json").pipe(
      map(
        (res: Response) => {return res.json()}
      )
    ).subscribe(
      (data: any) => {
        this.carriers = data
      }
    )
  }

  // Retorna la información de los vuelos en un nuevo formato.
  getAllFlightsInfo(){
    return this.flights;
  }

  // Retorna la información de las rutas tanto origen como destino.
  getAllRoutesInfo(){
    return this.routes;
  }

  // Retorna las opciones de escalas o paradas disponibles para realizar un posterior filtrado por las mismas.
  getOptionsStops(){
    return this.optionsStops;
  }

  // Retorna las opciones de Aereolineas (Suppliers o Carriers) disponibles para realizar un posterior filtrado por las mismas.
  getOptionsCarriers(){
    return this.optionsCarriers;
  }

  // Retorna los vuelos filtrados por el número de paradas seleccionado
  getFlightByStop(value: number): any[]{
    /* Cuando se hace click en una opción de parada ocurre lo siguiente: Primero se verifica si el array "copyOptionsStop" se encuentra vacio,
       de ser así se almacena el nuvo valor. De lo contrario se verifica si el valor (opción de parada) se encuentra en dicho array y de ser 
       así se obtiene su indice y es eliminado. Ahora si dicho valor no existe dentro del array simplemente es almacenado. De esta forma se 
       guardan las opciones de parada para luego iterar y filtrar los vuelo. NOTA: copyOptionsStop es una variable global*/
    if(this.copyOptionsStop.length === 0){
      this.copyOptionsStop.push(value);
    }else{
      let index = this.copyOptionsStop.indexOf(value);
      if(index > -1){
        this.copyOptionsStop.splice(index, 1);
      }else{
        this.copyOptionsStop.push(value);
      }
    }

    /*Sí todas las opciones de parada han sido desactivadas entonces se retorna un array vacio. De lo contrario se llama al metodo "findFlightsByStops()"
      para realizar el filtrado por paradas y luego almacenar y retornar el resultado*/
    if(this.copyOptionsStop.length === this.optionsStops.length){
      this.copyFlights = [];
    }else{
      this.copyFlights = [];
      this.copyFlights = this.findFlightsByStops();
    }
    return this.copyFlights;
  }

  // Retorna los vuelos filtrados por las aereolineas (Suppliers o Carriers) seleccionada.
  getFlightBySupplier(value: any){
    /* Cuando se hace click en una opción de parada ocurre lo siguiente: Primero se verifica si el array "copyOptionsCarriers" se encuentra vacio,
       de ser así se almacena el nuvo valor. De lo contrario se verifica si el valor (carrier Key) se encuentra en dicho array y de ser 
       así se obtiene su indice y es eliminado. Ahora si dicho valor no existe dentro del array simplemente es almacenado. De esta forma se 
       guardan las opciones de aereolinea para luego iterar y filtrar los vuelo. NOTA: copyOptionsCarriers es una variable global*/
    if(this.copyOptionsCarriers.length === 0){
      this.copyOptionsCarriers.push(value);
    }else{
      let index = this.copyOptionsCarriers.findIndex(carr => carr.key == value.key);
      if(index > -1){
        this.copyOptionsCarriers.splice(index, 1);
      }else{
        this.copyOptionsCarriers.push(value);
      }
    }

    /*Sí todas las opciones de aereolinea han sido desactivadas entonces se retorna un array vacio. De lo contrario se llama al metodo "findFlightsBySuppliers()"
      para realizar el filtrado por aereolineas y luego almacenar y retornar el resultado*/
    if(this.copyOptionsCarriers.length === this.optionsCarriers.length){
      this.copyFlights = [];
    }else{
      this.copyFlights = [];
      this.copyFlights = this.findFlightsBySuppliers()
    }
    return this.copyFlights;
  }

  // Obtiene y almacena la nueva estructura basica del nuevo array de objetos json sobre el cual se trabajara.
  getFlights(){
    let totalPrice: string = "";
    let flightKey: string = "";
    let data: any;
   
      // Se itera sobre el listado de vuelos completo
      for(let i = 0; i < this.flightsKeys.length; i++){
        Object.keys(this.airPricePoint).map((key) => {
          if(key.includes(this.flightsKeys[i].key)){
            flightKey = this.airPricePoint[key][0].atributos.Key;
            // Se obtiene el precio total del vuelo
            totalPrice = this.airPricePoint[key][0].atributos.TotalPrice;

            if(this.airPricePoint[key][0].hasOwnProperty('AirPricingInfo')){
              let airPricingInfo = this.airPricePoint[key][0].AirPricingInfo;

              data = this.getAllSegmentsByFlight(airPricingInfo);
            }        
        }
      }); 
      // Se crea la estructura basica del nuevo array de objetos json sobre el cual se trabajara
      this.flights[i] = {
        key: flightKey,
        totalPrice: totalPrice,
        unitPrice: data[0],
        carrierInfo: data[1],
        flightOption: data[2],
        outboundOptions: data[3] +" options "+ this.routes[0].oriDes +" "+ data[4],
        inboundOptions: data[5],
        numberOfStops: data[6],
        baggageAllowance: data[7]
      }
    }
  }

  // Se obtiene el key o id de cada vuelo y es alamacenado un en array parra luego trabajar en base a este
  private getFlightsKeys(){
    // Se llama a este metodo para obtener las rutas principale de origen y destino
    this.getRoutes();
    
    if(this.airPricePointList[0].hasOwnProperty('AirPricePoint')){  
      this.airPricePoint = this.airPricePointList[0].AirPricePoint;
      
      Object.keys(this.airPricePoint).map((key) => {
        this.flightsKeys.push({key: key});
      })
    }
  }

  // Retorna la información de los segmentos de vuelo 
  private getAllSegmentsByFlight(airPricingInfo){
    let infoOption: any[] = [];
    let infoSegment: any[];
    let unitPrice: string = "";
    let flightOption: any;
    let bookingInfo: any;
    let carrierInfo: any;
    let fareInfo: string = "";
    let outboundOptions: number = 0;
    let inboundOptions: number = 0;
    let numberOfStops: number;
    let departureDate: string = "";

    Object.keys(airPricingInfo).map((key) => {
      if(key.includes('AirPricingInfo')){
        // Se obtiene el precio por unidad
        unitPrice = airPricingInfo[key][0].atributos.TotalPrice;
        
        // Se obtiene la infomación de la aereolinea (Supplier o Carrier) principal
        if(airPricingInfo[key][0].atributos.hasOwnProperty('PlatingCarrier')){
          carrierInfo = this.getCarrierInfo(airPricingInfo[key][0].atributos.PlatingCarrier);      
        }else{         
          carrierInfo = {
            key: "MC",
            carrierName: "Multiples Aereolineas",
          }
        }

        // Se alamacena la infomación de la aereolinea para usar posteriormente en el filtrado de las mismas.
        this.storeOptionSupplier(carrierInfo);

        // Se obtiene el listado de opciones por vuelo
        if(airPricingInfo[key][0].hasOwnProperty('FlightOptionsList')){
          let flightOptionsList = airPricingInfo[key][0].FlightOptionsList;
          
          Object.keys(flightOptionsList).map((key) => {
            
            if(flightOptionsList[key][0].hasOwnProperty('FlightOption')){
              flightOption = flightOptionsList[key][0].FlightOption.FlightOption;
      
              for(let i = 0; i < flightOption.length; i++){
                Object.keys(flightOption[i].Option).map((key) => {
                  let flightOptionKey: string = "";

                  // Se guarda cada key de cada flightOption
                  this.routes.map((key) => {
                    if(flightOption[i].atributos.LegRef == key.key){
                      flightOptionKey = flightOption[i].atributos.LegRef;
                    }
                  })
                  
                  // Se calcula la cantidad de opciones de salida disponibles por cada aereolinea
                  if(flightOption[i].atributos.LegRef == this.routes[0].key){
                     outboundOptions += 1;                   
                  }else{
                    inboundOptions += 1;
                  }

                  // Se accede a las opciones por opcion de de vuelo. (segmentos de vuelo)
                  if(key.includes('Option')){
                    let optionKey = flightOption[i].Option[key][0].atributos.Key;
                    bookingInfo = flightOption[i].Option[key][0].BookingInfo.BookingInfo;

                    // Se calcula la cantidad de paradas por vuelo
                    if(i == 0){
                      numberOfStops = 0;
                      if(bookingInfo.length > 1){
                        numberOfStops = bookingInfo.length - 1;
                      }
                    }
      
                    infoSegment = [];
                    for(let j = 0; j < bookingInfo.length; j++){
                      // Se obtiene la clase del vuelo
                      let bookingCode = bookingInfo[j].atributos.BookingCode;
                      // Se obtiene la cantidad de equipaje permitido por vuelo.
                      fareInfo = this.getAirFareInfo(bookingInfo[j].atributos.FareInfoRef);
                      let segment: any;
                      
                      // Se obtiene la mayor parte de la información pertiene al segmento de vuelo
                      segment =  this.getAirSegmentInfo(bookingInfo[j].atributos.SegmentRef);

                      // Fecha de salida de un vuelo
                      if(i == 0 && j == 0){
                        departureDate = segment.departureDate;
                      }

                      // Se agrega a la variable "segment" el numero de piesas y la clase del vuelo
                      let data =  Object.assign({numberOfPieces: parseInt(fareInfo), BookingCode:bookingCode}, segment);
                      //se almacena data en el array infoSegment
                      infoSegment.push(data);
                    }

                    // Se almacena en el array infoOption data con la siguiente estructura
                    infoOption.push({
                        key: flightOptionKey,
                        option: [{
                          key: optionKey,
                          segment: infoSegment
                        }]                       
                    });
                  }
                });
              }                       
            }
          });           
        }
      }  
    });
    // Se envia el numero de para para ser almacenado.
    this.storeOptionStop(numberOfStops);
    // Se retorna un array con la siguiente información.
    return [unitPrice, carrierInfo, infoOption, outboundOptions, departureDate, inboundOptions, numberOfStops, parseInt(fareInfo)];
  }

  // Retorna la información de un segmento de vuelo en especifico usando como parametro el key de un segmento de vuelo.
  private getAirSegmentInfo(segmentKey){
    let data: any;
    let arrival: any;
    let departure: any;
    let flightTime: string;
    let segment: any;
    let operationCarrier: any;
    let flag: boolean = false;

    Object.keys(this.airSegment).map((key) => {
      // Verificar si el key del segmento existe
      if(key.includes(segmentKey)){
        segment = this.airSegment[key][0];

        // Se obtiene la información correspondiente de un OperatingCarrier de existir dentro del segmento de vuelo.
        Object.keys(segment).map((key) => {
          if(key.includes('CodeshareInfo')){
            if(segment[key].CodeshareInfo[0].hasOwnProperty('atributos')){
              flag = true;
              operationCarrier = this.getCarrierInfo(segment[key].CodeshareInfo[0].atributos.OperatingCarrier);
            }
          }
        });
        
        // Se obtiene la información de la hora de llega de ese segmento de vuelo.
        arrival = this.transformDate(segment.atributos.ArrivalTime);
        // Se obtiene la información de la hora de salida de ese segmento de vuelo.
        departure = this.transformDate(segment.atributos.DepartureTime);
        // Se obtiene la información sobre el tiempo de vuelo, de ese segmento de vuelo.
        flightTime = this.getFlightTime(segment.atributos.FlightTime);
        // Se almacena la información en el objeto data.
        data = {
          flightNumber: segment.atributos.FlightNumber,
          origin: segment.atributos.Origin,
          destination: segment.atributos.Destination,
          flightTime: flightTime,
          distance: segment.atributos.Distance,
          equipment: segment.atributos.Equipment,
          arrivalDate: arrival.fullDate,
          arrivalTime: arrival.fullTime,
          departureDate: departure.fullDate,
          departureTime: departure.fullTime,
          key: segment.atributos.Key
        }
        // flag = true. Quiere decir que si existe un operating carrier en el segmento de vuelo.
        if(flag){
          data.operationCarrierKey = operationCarrier.key;
          data.operationCarrierName = operationCarrier.carrierName;
        }
      }
    });
    // Se retorna lla información del segmento de vuelo.
    return data;
  }

  // Retorna el numnero de equipaje permitido por vuelo
  private getAirFareInfo(fareInfoKey){
    let data: string = "";

    Object.keys(this.fareInfo).map((key) => {
      if(key.includes(fareInfoKey)){
        data = this.fareInfo[key][0].BaggageAllowance.BaggageAllowance[0].NumberOfPieces.NumberOfPieces[0];
      }
    });
    return data;
  }

  /* Retorna la infomación de la aerelonia (Supplier o Carrier) en base a una llave que es pasada como parametro. */
  private getCarrierInfo(carrier){
    let carrierName: string = "";
    let carrierLogo: string = "";
    let carrierInfo: any;

    for(let i = 0; i < this.carriers.length; i++){
      if(this.carriers[i].hasOwnProperty(carrier)){
        carrierName = this.carriers[i][carrier].nombre_corto;
        carrierLogo = this.carriers[i][carrier].logos;

        carrierInfo =  {key: carrier, carrierName: carrierName, carrierLogo: carrierLogo};         
      }else{
        carrierInfo =  {key: carrier, carrierName: "No disponible", carrierLogo: "No disponible"};
      }
    }
    return carrierInfo;
  }

  // Se alamacena en la variable global "routes" las rutas tanto origen como destino con sus respectivos key o id."
  private getRoutes(){
    this.routes = [];
    
    for(let key in this.routeList){
      this.routes.push({
        key: this.routeList[key][0].atributos.Key,
        oriDes: this.routeList[key][0].atributos.Origin+"-"+this.routeList[key][0].atributos.Destination
      });
    }
  }

  /* Se alamacena en la variable global "optionsStops" las opciones de parada que seran luego mostradas en el sidebar
     en la seccion de escalas*/
  private storeOptionStop(option: number){
    if(this.optionsStops == []){
      this.optionsStops.push(option);
    }else{
        if(!this.optionsStops.includes(option)){
          this.optionsStops.push(option);
        }
    }
  }

  /* Se alamacena en la variable global "optionsCarriers" las opciones de aereolineas (Supplier o Carrier) que seran luego mostradas en el sidebar
     en la seccion de aereolineas*/
  private storeOptionSupplier(carrier: any){
    if(this.optionsCarriers == []){
      this.optionsCarriers.push({key: carrier.key, carrierName: carrier.carrierName});
    }else{
      if(!this.optionsCarriers.find(carr => carr.key === carrier.key)){
        this.optionsCarriers.push({key: carrier.key, carrierName: carrier.carrierName});
      }
    }
  }

  // Retorna aquellos vuelos que tienen un numero de parada en especifico.
  private findFlightsByStops(){
    let data: any[] = [];
    let flag: boolean = false;
    let flagStop: boolean;
    let flagSupplier: boolean;

    // Si alguna opción de aereolina ha sido seleccionada flag pasa a true.
    if(this.copyOptionsCarriers.length > 0){
      flag = true;
    }

    /* Si se ha seleccionado una opcion de parada, ocurre lo siguiente: Primero iteramos sobre los vuelos e internamente iteramos sobre las opciones de paradas.
       Si ocurre una coincidencia entre las opciones comparadas en ese instante, flagStop = true. Lo que quiere decir que ese vuelo no sera mostrado*/
    if(this.copyOptionsStop.length > 0){
      for(let i = 0; i < this.flights.length; i++){
        flagStop = false;
        this.copyOptionsStop.map(value => {
          if(this.flights[i].numberOfStops === value){
            flagStop = true;
          }
        });
        // flagStop = false quiere decir que el vuelo paso el filtro de opcion de parada.
        if(!flagStop){
          // flag = true quiere decir que una aereolina ha sido seleccionada
          if(flag){
            flagSupplier = false;
            // Se verifica que el vuelo en el instante [i] sea igual a la aereolinea seleccionada
            this.copyOptionsCarriers.map(value => {
              if(this.flights[i].carrierInfo.key === value.key){
                flagSupplier = true;
              }
            });
            // flagSupplier = false quiere decir que el vuelo paso el filtro de aereolineas. Es almacenado en el array data.
            if(!flagSupplier){
              data.push(this.flights[i]);
            }        
          }else{
            // Se alamacena la información del vuelo en el array data.
            data.push(this.flights[i]);
          }
        }
      }
      /* Si no se ha seleccionado alguna opción de parada, de igual forma se revisa de si hay o no opciones de aereolineas activas. De ser así,
         Iteramos nuevamente sobre los vuelos y ahora internamente sobree las opciones de aereolineas, Si ocurre una coincidencia entre las opciones comparadas en ese instante
         flagSupplier = true, Lo que quiere decir que ese vuelo no sera mostrado*/
    }else{
      // flag = true quiere decir que una aereolina ha sido seleccionada
      if(flag){
        for(let i = 0; i < this.flights.length; i++){
          flagSupplier = false;
          this.copyOptionsCarriers.map(value => {
            if(this.flights[i].carrierInfo.key === value.key){
              flagSupplier = true;
            }
          });
          // flagSupplier = false quiere decir que el vuelo paso el filtro de aereolineas y es almacenado en el array data
          if(!flagSupplier){
            data.push(this.flights[i]);
          }  
        }
      }else{
        // Se alamacena una copia del listado comppleto de vuelos en el array data.
        data = this.flights.slice();
      }
    }
    // Se retorna el listado de vuelos
    return data;
  }

  // Retorna aquellos vuelos que tienen una aereolinea en esppecifico
  private findFlightsBySuppliers(){
    let data: any[] = [];
    let flag: boolean = false;
    let flagStop: boolean;
    let flagSupplier: boolean;

    // Si alguna opción de parada ha sido seleccionada flag pasa a true.
    if(this.copyOptionsStop.length > 0){
      flag = true;
    }

    /* Si se ha seleccionado una opcion de aereolinea, ocurre lo siguiente: Primero iteramos sobre los vuelos e internamente iteramos sobre las opciones de aereolinea.
       Si ocurre una coincidencia entre las opciones comparadas en ese instante, flagSupplier = true. Lo que quiere decir que ese vuelo no sera mostrado*/
    if(this.copyOptionsCarriers.length > 0){
      for(let i = 0; i < this.flights.length; i++){
        flagSupplier = false;
        this.copyOptionsCarriers.map(value => {
          if(this.flights[i].carrierInfo.key === value.key){
            flagSupplier = true;
          }
        });
        // flagSupplier = false quiere decir que el vuelo paso el filtro de opcion de parada.
        if(!flagSupplier){
          if(flag){
            // flag = true quiere decir que una opcion de parada ha sido seleccionada
            flagStop = false;
            // Se verifica que el vuelo en el instante [i] tenga un numero de parada igual al seleccionado. Es almacenado en el array data.
            this.copyOptionsStop.map(value => {
              if(this.flights[i].numberOfStops === value){
                flagStop = true;
              }
            });
            // flagStop = false quiere decir que el vuelo paso el filtro de opciones de paradas
            if(!flagStop){
              data.push(this.flights[i]);
            }
          }else{
            // Se alamacena la información del vuelo en el array data.
            data.push(this.flights[i]);
          }
        }
      }
      /* Si no se ha seleccionado alguna opción de aereolinea, de igual forma se revisa de si hay o no opciones de paradas activas. De ser así,
         Iteramos nuevamente sobre los vuelos y ahora internamente sobree las opciones de parada, Si ocurre una coincidencia entre las opciones comparadas en ese instante
         flagStop = true, Lo que quiere decir que ese vuelo no sera mostrado*/
    }else{
      if(flag){
        // flag = true quiere decir que una opcion de parada ha sido seleccionada
        for(let i = 0; i < this.flights.length; i++){
          flagStop = false;
          this.copyOptionsStop.map(value => {
            if(this.flights[i].numberOfStops === value){
              flagStop = true;
            }
          });
          // flagStop = false quiere decir que el vuelo paso el filtro de paradas y es almacenado en el array data
          if(!flagStop){
            data.push(this.flights[i]);
          }  
        }      
      }else{
        // Se alamacena una copia del listado comppleto de vuelos en el array data.
        data = this.flights.slice();
      }
    }
    // Se retorna el listado de vuelos
    return data;
  }

  // Se cambia el formato de una fecha que es pasada como parametro y se retorna un objeto con dos atributos en formato 0000/00/00 y 00:00
  private transformDate(date: string){
    let d = new Date(date).toISOString();
    let fullDate: string[] = [];
    let fullTime: string[] = [];

    fullDate = d.split('T');
    fullTime = fullDate[1].split('.');
    fullTime = fullTime[0].split(':')

    return {fullDate: fullDate[0], fullTime: fullTime[0]+":"+fullTime[1]};
  }

  // Retorna el tiempo en formato hh:mm usando un valor en minutos que es pasado como paramentro.
  private getFlightTime(time: string){
    let value: number;
    let fullTime: string[] = [];
    let hours: any;
    let minutes: any;
    
    value = parseInt(time);
    fullTime = (value / 60 ).toFixed(2).split('.');
    hours = fullTime[0];

    if(parseInt(fullTime[1]) > 59){
      minutes = ((parseInt(fullTime[1]) / 100) * 60).toFixed();
    }else{
      minutes = fullTime[1];
    }
    return  hours + ":" + minutes;
  }

}