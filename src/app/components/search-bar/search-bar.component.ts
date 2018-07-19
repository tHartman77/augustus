import { Component, OnInit } from '@angular/core';
import { CommunicationService } from '../../services/communication.service';
import { ActivatedRoute, Router } from '@angular/router';
import { FormControl, Validators } from '@angular/forms';

@Component({
  selector: 'app-search-bar',
  templateUrl: './search-bar.component.html',
  styleUrls: ['./search-bar.component.css']
})
export class SearchBarComponent implements OnInit {
  searchInput = new FormControl('', [Validators.required]);
  selectedCode = new FormControl('', [Validators.required]);
  codes: string[] = ['eCode', 'Style', 'SKU', 'UPC'];
  searchAttempted: boolean = false;

  
  constructor(
    private communicationService: CommunicationService,
    private route: ActivatedRoute,
    private router: Router
  ) {
    route.paramMap.subscribe(params => {
      if(this.route.snapshot.url[0]["path"] == "home"){
        this.clear();
      } else {
        this.searchInput.setValue(params["params"]["code"]);
        this.selectedCode.setValue(params["params"]["type"]);
      }
    })
  }

  ngOnInit() {
    const type = this.route.snapshot.paramMap.get('type');
    const code = this.route.snapshot.paramMap.get('code');
    if(type != null && code != null){
      this.searchInput.setValue(code);
      this.selectedCode.setValue(type);
    }
  }

  clear(){
    this.searchInput.setValue("");
    this.selectedCode.setValue("");
  }

  search(){
    this.searchAttempted = true;
    if(this.searchInput.value != "" && this.selectedCode.value != ""){
      this.router.navigate(['info', this.selectedCode.value, this.searchInput.value])
      this.communicationService.updateCode(this.searchInput.value, this.selectedCode.value);
    }
  }


}
