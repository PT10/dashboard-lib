import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class DashboardService {

  constructor() { }

  getBlankChart() {
    return {cols: 7, rows: 2, y: 0, x: 0, name: "New Panel", chartOptions: {chartConfig: {}, seriesData:[]}};
  }
}
