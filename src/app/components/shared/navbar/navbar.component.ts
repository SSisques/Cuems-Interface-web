import { Component, OnInit } from '@angular/core';
import { Router } from "@angular/router";
import { OscService } from '../../../servicios/osc.service'; // importamos el servicio osc
import { LowerCasePipe } from '@angular/common';


@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
})
export class NavbarComponent implements OnInit {


  constructor( private router: Router,
               private _oscService: OscService) { 

                }

  ngOnInit(): void {
  
  }

  Go(){ //ejecutamos el go del servicio
    console.log('envio Go!!!');
    this._oscService.envioGo();
  }

 
}

