import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { DisplayGrid, GridsterConfig, GridsterItem } from 'angular-gridster2';
import { DashboardService } from './dashboard.service';

@Component({
  selector: 'lib-dashboard',
  template: `
  <style>
    gridster {
    height: 80vh;
    margin: 0;
    padding: 0;
    background-color: rgb(179, 177, 177);
  }

  :host {
    width: 100%;
    /* height: 120vh; */
    display: flex;
    flex-direction: column;
  }

  .gridster-container {
    margin-top: 10px;
    margin-left: 10px;
    margin-right: 10px;
  }

  .top-btn-left {
    width: 150px;
    margin: 5px;
  }

  .top-btn-right {
    width: 350px;
    margin: 5px;
  }

  .widget-header {
    background-color: #012e64;
  }

  .widget-move {
    cursor: move;
  }

  .widget-header-btn {
    cursor: default;
  }

  .header-margin-left {
    margin-left: 5px;
  }

  .header-margin-right {
    margin-right: 5px;
  }

  .widget-header-buttons {
    display: inline-block;
  }

  app-nomination-widget {
    height: 100%;
  }

  .section {
    height: 100%;
  }

  .section2 {
    height: 100%;
  }
  </style>
<div *ngIf="availableDashboards && availableDashboards.length > 0" class="row">
  <div class="col-md-12">
    <!-- <span *ngIf="!dashboardEditMode" style="font-size: 24px;" class="pull-left">{{activeDashboard.name}}</span> -->
    <select *ngIf="!dashboardEditMode" [disabled]="panelEditMode" class="form-control input-sm pull-left"  style="font-size: 16px; width: 200px; height: 30px"
      [(ngModel)]="activeDashboardName" (change)="onDashboardChange()">
      <option *ngFor="let dashboard of availableDashboards" [ngValue]="dashboard.name">{{dashboard.name}}</option>
    </select>
    <input *ngIf="dashboardEditMode" [disabled]="panelEditMode" type="text" class="form-control input-sm pull-left"
      style="font-size: 16px; width: 200px; height: 30px" maxlength="20" [(ngModel)]="activeDashboard.name">

    <button *ngIf="!dashboardEditMode" [disabled]="panelEditMode" title="Edit dashboard" class="btn btn-link pull-left" (click)="onEdit()" style="padding-right: 0px">
      <span class="glyphicon glyphicon-pencil highlight-hover"></span>
    </button>
    <button *ngIf="!dashboardEditMode && (activeDashboard.options && !activeDashboard.options['default'])"
      [disabled]="panelEditMode" class="btn btn-link pull-left" title="Delete dashboard" (click)="onDelete()">
      <span class="glyphicon glyphicon-trash highlight-hover"></span>
    </button>
    <button *ngIf="!dashboardEditMode" class="btn btn-link pull-left" [disabled]="panelEditMode" title="Create new dashboard" (click)="onDashboardAdd()">
      <span class="glyphicon glyphicon-th-large highlight-hover"></span>
    </button>
    <button *ngIf="dashboardEditMode" class="btn btn-link pull-left" [disabled]="panelEditMode" title="Save" (click)="onSave()" style="padding-right: 0px">
      <span class="glyphicon glyphicon-floppy-disk highlight-hover"></span>
    </button>
    <button *ngIf="dashboardEditMode" class="btn btn-link pull-left" [disabled]="panelEditMode" title="Cancel" (click)="onCancel()" style="padding-right: 0px">
      <span class="glyphicon glyphicon-remove highlight-hover"></span>
    </button>
    <button *ngIf="dashboardEditMode" class="btn btn-link pull-left" [disabled]="panelEditMode" title="Add chart" (click)="onPanelAdd()">
      <span class="fa fa-bar-chart highlight-hover"></span>
    </button>
  </div>
</div>
<div class="row" style="display: flex; height: 100%; flex-direction: column;">
  <div class="col-12">
    <div class="gridster-container" [ngStyle]="panelEditMode ?  {'display': 'none', 'flex': 1} : {'flex': 1} ">
      <gridster [options]="options" style="background: transparent">
        <gridster-item [item]="item" *ngFor="let item of activeDashboard.data" style="background: white; border-radius: 3px;">
          <div [ngClass]="dashboardEditMode ? 'drag-handler widget-header widget-move' : 'drag-handler widget-header'">
            <div class="item-buttons widget-header-buttons">
              <div class="float-left header-margin-left"></div>
               <h4 *ngIf="item.name" style="margin-left: 5px;">{{item.name}}</h4>
            </div>
            <div *ngIf="dashboardEditMode" class="pull-right ">
              <button class="btn btn-link" style="padding: 0px;" (click)="onEditPanel(item)">
                <span class="glyphicon glyphicon-pencil"></span>
              </button>
              <button class="btn btn-link" (click)="removeItem(item)">
                <span class="glyphicon glyphicon-trash"></span>
              </button>
            </div>
          </div>
          <div class="section" style="color: black">
            <lib-dashboard-echarts [chartConfig]="item.chartOptions.chartConfig" [seriesData]="item.chartOptions.seriesData"></lib-dashboard-echarts>
          </div>
        </gridster-item>
      </gridster>
    </div>
    <div *ngIf="panelToBeEdited" class="gridster-container" [ngStyle]="!panelEditMode ? {'display': 'none', 'flex': 1} : {'flex': 1} ">
      <gridster [options]="{resizable: {enabled: false}, draggable: {enabled: false}}" style="background: transparent">
        <gridster-item [item]="panelToBeEdited" style="background: white; border-radius: 3px;">
          <div class="panel panel-default" style="width: 100%">
            <div matDialogTitle class="panel-heading panel-dark-background">
              <b>{{panelToBeEdited.name}}</b>
            </div>
            <div class="panel-body" style="height: 604px; padding: 0px">
              <div [ngStyle]="{'float': 'left', 'width': '80%', 'height': '100%'}">
                <div [ngStyle]="{'height': '100%'}">
                  <lib-dashboard-echarts [chartConfig]="panelToBeEdited.chartOptions.chartConfig" [seriesData]="panelToBeEdited.chartOptions.seriesData"></lib-dashboard-echarts>
                </div>
              </div>
              <div style="float: left; width: 20%; height: 50%; border-left: 5px solid darkgrey;">
              <div class="panel panel-default" style="min-height: 100%; max-height: 100%; overflow: auto">
                  <div class="panel-heading">Chart Configuration</div>
                  <div class="panel-body">
                    <!-- <ng-container *ngFor="let chart of panelToBeEdited.chartOptions.chartConfig">
                      <label>{{chart.type}}</label>
                    </ng-container> -->
                  </div>
                </div>
              </div>
              <div style="float: left; width: 20%; height: 50%; border-left: 5px solid darkgrey;">
                <div class="panel panel-default" style="min-height: 100%; max-height: 100%; overflow: auto">
                  <div class="panel-heading">Series Configuration</div>
                  <div class="panel-body" style="color: black">
                    <ng-container *ngFor="let series of panelToBeEdited.chartOptions.seriesData; index as i">
                      <label>Series {{i + 1}}</label>
                      <select class="form-control" [(ngModel)]="series.type" (change)="publishChange()">
                        <option [value]="'pie'">Pie</option>
                        <option [value]="'gauge'">Gauge</option>
                        <option [value]="'line'">Line</option>
                      </select>
                    </ng-container>
                  </div>
                </div>
              </div>
            </div>
            <div class="panel-footer panel-dark-background" style="position:relative; overflow:auto;">
              <div class="pull-left" style="margin-left: 10px;">
                <button class="btn btn-primary" (click)="onSavePanelEdit()">Save</button>
              </div>
              <div class="pull-right">
                <button class="btn btn-primary" (click)="onCancelPanelEdit()">Cancel</button>
              </div>
            </div>
          </div>
        </gridster-item>
      </gridster>
    </div>
  </div>
</div>
  `,
  styles: []
})
export class DashboardComponent implements OnInit {

