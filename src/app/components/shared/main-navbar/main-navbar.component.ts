import { Component, OnInit, Input, Output, EventEmitter, AfterViewInit } from '@angular/core';
import { Router } from '@angular/router';
import { ActivatedRoute } from '@angular/router';
import { ProyectosService } from '../../../servicios/proyectos.service';
import { TranslateService } from '@ngx-translate/core';


@Component({
  selector: 'app-main-navbar',
  templateUrl: './main-navbar.component.html'
})
export class MainNavbarComponent implements AfterViewInit {

  // public activeLang = 'en';

  edit = {
    editing: false,
    // edited: false,
    uuid: '',
    name: '',
    mode: true, // true que será edit y false show
    estiloGuardar: '',
    guardar: false,
    preferences: false
  };
  name: string;

  constructor(
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private proService: ProyectosService,
    private translate: TranslateService,
  ) { 
    // this language will be used as a fallback when a translation isn't found in the current language
    // this.translate.setDefaultLang(this.activeLang);
    this.translate.setDefaultLang('en');
    // the lang to use, if the lang isn't available, it will use the current loader to get them
    this.translate.use('en');
 
  }

  // ngOnInit(): void {
  //   // this.recibimosEdit();

  // }
  ngAfterViewInit(): void { // esta funcion se ejecuta una vez cargada la pag - buscar info
    this.recibimosEdit();
    setTimeout(() => { this.name = this.edit.name; }, 500); // evitamos efecto al recargar el name
  }

  recibimosEdit(): void {

    this.proService.editingProject.subscribe( // escuchamos el obsevable editinsProject
      msg => {
           this.edit = msg;
          //  console.log(this.edit.edited);
           if (this.name !== this.edit.name) {
            setTimeout(() => { this.name = this.edit.name; }, 500);
            // console.log(this.name);
            // console.log(this.edit.name);
           }
      });

   }

   cambiarLenguaje(lang): void  {
    // this.activeLang = lang;
    this.translate.use(lang);
  }

  saveProject(): void{
    this.edit.guardar = true;
    this.proService.changeEditing(this.edit);
  }
  preferences(): void {
    this.edit.preferences = true;
    this.proService.changeEditing(this.edit);
  }
  routeEditing(): void {
    let modeText: string;
    if (this.edit.mode) {
      modeText = 'show';
    } else if (!this.edit.mode) {
      modeText = 'edit';
    }
    // this.proService.changeEditing(this.edit);
    this.router.navigate( ['/cuelist', this.edit.uuid, modeText] );
  }

}
