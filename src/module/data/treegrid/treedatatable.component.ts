/*
 * Copyright 2016-2017 the original author or authors.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Author - Ketan Gote, Pratik Kelwalkar, Dattaram Gawas
 *
 */
/*
Component Name : Amexio tree data table
Component Selector : <amexio-tree-data-table>
Component Description :  A Simple Expandable Tree component which create Tree View based on standard datasource attached.
*/
import {
  AfterContentInit, AfterViewInit, Component, ContentChildren, ElementRef, EventEmitter, Input, OnInit, Output, QueryList,
  ViewChild,
} from '@angular/core';

import { AmexioGridColumnComponent } from '../datagrid/data.grid.column';

import { CommonDataService } from '../../services/data/common.data.service';
@Component({
  selector: 'amexio-tree-data-table',
  templateUrl: './treedatatable.component.html',

})

export class TreeDataTableComponent implements OnInit, AfterContentInit, AfterViewInit {

  private componentLoaded: boolean;
  /*
   Properties
   name : data
   datatype : any
   version : 4.0 onwards
   default : none
   description : Local Data binding.
   */
  _data: any;
  @Input('data')
  set data(value: any[]) {
    this._data = value;
    if (this.componentLoaded) {
      this.updateComponent();
    }
  }
  get data(): any[] {
    return this._data;
  }

  /*
   Properties
   name : data-reader
   datatype : string
   version : 4.0 onwards
   default : none
   description : Key in JSON Datasource for records.
   */
  @Input('data-reader') datareader: string;

  /*
   Properties
   name : http-method
   datatype : string
   version : 4.0 onwards
   default : none
   description : Type of HTTP call, POST,GET etc.
   */
  @Input('http-method') httpmethod: string;

  /*
   Properties
   name : http-url
   datatype : string
   version : 4.0 onwards
   default : none
   description : REST url for fetching data.
   */
  @Input('http-url') httpurl: string;

  /*
   Properties
   name : display-field
   datatype : string
   version : 4.0 onwards
   default : none
   description : Name of key inside response data to display on ui.
   */
  @Input('display-field') displayfield: string;

  /*
   Properties
   name : value-field
   datatype : string
   version : 4.0 onwards
   default : none
   description : Name of key inside response data.use to send to backend
   */
  @Input('value-field') valuefield: string;

  /*
   Events
   name : selectedRecord
   datatype : none
   version : none
   default : none
   description : Get selected value Object.
   */
  @Output() selectedRecord: any = new EventEmitter<any>();

  /*
   Properties
   name : height
   datatype : string
   version : 4.0 onwards
   default : none
   description : height of grid
   */
  @Input() height: any;

  /*
   Events
   name : rowSelect
   datatype : none
   version : none
   default : none
   description : It will gives you row clicked data.
   */

  @ViewChild('header', { read: ElementRef }) public gridHeader: ElementRef;
  @Output() rowSelect: any = new EventEmitter<any>();

  responseData: any;

  columns: any[] = [];

  previousValue: any;

  viewRows: any;

  mask = true;

