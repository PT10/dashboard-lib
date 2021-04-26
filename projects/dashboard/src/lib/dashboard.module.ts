import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { GridsterModule } from 'angular-gridster2';
import { DashboardComponent } from './dashboard.component';
import { NgxDashboardEchartsModule } from '@bolt-analytics/ngx-dashboard-echarts';
import { LibDashboardPrimengModule } from '@bolt-analytics/ngx-dashboard-primeng';
import {AccordionModule} from 'primeng/accordion';
import {MessagesModule} from 'primeng/messages';
import {MessageModule} from 'primeng/message';

@NgModule({
  declarations: [DashboardComponent],
  imports: [
    CommonModule,
    FormsModule,
    GridsterModule,
    NgxDashboardEchartsModule,
    LibDashboardPrimengModule,
    AccordionModule,
    MessageModule,
    MessagesModule
  ],
  exports: [DashboardComponent]
})
export class DashboardModule { }
