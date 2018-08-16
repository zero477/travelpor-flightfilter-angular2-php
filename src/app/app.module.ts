import { BrowserModule } from '@angular/platform-browser';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpModule } from '@angular/http';
import { NgModule } from '@angular/core';

// App Routing
import { AppRoutingModule } from './app.routing';

// Components
import { AppComponent } from './app.component';
import { FlightListComponent } from './flight-list/flight-list.component';

// Providers
import { FlightService } from './providers/flight.service';


@NgModule({
  declarations: [
    AppComponent,
    FlightListComponent
  ],
  imports: [
    HttpModule,
    FormsModule,
    BrowserModule,
    AppRoutingModule,
    ReactiveFormsModule
  ],
  providers: [FlightService],
  bootstrap: [AppComponent]
})
export class AppModule { }