  @ContentChildren(AmexioGridColumnComponent) columnRef: QueryList<AmexioGridColumnComponent>;
  constructor(public treeDataTableService: CommonDataService) {
  }
  ngOnInit() {
    if (this.httpmethod && this.httpurl) {
      this.treeDataTableService.fetchData(this.httpurl, this.httpmethod).subscribe((response) => {
        this.responseData = response;
      }, (error) => {
      }, () => {
        this.setData(this.responseData);
      });
    } else if (this.data) {
      this.previousValue = JSON.parse(JSON.stringify(this.data));
      this.setData(this.data);
    }
  }
  ngAfterViewInit() {
    this.onResize();
    this.componentLoaded = true;
  }
  ngAfterContentInit() {
    this.createConfig();
  }
  createConfig() {
    const columnRefArray = this.columnRef.toArray();
    for (const cr of columnRefArray) {
      const columnConfig = cr;
      let columnData: any;
      if (columnConfig.headerTemplate != null && columnConfig.bodyTemplate != null) {
        columnData = {
          text: columnConfig.text,
          dataindex: columnConfig.dataindex,
          hidden: columnConfig.hidden,
          datatype: columnConfig.datatype,
          headerTemplate: columnConfig.headerTemplate,
          width: columnConfig.width,
          bodyTemplate: columnConfig.bodyTemplate,
        };
      } else if (columnConfig.headerTemplate != null && columnConfig.bodyTemplate == null) {
        columnData = {
          text: columnConfig.text,
          dataindex: columnConfig.dataindex,
          hidden: columnConfig.hidden,
          datatype: columnConfig.datatype,
          width: columnConfig.width,
          headerTemplate: columnConfig.headerTemplate,
        };
      } else if (columnConfig.bodyTemplate != null && columnConfig.headerTemplate == null) {
        columnData = {
          text: columnConfig.text,
          dataindex: columnConfig.dataindex,
          hidden: columnConfig.hidden,
          datatype: columnConfig.datatype,
          width: columnConfig.width,
          bodyTemplate: columnConfig.bodyTemplate,
        };
      } else if (columnConfig.bodyTemplate == null && columnConfig.headerTemplate == null) {
        columnData = {
          text: columnConfig.text,
          dataindex: columnConfig.dataindex,
          hidden: columnConfig.hidden,
          width: columnConfig.width,
          datatype: columnConfig.datatype,
        };
      }
      this.columns.push(columnData);
    }
  }
  updateComponent() {
    if (this.data) {
      this.viewRows = this.getResponseData(this.data);
    }
  }
  setData(httpResponse: any) {
    if (httpResponse) {
      const treedata = this.getResponseData(httpResponse);
      this.viewRows = treedata;
      this.viewRows.forEach((row: any, index: any) => {
        this.viewRows[index].level = 1;
        this.viewRows[index].expanded = false;
      });
      this.mask = false;
    } else {
      this.viewRows = [];
    }
  }
  getResponseData(httpResponse: any) {
    let responsedata = httpResponse;
    if (this.datareader != null) {
      const dr = this.datareader.split('.');
      for (const ir of dr) {
        responsedata = responsedata[ir];
      }
    } else {
      responsedata = httpResponse;
    }
    return responsedata;
  }
  removeAll() {
    this.viewRows.forEach((node: any) => {
      node.expanded = false;
      this.removeRows(node);
    });
  }
  expandAll() {
    this.viewRows.forEach((node: any, index: number) => {
      node.expanded = true;
      this.addRows(node, index);
    });
  }
  toogle(row: any, index: number) {
    row.expanded = !row.expanded;
    if (row.expanded) {
      this.addRows(row, index);
    } else {
      this.removeRows(row);
    }
  }
  addRows(row: any, index: number) {
    if (row.children) {
      for (let i = 0; i < row.children.length; i++) {
        const node = row.children[i];
        if (!row.level) {
          row.level = 1;
        }
        if (node.children) {
          node.expanded = false;
        }
        node.level = (row.level + 1);
        this.viewRows.splice(index + (i + 1), 0, node);
      }
    }
  }
  removeRows(node: any) {
    if (node.children) {
      for (const nc of node.children) {
        if (this.viewRows) {
          this.setRemovedRows(nc);
        }
      }
    }
  }
  setRemovedRows(nc: any) {
    for (const vr of this.viewRows) {
      if (vr === nc) {
        if (nc.children) {
          this.removeRows(nc);
        }
        this.viewRows.splice(this.viewRows.indexOf(nc), 1);
      }
    }
  }
  setSelectedRow(rowData: any, event: any) {
    this.selectedRecord.emit(rowData);
    this.rowSelect.emit(rowData);
  }
  onResize() {
    if (this.height) {
      let h = (window.innerHeight / 100) * this.height;
      if (this.gridHeader && this.gridHeader.nativeElement && this.gridHeader.nativeElement.offsetHeight) {
        h = h - this.gridHeader.nativeElement.offsetHeight;
      }
      if (this.height === 100) {
        h = h - 40;
      }
      this.height = h;
    }
  }
}
