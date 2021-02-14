import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppComponent } from './app.component';
import { SpeedometerComponent } from './speedometer/speedometer.component';
import { GaugeComponent } from './gauge/gauge.component';

@NgModule({
  declarations: [
    AppComponent,
    SpeedometerComponent,
    GaugeComponent
  ],
  imports: [
    BrowserModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
