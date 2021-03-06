import { Component, OnInit, ViewChild } from '@angular/core';
import { MatTableDataSource, MatPaginator, DateAdapter, MAT_DATE_LOCALE, MAT_DATE_FORMATS } from '@angular/material';
import { AdvertService } from '../../shared/advert.service';
import { Spinner } from 'src/app/shared/services/spinner.service';
import { SelectionModel } from '@angular/cdk/collections';
import * as _moment from 'moment';
import { ProvinceService } from 'src/app/shared/services/province.service';
import { UserService } from 'src/app/modules/user-management/shared/user.service';
import { MomentDateAdapter } from '@angular/material-moment-adapter';
import { AppConfig } from 'src/app/config/app.config';
import { Dialog } from 'src/app/shared/services/dialog.service';
import { TranslateService } from '@ngx-translate/core';

export const MY_FORMATS = {
  parse: {
    dateInput: AppConfig.generalConfig.dateFormat,
  },
  display: {
    dateInput: AppConfig.generalConfig.dateFormat,
    monthYearLabel: 'MMM YYYY',
    dateA11yLabel: 'LL',
    monthYearA11yLabel: 'MMMM YYYY',
  },
};

@Component({
  selector: 'app-adv-management-main',
  templateUrl: './adv-management-main.component.html',
  styleUrls: ['./adv-management-main.component.scss'],
  providers: [
    { provide: DateAdapter, useClass: MomentDateAdapter, deps: [MAT_DATE_LOCALE] },
    { provide: MAT_DATE_FORMATS, useValue: MY_FORMATS }
  ]
})
export class AdvManagementMainComponent implements OnInit {
  _moment = _moment;
  baseUrl = AppConfig.endpoints.baseUrl;

  displayedColumns: string[] = ['select', 'position', 'code', 'title', 'address',
    'size', 'createdDate', 'subTitle', 'contact', 'images', 'actions'];
  dataSource: MatTableDataSource<any>;
  selection = new SelectionModel<any>(true, []);
  panelOpenState = false;
  pageSizeOptions = [10, 50, 100, 500, 1000, 5000, 10000];
  totalOfPages = 0;
  Object = Object;
  today = new Date();

  searchCriterias = {
    code: {
      key: 'code',
      operation: 'LIKE',
      value: '',
      title: 'Mã',
      type: 'input'
    },
    advCompNameSearching: {
      key: 'advCompNameSearching',
      operation: 'LIKE',
      value: '',
      title: 'Tên công ty',
      type: 'input'
    },
    createdBy: {
      key: 'createdBy',
      operation: 'EQUALITY',
      value: '',
      title: 'Người tạo',
      type: 'selection',
      options: []
    },
    addressSearching: {
      key: 'addressSearching',
      operation: 'LIKE',
      value: '',
      title: 'Địa chỉ',
      type: 'selection'
    },
    titleSearching: {
      key: 'titleSearching',
      operation: 'LIKE',
      value: '',
      title: 'Tiêu đề',
      type: 'input'
    },
    houseNoSearching: {
      key: 'houseNoSearching',
      operation: 'EQUALITY',
      value: '',
      title: 'Số nhà',
      type: 'input'
    },
    streetSearching: {
      key: 'streetSearching',
      operation: 'EQUALITY',
      value: '',
      title: 'Tên đường',
      type: 'input'
    },
    wardSearching: {
      key: 'wardSearching',
      operation: 'EQUALITY',
      value: '',
      title: 'Phường',
      type: 'input'
    },
    districtSearching: {
      key: 'districtSearching',
      operation: 'EQUALITY',
      value: '',
      title: 'Quận',
      type: 'input'
    },
    provinceSearching: {
      key: 'provinceSearching',
      operation: 'EQUALITY',
      value: '',
      title: 'Tỉnh',
      type: 'selection',
      options: []
    }
  };
  dateRange = {
    start: _moment('2018-01-01', 'YYYY-MM-DD').toDate(),
    end: this.today
  };

  @ViewChild(MatPaginator) paginator: MatPaginator;

  constructor(
    private advertService: AdvertService,
    private spinner: Spinner,
    private provinceService: ProvinceService,
    private userService: UserService,
    private dialog: Dialog,
    private translate: TranslateService
  ) { }

  ngOnInit() {
    this.buildProvinceOptions();
    this.buildUserOptions();
    this.buildDataTable(true);
  }

  buildProvinceOptions() {
    this.provinceService.getAll().subscribe(rs => {
      this.searchCriterias.provinceSearching.options = rs.data;
    });
  }

  buildUserOptions() {
    this.userService.getAll(0, -1).subscribe(rs => {
      this.searchCriterias.createdBy.options = rs.data.data;
    });
  }

  buildDataTable(initPaginator?: boolean) {
    const page = this.paginator.pageIndex ? this.paginator.pageIndex : 0;
    const size = this.paginator.pageSize ? this.paginator.pageSize : 10;
    this.spinner.show();
    this.advertService.getAll(this.buildSearchCriteria(), page + 1, size).subscribe(res => {
      this.totalOfPages = res.data.count;
      this.dataSource = new MatTableDataSource<any>(res.data.data);
      if (initPaginator) {
        this.paginator.pageIndex = 0;
        this.dataSource.paginator = this.paginator;
      }
      this.spinner.hide();
    });
  }

  buildSearchCriteria() {
    const searchCriterias = Object.keys(this.searchCriterias).filter(key => {
      return this.searchCriterias[key].value !== '';
    }).map(key => {
      return {
        key: this.searchCriterias[key].key,
        operation: this.searchCriterias[key].operation,
        value: this.searchCriterias[key].value
      };
    });
    searchCriterias.push({
      key: 'createdDate',
      operation: 'BETWEEN',
      value: JSON.stringify({
        start: _moment(this.dateRange.start).format('DD/MM/YYYY'),
        end: _moment(this.dateRange.end).format('DD/MM/YYYY')
      })
    });
    return searchCriterias;
  }

  isAllSelected() {
    const numSelected = this.selection.selected.length;
    const numRows = this.dataSource.data.length;
    return numSelected === numRows;
  }

  masterToggle() {
    this.isAllSelected() ?
      this.selection.clear() :
      this.dataSource.data.forEach(row => this.selection.select(row));
  }

  removeAdv(advertId: string, e) {
    e.stopPropagation();
    this.dialog.confirm({
      title: this.translate.instant('common.info'),
      message: this.translate.instant('advert.confirm_delete_action')
    }).then(rs => {
      if (rs) {
        this.spinner.show();
        this.advertService.deleteById(advertId).subscribe(res => {
          if (res) {
            this.buildDataTable(false);
            this.spinner.hide();
            this.dialog.info({
              title: this.translate.instant('common.info'),
              message: this.translate.instant('advert.delete_success')
            });
          }
        }, err => {
          this.dialog.info({
            title: this.translate.instant('common.info'),
            message: this.translate.instant('advert.delete_fail')
          });
        });
      }
    });
  }
}
