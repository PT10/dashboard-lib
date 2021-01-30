import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { GridsterModule } from 'angular-gridster2';
import { DashboardComponent } from './dashboard.component';
import { EchartsModule } from 'echarts-dashboard';


@NgModule({
  declarations: [DashboardComponent],
  imports: [
    CommonModule,
    FormsModule,
    GridsterModule,
    EchartsModule
  ],
  exports: [DashboardComponent]
})
export class DashboardModule { }
