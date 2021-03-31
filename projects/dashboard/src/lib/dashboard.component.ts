import { parseLazyRoute } from '@angular/compiler/src/aot/lazy_routes';
import { Component, DoCheck, EventEmitter, Input, IterableDiffers, OnChanges, OnInit, Output } from '@angular/core';
import { DisplayGrid, GridsterConfig, GridsterItem } from 'angular-gridster2';
import { connectableObservableDescriptor } from 'rxjs/internal/observable/ConnectableObservable';
import { DashboardService } from './dashboard.service';

@Component({
  selector: 'lib-dashboard',
  template: `
  <style>
    gridster {
      height: 100%;
      margin: 0;
      padding: 0;
      background-color: rgb(179, 177, 177);
    /* position: inherit !important; */
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

  .row {
    margin-right: 0px !important;
  }

  .loading {
    color: black; 
    position: absolute; 
    left: 50%; 
    top: 50%;
    z-index: 2
  }
  </style>
<div *ngIf="availableDashboards && availableDashboards.length > 0" class="row" style="height: 100%; flex: 1">
  <div class="col-md-12" [ngStyle]="hideHeader ? {'display' : 'none'} : {}">
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
<div *ngIf="activeDashboard" class="row" style="display: flex; height: 100%; flex-direction: column;">
  <div class="col-12" style="height: 100%">
    <div class="gridster-container" [ngStyle]="{'display': panelEditMode ? 'none': 'inherit', 'flex': 1, 'height': '100%'}">
      <gridster [options]="options" style="background: transparent">
        <gridster-item [item]="item" *ngFor="let item of activeDashboard.data; let i= index;" style="background: white; border-radius: 3px;">
          <div [ngStyle]="!item.chartOptions.showHeader ? {'display': 'none'} : {'display': ''}" [ngClass]="dashboardEditMode ? 'drag-handler widget-header widget-move' : 'drag-handler widget-header'">
            <div class="item-buttons widget-header-buttons">
              <div class="float-left header-margin-left"></div>
               <h4 *ngIf="item.name" style="margin-left: 10px;">{{item.name}}</h4>
            </div>
            <div *ngIf="dashboardEditMode" class="pull-right ">
            <!-- <button class="btn btn-link" style="padding: 0px;" (click)="onEditDataBinding(item, i)">
                <span class="fa fa-database"></span>
              </button> -->
              <button class="btn btn-link" style="padding: 0px;" (click)="onEditPanel(item, i)">
                <span class="glyphicon glyphicon-pencil"></span>
              </button>
              <button class="btn btn-link" (click)="removeItem(item)">
                <span class="glyphicon glyphicon-trash"></span>
              </button>
            </div>
           <!-- <div *ngIf="item.chartOptions.showHeader && item.chartOptions.realtime && item.chartOptions.loadStatus !== 'Completed'" class="pull-right">
              <i class="fa fa-spinner fa-spin fa-2x" title="Loading"></i>
            </div> -->
          </div>
          <div *ngIf="item.chartOptions.realtime && item.chartOptions.loadStatus !== 'Completed'" class="pull-right">
            <i class="fa fa-spinner fa-spin fa-4x loading" title="Loading"></i>
          </div>
          <div class="section" [ngStyle]="{'color': 'black', 'height': '100%', 'opacity': item.chartOptions.realtime && item.chartOptions.loadStatus !== 'Completed' ? '0.3' : ''}" [ngSwitch]="item.chartLibrary">
            <lib-dashboard-echarts *ngSwitchCase="'echarts'" [chartConfig]="item.chartOptions.chartConfig"
              [dataset]="item.chartOptions.datasetCopy ? item.chartOptions.datasetCopy : item.chartOptions.dataset"></lib-dashboard-echarts>
            <lib-dashboard-primeng *ngSwitchCase="'primeng'" [chartConfig]="item.chartOptions.chartConfig"
              (onEvent)="processEvent(item, $event)"
              [dataset]="item.chartOptions.datasetCopy ? item.chartOptions.datasetCopy : item.chartOptions.dataset"></lib-dashboard-primeng>
          </div>
        </gridster-item>
      </gridster>
    </div>
    <div *ngIf="panelToBeEdited" class="gridster-container" [ngStyle]="{'display': panelEditMode ? 'inherit': 'none', 'flex': 1, 'height': '100%'}">
      <gridster [options]="resetOptions" style="background: transparent;">
        <gridster-item [item]="panelToBeEdited" style="background: white; border-radius: 3px;">
          <div class="panel panel-default" style="width: 100%;">
            <div matDialogTitle class="panel-heading panel-dark-background">
              <b>{{panelToBeEdited.name}}</b>
            </div>
            <div class="panel-body" style="height: 604px; padding: 0px">
              <div [ngStyle]="{'float': 'left', 'width': '80%', 'height': '100%'}">
                <div [ngStyle]="{'height': '100%'}" [ngSwitch]="panelToBeEdited.chartLibrary">
                  <lib-dashboard-echarts *ngSwitchCase="'echarts'" [chartConfig]="panelToBeEdited.chartOptions.chartConfig" [dataset]="panelToBeEdited.chartOptions.datasetCopy ? panelToBeEdited.chartOptions.datasetCopy : panelToBeEdited.chartOptions.dataset"></lib-dashboard-echarts>
                  <lib-dashboard-primeng *ngSwitchCase="'primeng'" [chartConfig]="panelToBeEdited.chartOptions.chartConfig" [dataset]="panelToBeEdited.chartOptions.datasetCopy ? panelToBeEdited.chartOptions.datasetCopy : panelToBeEdited.chartOptions.dataset"></lib-dashboard-primeng>
                </div>
              </div>
              <div *ngIf="panelToBeEdited.chartOptions.chartConfig" style="float: left; width: 20%; height: 50%; border-left: 5px solid darkgrey;">
              <div class="panel panel-default" style="min-height: 100%; max-height: 100%; overflow: auto">
                  <div class="panel-heading"><label>Chart Configuration</label></div>
                  <div class="panel-body" style="color: black">
                    <p-accordion [multiple]="true">
                      <p-accordionTab header="Legend" [selected]="true">
                        <div *ngIf="panelToBeEdited.chartOptions.chartConfig.legend" class="row">
                          <div class="col-md-12">
                            <div *ngIf="panelToBeEdited.chartOptions.chartConfig.legend.top" class=" row">
                              <div class="col-md-12">
                                <label>Padding top</label>
                                <input class="form-control" type="text" [(ngModel)]="panelToBeEdited.chartOptions.chartConfig.legend.top" (change)="publishChange()">
                              </div>
                            </div>
                            <div *ngIf="panelToBeEdited.chartOptions.chartConfig.legend.left" class=" row">
                              <div class="col-md-12">
                                <label>Position</label>
                                <select class="form-control" [(ngModel)]="panelToBeEdited.chartOptions.chartConfig.legend.left" (change)="publishChange()">
                                  <option [value]="'center'">Center</option>
                                  <option [value]="'left'">Left</option>
                                  <option [value]="'right'">Right</option>
                                </select>
                              </div>
                            </div>
                          </div>
                        </div>
                      </p-accordionTab>
                      <p-accordionTab header="X axis">
                        <div *ngIf="panelToBeEdited.chartOptions.chartConfig.xAxis" class="row">
                          <div class="col-md-12">
                            <label>Type</label>
                            <input class="form-control" [(ngModel)]="panelToBeEdited.chartOptions.chartConfig.xAxis.type">
                          </div>
                        </div>
                      </p-accordionTab>
                      <p-accordionTab header="Y axis">
                        <div *ngIf="panelToBeEdited.chartOptions.chartConfig.yAxis" class="row">
                          <div class="col-md-12">
                            <label>Type</label>
                            <input class="form-control" [(ngModel)]="panelToBeEdited.chartOptions.chartConfig.yAxis.type">
                          </div>
                        </div>
                      </p-accordionTab>
                    </p-accordion>
                  </div>
                </div>
              </div>
              <div style="float: left; width: 20%; height: 50%; border-left: 5px solid darkgrey;">
                <div class="panel panel-default" style="min-height: 100%; max-height: 100%; overflow: auto">
                  <div class="panel-heading"><label>Series Configuration</label></div>
                  <div class="panel-body" style="color: black">
                    <p-accordion [multiple]="true">
                      <ng-container *ngFor="let series of panelToBeEdited.chartOptions.chartConfig.series; index as i">
                        <p-accordionTab header="Series {{i + 1}}" [selected]="i === 0 ? true: false">
                          <div class="row">
                            <div class="col-md-12">
                              <label>Type</label>
                              <select class="form-control" [(ngModel)]="series.type" (change)="publishChange()">
                                <option [value]="'pie'">Pie</option>
                                <option [value]="'gauge'">Gauge</option>
                                <option [value]="'line'">Line</option>
                                <option [value]="'bar'">Bar</option>
                                <option [value]="'heatmap'">Heatmap</option>
                              </select>
                            </div>
                          </div>
                        </p-accordionTab>
                      </ng-container>
                    </p-accordion>
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
export class DashboardComponent implements OnInit, OnChanges, DoCheck {

  @Input()
  dashboards: any[];

  @Input()
  hideHeader: boolean;

  @Input()
  rowHeight: number

  @Output()
  dashboardChange: EventEmitter<any> = new EventEmitter<any> ();

  @Output()
  onEvent: EventEmitter<any> = new EventEmitter<any> ();

  constructor(private dashboardService: DashboardService,
    private iterableDiffers: IterableDiffers) {
  }

  public options: GridsterConfig;
  public resetOptions: GridsterConfig;
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
  differMap: any = {};

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
    this.resetOptions = {
      "gridType":"fixed",
      resizable: {enabled: false},
      draggable: {enabled: false},
      "setGridSize": true,
      "fixedColWidth": this.defaultPanelWidth,
      "fixedRowHeight": this.rowHeight || 170,
    }
    this.options = {
      "gridType":"fixed",
      "scrollToNewItems": true,
      "setGridSize": true,
      "compactType":"none",
      "margin": 5,
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
      "fixedRowHeight": this.rowHeight || 170, //this.defaultPanelHeight,
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
        "dropOverItems":true
      },
      "resizable":{
        "enabled":false
      },
      "swap":true,
      "pushItems":false,
      "disablePushOnDrag":false,
      "disablePushOnResize":false,
      "pushDirections":{
        "north":true,
        "east":true,
        "south":true,
        "west":true
      },
      "pushResizeItems":true,
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

  }

  ngOnChanges() {
    if (!this.dashboards || this.dashboards.length === 0) {
      return;
    }

    this.availableDashboards = this.dashboards;

    this.activeDashboard = this.availableDashboards[0];
    this.activeDashboardName = this.activeDashboard.name;

  }

  ngDoCheck() {
    if (!this.activeDashboard || !this.activeDashboard.data) {
      return;
    }

    this.activeDashboard.data.forEach(panel => {
      if (!this.differMap[panel.panelId]) {
        this.differMap[panel.panelId] = this.iterableDiffers.find([]).create(null);
      }

      if (!panel.chartOptions.chartConfig.seriesMerge) {
        return;
      }
      const start = panel.chartOptions.dataset.source.length - 100 > 0 ? panel.chartOptions.dataset.source.length - 100 : 0
      const end = panel.chartOptions.dataset.source.length;

      let changes = this.differMap[panel.panelId].diff(panel.chartOptions.dataset.source)/*.slice(start, end));*/
      if (changes) {
        this.updatePanel(panel);

      }
    })
  }

  processEvent(item: any, data: any) {
    if (item.chartOptions.chartConfig.onEvent) {
      const variableName = item.chartOptions.chartConfig.onEvent;

      // this.activeDashboard.data.forEach(panel => {
      //   if (panel.chartOptions.subscriptions && panel.chartOptions.subscriptions.includes(variableName)) {
          this.onEvent.emit({data: data, variable: variableName});
      //   }
      // })
    }
  }

  updatePanel(panel: any) {
    let source: any[] = JSON.parse(JSON.stringify(panel.chartOptions.dataset.source));
    let results: any[] = [];

    // Ascending sort on timestamp to reorder late points (if xAxis is a time axis and sort field is mentioned)
    if (panel.chartOptions.chartConfig.xAxis &&
       panel.chartOptions.chartConfig.xAxis.type === 'time' &&
       panel.chartOptions.chartConfig.timeAxisSortField) {
      source = source.sort((a: any, b: any) => {
        if (new Date(a[panel.chartOptions.chartConfig.timeAxisSortField]).getTime() === new Date(b[panel.chartOptions.chartConfig.timeAxisSortField]).getTime()) {
          return 0;
        } else if ( new Date(a[panel.chartOptions.chartConfig.timeAxisSortField]) > new Date(b[panel.chartOptions.chartConfig.timeAxisSortField])) {
          return 1;
        } else {
          return -1;
        }
      })
    }

    // Find duplicates (if uniqueMergeKeys exists)
    if (panel.chartOptions.chartConfig.uniqueMergeKeys &&
      panel.chartOptions.chartConfig.uniqueMergeKeys.length > 0) {
      for (let i = 0; i < source.length; i++) {
        const src = source[i];
        for (let j = i + 1; j < source.length; j++) {
          let uniqueDestStr= '';
          let uniqueSrcStr = '';
          panel.chartOptions.chartConfig.uniqueMergeKeys.forEach(uk => {
            uniqueDestStr += source[j][uk];
            uniqueSrcStr += src[uk];
          })
          if (uniqueDestStr === uniqueSrcStr) { // Duplicate found
            const dest = source[j];
            dest['dirtybit'] = true;
            Object.keys(dest).forEach(key => {
              if (panel.chartOptions.chartConfig.uniqueMergeKeys.includes(key) || key === 'dirtybit') {
                return;
              }
              src[key] = dest[key];
            })
          }
        }
        if (!source[i]["dirtybit"]) {
          results.push(JSON.parse(JSON.stringify(source[i])))
        }
      }
    } else { // Use only last record
      results = [JSON.parse(JSON.stringify(source[source.length - 1]))]
    }


    if (results.length > 0) {
      panel.chartOptions.datasetCopy = {
        dimensions: panel.chartOptions.dataset.dimensions,
        source: []
      }
      results.forEach(result => {
        panel.chartOptions.datasetCopy.source.push(result);
      })
    }
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

  onEditPanel(_panel, _dashboardIndex) {
    this.panelEditMode = true;
    this.panelDataBeforeEdit = _panel;

    this.panelToBeEdited = JSON.parse(JSON.stringify(_panel));
    this.panelToBeEdited.originalIndexInDashboard = _dashboardIndex;
    this.panelToBeEdited.org_cols = this.panelToBeEdited.cols;
    this.panelToBeEdited.org_rows = this.panelToBeEdited.rows;
    this.panelToBeEdited.org_x = this.panelToBeEdited.x;
    this.panelToBeEdited.org_y = this.panelToBeEdited.y;
    this.panelToBeEdited.cols = 14;
    this.panelToBeEdited.rows = 4;
    this.panelToBeEdited.x = 0;
    this.panelToBeEdited.y = 0;
  }

  onSavePanelEdit() {
    this.panelEditMode = false;
    this.panelToBeEdited.cols = this.panelToBeEdited.org_cols;
    this.panelToBeEdited.rows = this.panelToBeEdited.org_rows;
    this.panelToBeEdited.x = this.panelToBeEdited.org_x;
    this.panelToBeEdited.y = this.panelToBeEdited.org_y;
    this.activeDashboard.data[this.panelToBeEdited.originalIndexInDashboard] = this.panelToBeEdited;
  }

  onCancelPanelEdit() {
    this.panelEditMode = false;
    this.panelToBeEdited = undefined;
  }

  onEditDataBinding() {

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
    this.panelToBeEdited = JSON.parse(JSON.stringify(this.panelToBeEdited));
  }

}