  @Input()
  dashboards: any[];

  @Output()
  dashboardChange: EventEmitter<any> = new EventEmitter<any> ();

  constructor(private dashboardService: DashboardService) {}
  public options: GridsterConfig;
  public activeDashboard: {name: string, data: Array<GridsterItem>, options: {}};
  public activeDashboardName: string;
  private resizeEvent: EventEmitter<any> = new EventEmitter<any>();
  private configureEvent: EventEmitter<boolean> = new EventEmitter<boolean>();
  public showConfig: boolean = false;

  dashboardEditMode = false;
  panelEditMode = false;
  //dashboardName: string = "My Dashboard";

  defaultPanelWidth: number;

  lastSavedDashboard: {name: string, data: any[]};
  lastSavedDashboardName: string;

  panelToBeEdited: any;
  panelDataBeforeEdit: any;

  availableDashboards: any[];

  public inputs = {
    widget: "",
    resizeEvent: this.resizeEvent,
    configureEvent: this.configureEvent
  };
  public outputs = {
    onSomething: (type) => alert(type)
  };

  ngOnInit() {
    this.defaultPanelWidth = (window.document.body.offsetWidth - 190) / 14;
    this.options = {
      "gridType":"fixed",
      "scrollToNewItems": true,
      "setGridSize": true,
      "compactType":"none",
      "margin":10,
      "outerMargin":true,
      "outerMarginTop":null,
      "outerMarginRight":null,
      "outerMarginBottom":null,
      "outerMarginLeft":null,
      "mobileBreakpoint":640,
      "minCols":1,
      "maxCols":100,
      "minRows":1,
      "maxRows":100,
      "maxItemCols":100,
      "minItemCols":1,
      "maxItemRows":100,
      "minItemRows":1,
      "maxItemArea":1000,
      "minItemArea":1,
      "defaultItemCols":1,
      "defaultItemRows":1,
      "fixedColWidth": this.defaultPanelWidth, // 105,
      "fixedRowHeight": 170, //this.defaultPanelHeight,
      "keepFixedHeightInMobile":false,
      "keepFixedWidthInMobile":false,
      "scrollSensitivity":10,
      "scrollSpeed":5,
      "enableEmptyCellClick":false,
      "enableEmptyCellContextMenu":false,
      "enableEmptyCellDrop":false,
      "enableEmptyCellDrag":false,
      "emptyCellDragMaxCols":50,
      "emptyCellDragMaxRows":50,
      "ignoreMarginInRow":false,
      "draggable":{
        "delayStart":0,
        "enabled":false,
        "ignoreContentClass":"gridster-item-content",
        "ignoreContent":true,
        "dragHandleClass":"drag-handler",
        "dropOverItems":false
      },
      "resizable":{
        "enabled":false
      },
      "swap":true,
      "pushItems":true,
      "disablePushOnDrag":false,
      "disablePushOnResize":false,
      "pushDirections":{
        "north":true,
        "east":true,
        "south":true,
        "west":true
      },
      "pushResizeItems":false,
      "disableWindowResize":false,
      "disableWarnings":false
    }
    this.options.displayGrid = DisplayGrid.OnDragAndResize;

    this.options.itemChangeCallback = (item) => {
      this.resizeEvent.emit(item);
    };

    this.options.itemResizeCallback = (item) => {
      this.resizeEvent.emit(item);
    };

    this.availableDashboards = this.dashboards;

    //this.dashboardName = this.availableDashboards[0].name;
    this.activeDashboard = this.availableDashboards[0];
    this.activeDashboardName = this.activeDashboard.name;
  }

