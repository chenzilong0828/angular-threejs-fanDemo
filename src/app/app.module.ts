import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppComponent } from './app.component';
import { WindBurebinComponent } from './wind-burebin/wind-burebin.component';


@NgModule({
  declarations: [
    AppComponent,
    WindBurebinComponent
  ],
  imports: [
    BrowserModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
