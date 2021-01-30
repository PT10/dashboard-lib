import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { GridsterModule } from 'angular-gridster2';
import { DashboardComponent } from './dashboard.component';
import { NgxDashboardEchartsModule } from '@bolt-analytics/ngx-dashboard-echarts';


@NgModule({
  declarations: [DashboardComponent],
  imports: [
    CommonModule,
    FormsModule,
    GridsterModule,
    NgxDashboardEchartsModule
  ],
  exports: [DashboardComponent]
})
export class DashboardModule { }
