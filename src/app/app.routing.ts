import { NgModule } from '@angular/core';
import { Routes, RouterModule} from '@angular/router';

import { FlightListComponent} from './flight-list/flight-list.component';

const APP_ROUTING: Routes = [
    {
        path: '',
        component: FlightListComponent
    }
];

@NgModule({
    imports: [
        RouterModule.forRoot(APP_ROUTING),       
    ],
    exports: [
       RouterModule 
    ]
})

export class AppRoutingModule {};