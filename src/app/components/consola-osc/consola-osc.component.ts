import { Component, OnInit } from '@angular/core';
import { OscService } from '../../servicios/osc.service'; // importamos el servicio osc

@Component({
  selector: 'app-consola-osc',
  templateUrl: './consola-osc.component.html'
})
export class ConsolaOscComponent implements OnInit {

  constructor(private _oscService:OscService) { }

  ngOnInit(): void {
  }

  Leo(){ return this._oscService.recivoMsg(); }

}
