import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { AppComponent } from './app.component';
import { HomeComponent } from './home/home.component';
import { HeaderComponent } from './header.component';
import { PlantListComponent } from './plant-list/plant-list.component';
import { PlantDetailComponent } from './plant-detail/plant-detail.component';
import { CreatePlantComponent } from './create-plant/create-plant.component';
import { ErrorComponent } from './error/error.component';
 
@NgModule({
  declarations: [
    AppComponent,
    HomeComponent,
    HeaderComponent,
    PlantListComponent,
    PlantDetailComponent,
    CreatePlantComponent,
    ErrorComponent
  ],
  imports: [
    BrowserModule,
    FormsModule,
    ReactiveFormsModule,
    HttpClientModule,
    CommonModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