  changedOptions() {
     this.options.api.optionsChanged();
  }

  removeItem(item) {
    this.activeDashboard.data.splice(this.activeDashboard.data.indexOf(item), 1);
  }

  addItem() {
    this.activeDashboard.data.push({x: 0, y: 0, rows: 2, cols: 2});
  }

  onEdit() {
    //this.lastSavedDashboardName = this.dashboardName;
    this.lastSavedDashboard = JSON.parse(JSON.stringify(this.activeDashboard));
    this.dashboardEditMode = true;
    this.options.draggable.enabled = true;
    this.options.resizable.enabled = true;
    this.options.displayGrid = 'always';

    this.options = JSON.parse(JSON.stringify(this.options));
  }

  onPanelAdd() {
    this.activeDashboard.data.unshift(this.dashboardService.getBlankChart());
  }

  onEditPanel(_panel) {
    this.panelEditMode = true;
    this.panelDataBeforeEdit = _panel;

    this.panelToBeEdited = JSON.parse(JSON.stringify(_panel));
    this.panelToBeEdited.cols = 14;
    this.panelToBeEdited.rows = 4;
    this.panelToBeEdited.x = 0;
    this.panelToBeEdited.y = 0;
  }

  onSavePanelEdit() {

  }

  onCancelPanelEdit() {
    this.panelEditMode = false;
  }

  onDashboardAdd() {
    this.activeDashboard = {name: "New Dashboard", data: [this.dashboardService.getBlankChart()], options: {}};
    this.activeDashboardName = this.activeDashboard.name;
    //this.service.addDashboard(this.activeDashboard);
    this.dashboards.push(this.activeDashboard);
    this.availableDashboards = this.dashboards;

    this.onEdit();

    this.dashboardChange.emit(this.dashboards);
  }

  onDashboardChange() {
    this.activeDashboard = this.availableDashboards.find(d => d.name === this.activeDashboardName);
  }

  onSave() {
    //this.service.updateDashboard(this.lastSavedDashboard.name , this.activeDashboard);
    const dash = this.dashboards.find(d => d.name === this.lastSavedDashboard.name);
    if (dash) {
      dash.name = this.activeDashboard.name;
      dash.data = this.activeDashboard.data;
      dash.options = this.activeDashboard.options;
    }

    this.availableDashboards = this.dashboards;
    this.activeDashboardName = this.activeDashboard.name;

    this.dashboardEditMode = false;
    this.options.draggable.enabled = false;
    this.options.resizable.enabled = false;
    this.options.displayGrid = 'none';

    this.options = JSON.parse(JSON.stringify(this.options));

    this.dashboardChange.emit(this.dashboards);
  }

  onCancel() {
    this.activeDashboard = JSON.parse(JSON.stringify(this.lastSavedDashboard));
    //this.dashboardName = this.lastSavedDashboardName;
    this.dashboardEditMode = false;
    this.options.draggable.enabled = false;
    this.options.resizable.enabled = false;
    this.options.displayGrid = 'none';

    this.options = JSON.parse(JSON.stringify(this.options));
  }

  onDelete() {
    //this.service.removeDashboard(this.activeDashboard.name);
    const i = this.dashboards.findIndex(ds => ds.name === this.activeDashboard.name);
    if (i  > 0) {
      this.dashboards.splice(i, 1);
    }

    this.availableDashboards = this.dashboards;
    this.activeDashboard = this.availableDashboards.find(ds => ds.options && ds.options.default);
    this.activeDashboardName = this.activeDashboard.name;

    this.dashboardChange.emit(this.dashboards);
  }

  publishChange() {
    this.activeDashboard = JSON.parse(JSON.stringify(this.activeDashboard));
  }

}
