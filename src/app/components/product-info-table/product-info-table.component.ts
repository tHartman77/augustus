import { Component, OnInit, ViewChild} from '@angular/core';
import { CandyJarService } from '../../services/candy-jar.service';
import { productInfoEntry } from '../../models/productInfoEntry.model';
import { MatTableDataSource, MatSort } from '@angular/material';
import { ActivatedRoute, Router} from '@angular/router';
import { UtilityService } from '../../services/utility.service';


@Component({
  selector: 'app-product-info-table',
  templateUrl: './product-info-table.component.html',
  styleUrls: ['./product-info-table.component.css']
})
export class ProductInfoTableComponent implements OnInit {
  errorType: string;
  spinner: boolean = true;
  searchResults: any = {"productType":"", "productCode":""};
  realDataSource: any[] = [];
  dataSource: MatTableDataSource<productInfoEntry>;
  presale: string;
  hotmarket: string;
  specialOrder: string;
  vdcEligible: string;
  presaleStart: string;
  presaleEnd: string;
  hotmarketStart: string;
  hotmarketEnd: string;
  codes: string[] = ['eCode', 'Style', 'SKU', 'UPC'];
  booleanOptions: string[] = ['0', '1'];
  yesNoOptions: string[] = ['N', 'Y'];
  lines: number = 0;
  
  filters: {}
  displayedColumns = ['ecode', 'style', 'sku', 'upc', 'supc', 'description', 'presale', 'presaleEndDate', 'hotMarket', 'hotMarketEndDate', 'specialOrder', 'vdceligible'];
  @ViewChild(MatSort) sort: MatSort;
  
  constructor(private candyJarService: CandyJarService,
    private route: ActivatedRoute,
    private utilityService: UtilityService,
    private router: Router
  ) {
    route.paramMap.subscribe(params => {
      this.searchResults = params["params"];
      this.populateTable(this.searchResults["code"], this.searchResults["type"]);
    })
  }

  onTableScroll(e) {
    const tableViewHeight = e.target.offsetHeight // viewport: ~500px
    const tableScrollHeight = e.target.scrollHeight // length of all table
    const scrollLocation = e.target.scrollTop; // how far user scrolled
    
    // If the user has scrolled within 200px of the bottom, add more data
    const buffer = 200;
    const limit = tableScrollHeight - tableViewHeight - buffer; 
    if (scrollLocation > limit) {
    this.realDataSource = this.realDataSource.concat(this.dataSource.filteredData.slice(this.lines,this.lines + 20));
    this.lines += 20;
    }
  }

  ngOnInit() {
    this.filters = {"presale": "", "hotmarket": "", "specialOrder": "", "vdceligible": ""};
    const codeTypes = ['eCode', 'Style', 'SKU', 'UPC'];
  }

  populateTable(code: string, type: string){
    this.spinner = true;
    this.clear();
    code = code.trim();
    code.toLowerCase;
    this.candyJarService.getProductInfoEntry(code, type).subscribe(stream => {
      this.dataSource = new MatTableDataSource<productInfoEntry>(stream);
      this.dataSource.sort = this.sort;
      if (this.dataSource.data.length == 0){
        this.errorType = "noresults";
        const mode = this.route.snapshot.url[0]["path"];
        const location = this.route.snapshot.params["location"];
        this.router.navigate(['error', this.errorType, mode, type, code, location]);
      } else { 
        this.lines = 20;
        this.realDataSource =  this.dataSource.data.slice(0,this.lines); 
      }
      this.spinner = false;
    });
  }

  applyFilter(filter: string, value: string){
    this.dataSource.filterPredicate = this.createFilter();
    this.filters[filter] = value;
    this.lines = 20;
    this.dataSource.filter = JSON.stringify(this.filters);
    this.realDataSource = this.dataSource.filteredData.slice(0,this.lines);
  }

  clear(){
    this.presale = "";
    this.hotmarket = "";
    this.specialOrder = "";
    this.vdcEligible = "";
    this.presaleStart = "";
    this.presaleEnd = "";
    this.hotmarketStart = "";
    this.hotmarketEnd = "";
  }

  createFilter() {
    var flags = [];
    let filterFunction = function(data, filter) : boolean {
      let searchTerms = JSON.parse(filter)
      var result = true;
      for(var key in searchTerms){
            if(data[key] != null){
              if(searchTerms[key] === "Any" || searchTerms[key].length === 0 || searchTerms[key] === ""){
              } else {
                result = result && data[key].toString().indexOf(searchTerms[key]) != -1;
              }
            
        } 
    } 
      return result;
    }
    return filterFunction
  }

  export(){
    const filename = "Product_Info_Table_" + this.searchResults["productType"] + "_" + this.searchResults["productCode"];
    this.utilityService.exportToCSV(this.dataSource.data, filename, true)
  }

  goToCode(type: string, code: string){
    const mode = this.route.snapshot.url[0]["path"];
    const location = this.route.snapshot.params["location"] != null ? this.route.snapshot.params["location"] : "";

    this.router.navigate(['/' + mode, type,  code, location]);
  }

}