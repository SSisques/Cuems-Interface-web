import { Component, OnInit, Input, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { ProyectosService, ListaProyectos } from '../../servicios/proyectos.service';
import { WebsocketService } from '../../servicios/websocket.service';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { ConfirmDialogComponent } from '../confirm-dialog/confirm-dialog.component';
import { AlertService } from '../../_alert';
import { MatSelectionList } from '@angular/material/list';
import { TranslateService } from '@ngx-translate/core';
import { NewProjectComponent } from '../new-project/new-project.component';
import { NodesService } from '../../servicios/nodes.service';



@Component({
  selector: 'app-proyectos',
  templateUrl: './proyectos.component.html'
})
export class ProyectosComponent implements OnInit{

  @ViewChild('projectsTrashList') projectsTrashList: MatSelectionList;

  public cargado = false;

  listaProyectos: ListaProyectos [] = []; // listado de proyectos
  myUuid: string [] = []; // listado de uuids usada al recibir datos ws en conectamosWs()
  projectTrashList: any [] = [];
  myTrashProjectUuid: any[] = [];
  selected: any[] = [];
  notify = true;


  @Input() uuid: string; // recibimois el uuid del template

  constructor(private proService: ProyectosService,
              private translate: TranslateService,
              private router: Router,
              private wsService: WebsocketService,
              private dialog: MatDialog,
              private nodesService: NodesService,
              public alertService: AlertService
              ) {
              this.proService.project_List();
              this.proService.project_Trash_List();
              this.recibimosWs();
              // this language will be used as a fallback when a translation isn't found in the current language
              this.translate.setDefaultLang('en');
              // the lang to use, if the lang isn't available, it will use the current loader to get them
              this.translate.use('en');
  }


  ngOnInit(): void {
    // setTimeout(() => { console.log(this.listaProyectos[0].name) }, 500);

  }
  recibimosWs(): void {
    this.wsService.ws.subscribe(msg => { // nos suscribimos a la conexión
      const recibo: any = msg; // asignamos un tipado para que no nos de error typescript

      switch (recibo.type) {
        case 'project_list': {
          this.listaProyectos = [];
          this.myUuid = []; // limpiamos array

          for (let index = 0; index < recibo.value.length; index++) {

            let myKeys: any;
            myKeys = Object.keys(recibo.value[index]);
            this.myUuid.push(myKeys[0]); // listado de uuids

            this.listaProyectos.push({ // hacemos el push de los proyectos al listado
              uuid: myKeys[0],
              name: recibo.value[index][this.myUuid[index]].name,
              unix_name: recibo.value[index][this.myUuid[index]].unix_name,
              date: recibo.value[index][this.myUuid[index]].date
             });

        }
          this.cargado = true; // pagina cargada

          break;

        }
        case 'project_save': { // recibimos cuando creamos u nuevo proyecto

          this.router.navigate( ['/cuelist', recibo.value, 'edit'] ); // redirigimos al recibir respuesta

          break;
        }
        case 'project_duplicate': {

          // this.router.navigate( ['/cuelist', recibo.value.new_uuid, 'edit'] ); // redirigimos al recibir respuesta
          this.proService.project_List();
          break;
        }
        case 'list_update': {

          if (recibo.value === 'project_list') {
            console.log('update');
            this.updateProjectList();
          }
          if (recibo.value === 'project_trash_list') {
            console.log('Papelera de proyectos actualizada.');
          }
          break;
        }
        case 'project_trash_list': {

          this.myTrashProjectUuid = [];
          this.projectTrashList = [];

          for (let index = 0; index < recibo.value.length; index++) {

          let myKeys: any[] = [];
          myKeys = Object.keys(recibo.value[index]);
          this.myTrashProjectUuid.push(myKeys[0]); // listado de uuids

          this.projectTrashList.push({ // hacemos el push de los proyectos al listado
            uuid: myKeys[0],
            name: recibo.value[index][this.myTrashProjectUuid[index]].name,
            created: recibo.value[index][this.myTrashProjectUuid[index]].created,
            modified: recibo.value[index][this.myTrashProjectUuid[index]].modified,
            unix_name: recibo.value[index][this.myTrashProjectUuid[index]].unix_name
           });

          }
          // console.log(this.filesTrashList);
          break;
        }
        case 'project_delete': {
          this.updateProjectTrashList();
          break;
        }
        case 'project_restore': {
          this.updateProjectList();
          break;
        }
        default:
          break;
      }

     });
  }

updateProjectList(): void {
    this.proService.project_List();
    if (this.notify) {
      const options = {
        autoClose: true
      };
      this.alertService.success('Listo de proyectos actualizado', options);
    }
  }
updateProjectTrashList(): void {
    this.proService.project_Trash_List();
    if (this.notify) {
      // console.log(this.notify);
      const options = {
        autoClose: true
      };
      this.alertService.success('Lista de archivos en papelera actualizada', options);
    }
   }

selectAllTrash(): void {
    this.projectsTrashList.selectAll();
  }
deselectAllTrash(): void {
    this.projectsTrashList.deselectAll();
  }

// dialogs

// borrar proyecto
confirmDialog(idx: number, uuid: string): void {

  const id = idx;
  const uid = uuid;

  const dialogConfig = new MatDialogConfig();
  dialogConfig.disableClose = true;
  dialogConfig.autoFocus = true;
  dialogConfig.height = '230px';
  dialogConfig.width = '300px';

  dialogConfig.data = {
    name: 'Estás a punto de borrar el proyecto ' + this.listaProyectos[idx].name,
    msg: 'Confirmas borrarlo?'
};

  const dialogRef = this.dialog.open(ConfirmDialogComponent, dialogConfig);

  dialogRef.afterClosed().subscribe(
      data => {
        if (data === true) {
          this.notify = false;
          this.listaProyectos.splice(id, 1); // borramos del array local
          this.proService.deleteFromServer(uid); // borramos proyecto del sevidor
        }
      });
}
deleteSelected(type: string): void {
  const tYpe = type;
  let index: number;
  const dialogConfig = new MatDialogConfig();
  dialogConfig.disableClose = true;
  dialogConfig.autoFocus = true;
  dialogConfig.height = '250px';
  dialogConfig.width = '350px';


  if (this.selected.length <= 0) {
    // console.log('nada seleccionado');
  return;
  } else if (this.selected.length > 1) {
    // console.log('plural');
    dialogConfig.data = {
      name: 'Estás a punto de borrar definitivamente una selección de proyectos.',
      msg: 'Confirmamos borrarlos?'
    };
  } else {
    // console.log('uno');
    dialogConfig.data = {
      name: 'Estás a punto de borrar definitivamente un proyecto.',
      msg: 'Confirmamos borrarlo?'
    };
  }


  const dialogRef = this.dialog.open(ConfirmDialogComponent, dialogConfig);

  dialogRef.afterClosed().subscribe(
      data => {
        if (data === true) {
          for (const uuid of this.selected) {

            if (tYpe === 'trash') {
              this.notify = false;
              index = this.projectTrashList.findIndex(file => file.uuid === uuid ); // leemos el index de la uuid
              this.projectTrashList.splice(index, 1); // borramos del array local
              this.proService.project_trash_deleteFromServer(uuid); // borramos del servidor
            } else {
              // index = this.listaProyectos.findIndex(file => file.uuid === uuid ); // leemos el index de la uuid
              // this.projectTrashList.splice(index, 1); // borramos del array local
              // this.proService.project_deleteFromServer(uuid); // borramos del servidor
            }


           }

        }
      });
 }
restoreSelected(): void {

  let index: number;
  const dialogConfig = new MatDialogConfig();
  dialogConfig.disableClose = true;
  dialogConfig.autoFocus = true;
  dialogConfig.height = '250px';
  dialogConfig.width = '350px';

  if (this.selected.length <= 0) {
    // console.log('nada seleccionado');
  return;
  } else if (this.selected.length > 1) {
    // console.log('plural');
    dialogConfig.data = {
      name: 'Está apunto de recuperar una selección de proyectos.',
      msg: 'Confirmamos recuperarlos?'
    };
  } else {
    // console.log('uno');
    dialogConfig.data = {
      name: 'Está apunto de recuperar un proyecto.',
      msg: 'Confirmamos recuperarlo?'
    };
  }


  const dialogRef = this.dialog.open(ConfirmDialogComponent, dialogConfig);

  dialogRef.afterClosed().subscribe(
      data => {
        if (data === true) {
          for (const uuid of this.selected) {
              this.notify = false;
              index = this.projectTrashList.findIndex(file => file.uuid === uuid ); // leemos el index de la uuid
              this.projectTrashList.splice(index, 1); // borramos del array local
              this.proService.project_restoreFromServer(uuid); // recuperamos del servidor
           }

        }
      });
 }
// crear proyecto nuevo
newProjectDialog(): void {

  // unix name

  const dialogConfig = new MatDialogConfig();
  dialogConfig.disableClose = true;
  dialogConfig.autoFocus = true;
  dialogConfig.height = 'auto';
  dialogConfig.width = '800px';

  dialogConfig.data = {
  accion  : 'new',
  projectList: this.listaProyectos
};

  const dialogRef = this.dialog.open(NewProjectComponent, dialogConfig);

  dialogRef.afterClosed().subscribe(
      data => {
        if (data === 'close') { // si cierra la ventana

        } else {
          this.proService.saveToServer(data.name, data.unix_name, data.description); // creamos el nuevo proyecto
        }
      });

}


duplicateProject(uuid: string): void {
  this.proService.duplicateFromServer(uuid); // creamos el nuevo proyecto
}
forceClosedProject(): void {
  this.proService.forceCloseFromServer();
}

editarProyecto(uuid): void {
  this.router.navigate( ['/cuelist', uuid, 'edit'] ); // redireccionamos al cuelist + el mode edit
}
showProyecto(uuid): void{
  this.router.navigate( ['/cuelist', uuid, 'show'] ); // redireccionamos al cuelist + el mode show
}



genfecha(): string {
const today = new Date();

let dd: any = today.getDate();
let mm: any = today.getMonth() + 1;
const yyyy: any = today.getFullYear();
let hh: any = today.getHours();
let mi: any = today.getMinutes();
let se: any = today.getSeconds();

if (dd < 10) { dd = '0' + dd; }
if (mm < 10) { mm = '0' + mm; }
if (hh < 10) { hh = '0' + hh; }
if (mi < 10) { mi = '0' + mi; }
if (se < 10) { se = '0' + se; }
return dd  + '/' + mm + '/' + yyyy + ' ' + hh + ':' + mi + ':' + se;
}



}
