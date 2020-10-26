import { Component, Input } from '@angular/core';
import { ActivatedRoute } from "@angular/router";
import { CueListComponent } from "../cuelist/cuelist.component";

@Component({
  selector: 'app-cue',
  templateUrl: './cue.component.html'
})
export class CueComponent {

  @Input() cue: any = {};
  @Input() idx: number;


  constructor( private activatedRoute: ActivatedRoute,
               private cuelistComponent: CueListComponent
               ) { }

  ngOnInit(): void {
  }

  selectCue(id){
    console.log('Cue ' + id + ' seleccionada');
    
  }

}
