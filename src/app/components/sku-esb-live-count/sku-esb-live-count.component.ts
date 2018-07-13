import { Component, OnInit, ViewChild } from '@angular/core';
import { CandyJarService } from '../../services/candy-jar.service';
import { SkuHistoryEntry } from '../../models/skuHistoryEntry.model';
import { MatTableDataSource, MatSort } from '@angular/material';
import { CommunicationService } from '../../services/communication.service';
import { ActivatedRoute } from '@angular/router';
import { EsbInventoryService } from '../../services/esb-inventory.service';
import { EsbLiveCountEntry } from '../../models/EsbLiveCountEntry.model';

@Component({
  selector: 'app-sku-esb-live-count',
  templateUrl: './sku-esb-live-count.component.html',
  styleUrls: ['./sku-esb-live-count.component.css']
})
export class SkuEsbLiveCountComponent implements OnInit {
  show: boolean = false;
  showError: boolean = false;
  infoFound: boolean;
  historyError: boolean = false;
  dataSource: MatTableDataSource<EsbLiveCountEntry>;
  displayedColumns = ['sku', 'atsqty', 'time'];
  @ViewChild(MatSort) sort: MatSort;

  constructor(
    private communicationService: CommunicationService,
    private route: ActivatedRoute,
    private esbInventoryService: EsbInventoryService
  ) {}
  insert(str, index, value) {
    return str.substr(0, index) + value + str.substr(index);
  }
  ngOnInit() {
    this.communicationService.currentCode.subscribe(result => {
      if(result["productType"] === "SKU"){
        this.populateTable(result["productCode"]);
      } else {
        this.dataSource = null;
        this.show = false;
        this.showError = false;
        this.historyError = false;
      }
    })
    this.communicationService.currentFound.subscribe(found => {
      this.infoFound = found;
    })
    const type = this.route.snapshot.paramMap.get('type');
    const code = this.route.snapshot.paramMap.get('code');
    if(type == "SKU" && code != null){
      this.populateTable(code);
    } else {
      this.dataSource = null;
      this.show = false;
      this.showError = false;
      this.historyError = false;
    }
  }

  populateTable(sku: string){
    this.showError = false;
    this.historyError = false;
    this.show = true;
    sku = sku.trim();
    this.esbInventoryService.getESBInventory('0',sku).subscribe(stream => {
    
      var i;
      for(i = 0; i< stream["data"]["skus"].length; i++){
        if(stream["data"]["skus"][i] != null){
          stream["data"]["skus"][i]["time"] = this.insert(stream["data"]["skus"][i]["time"],4,'-');
          stream["data"]["skus"][i]["time"] = this.insert(stream["data"]["skus"][i]["time"],7,'-');
          stream["data"]["skus"][i]["time"] = this.insert(stream["data"]["skus"][i]["time"],10,' ');
          stream["data"]["skus"][i]["time"] = this.insert(stream["data"]["skus"][i]["time"],13,':');
          stream["data"]["skus"][i]["time"] = this.insert(stream["data"]["skus"][i]["time"],16,':');
          stream["data"]["skus"][i]["time"] = this.insert(stream["data"]["skus"][i]["time"],19,'.');
        } else {
          stream["data"]["skus"].splice(i);
        }
    }
      this.dataSource = new MatTableDataSource<EsbLiveCountEntry>(stream["data"]["skus"]);
      this.dataSource.sort = this.sort;
      if (this.dataSource.data.length == 0){
        if(this.infoFound){
          this.historyError = true;
          this.showError = false;
        } else {
          this.showError = true;
          this.historyError = false;
        }
      } else {
        this.showError = false;
        this.historyError = false;
      }
    });
  }
}