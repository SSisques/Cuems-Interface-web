import { Component, OnInit, ViewChild, ElementRef  } from '@angular/core';
import { FileItem } from '../../models/file-item';
import { UploadService } from '../../servicios/upload.service';
import { FilesService, FileList } from '../../servicios/files.service';
import { WebsocketService } from '../../servicios/websocket.service';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { ConfirmDialogComponent } from '../confirm-dialog/confirm-dialog.component';
import { AlertService } from '../../_alert';
import { MatSelectionList } from '@angular/material/list';

@Component({
  selector: 'app-media',
  templateUrl: './media.component.html',
  styleUrls: ['./media.component.css']
})
export class MediaComponent implements OnInit {

  @ViewChild('fileTrashList') fileTrashList: MatSelectionList;
  @ViewChild('fileList') fileList: MatSelectionList;

  public cargado = false;
  estaSobreElemento = false;
  archivosComponent: FileItem[] = [];
  myFileUuid: any[] = [];
  myTrashFileUuid: any[] = [];
  filesList: FileList [] = [];
  filesTrashList: FileList [] = [];

  selected: any[] = [];
  notify = false;


  constructor(private uploadService: UploadService,
              private fileService: FilesService,
              private wsService: WebsocketService,
              private dialog: MatDialog,
              public alertService: AlertService
              )
              {
                this.fileService.files_List();
                this.fileService.files_Trash_List();
                this.recibimosWs();
               }

  ngOnInit(): void {
  }

  recibimosWs(): void {

    this.wsService.ws.subscribe(msg => { // nos suscribimos a la conexión

      const recibo: any = msg; // asignamos un tipado para que no nos de error tipescript

      switch (recibo.type) {
        case 'file_list': {

          this.myFileUuid = [];
          this.filesList = [];

          for (let index = 0; index < recibo.value.length; index++) {

          let myKeys: any[] = [];
          myKeys = Object.keys(recibo.value[index]);
          this.myFileUuid.push(myKeys[0]); // listado de uuids

          this.filesList.push({ // hacemos el push de los proyectos al listado
            uuid: myKeys[0],
            name: recibo.value[index][this.myFileUuid[index]].name,
            unix_name: recibo.value[index][this.myFileUuid[index]].unix_name,
            created: recibo.value[index][this.myFileUuid[index]].created,
            modified: recibo.value[index][this.myFileUuid[index]].modified,
            in_projects: recibo.value[index][this.myFileUuid[index]].in_projects,
            in_trash_projects: recibo.value[index][this.myFileUuid[index]].in_trash_projects,
            type: recibo.value[index][this.myFileUuid[index]].type
           });

          }
          for (const uuid of this.myFileUuid) {
            this.thumbnail(uuid);
          }

          this.cargado = true; // pagina cargada
          break;
        }
        case 'file_trash_list': {

          this.myTrashFileUuid = [];
          this.filesTrashList = [];

          for (let index = 0; index < recibo.value.length; index++) {

          let myKeys: any[] = [];
          myKeys = Object.keys(recibo.value[index]);
          this.myTrashFileUuid.push(myKeys[0]); // listado de uuids

          this.filesTrashList.push({ // hacemos el push de los proyectos al listado
            uuid: myKeys[0],
            name: recibo.value[index][this.myTrashFileUuid[index]].name,
            unix_name: recibo.value[index][this.myTrashFileUuid[index]].unix_name,
            created: recibo.value[index][this.myTrashFileUuid[index]].created,
            modified: recibo.value[index][this.myTrashFileUuid[index]].modified,
            in_projects: recibo.value[index][this.myTrashFileUuid[index]].in_projects,
            in_trash_projects: recibo.value[index][this.myTrashFileUuid[index]].in_trash_projects,
            type: recibo.value[index][this.myFileUuid[index]].type
           });

          }
          // console.log(this.filesTrashList);
          break;
        }
        case 'list_update': {
          // cuando la accion la realize yo no mostrar msg -falta
          if (recibo.value === 'file_list') {
            this.updateFileList();
          }
          if (recibo.value === 'file_trash_list') {
              this.updateFileTrashList();
          }
          break;
        }
        case 'file_delete': {
          this.updateFileTrashList();
          break;
        }
        case 'file_restore': {
          this.updateFileList();
          break;
        }
        default: {
           // statements;
           break;
        }
     }
     });
  }
  thumbnail(uuid): void{
    this.wsService.wsBlob.subscribe(msg => {
      if (msg instanceof Blob) {
        console.log(msg);
      }
      // console.log(msg);
    });
    this.wsService.wsBlob.next({action: 'file_load_thumbnail', value: uuid});
    // this.fileService.files_LoadThumbnail(uuid);
    // console.log(uuid);
    
  }
  // selecciones
  selectAll(): void {
    this.fileList.selectAll();
   }
  deselectAll(): void {
    this.fileList.deselectAll();
  }
  selectAllTrash(): void {
    this.fileTrashList.selectAll();
   }
  deselectAllTrash(): void {
    this.fileTrashList.deselectAll();
  }

  // dialogos
 file_ConfirmDialog(idx: number, uuid: string): void {

  const id = idx;
  const uid = uuid;

  const dialogConfig = new MatDialogConfig();
  dialogConfig.disableClose = true;
  dialogConfig.autoFocus = true;
  dialogConfig.height = '200px';
  dialogConfig.width = '300px';

  dialogConfig.data = {
    name: 'File ' + this.filesList[idx].unix_name
};

  const dialogRef = this.dialog.open(ConfirmDialogComponent, dialogConfig);

  dialogRef.afterClosed().subscribe(
      data => {
        if (data === true) {
          this.notify = false;
          this.filesList.splice(id, 1); // borramos del array local
          this.fileService.file_deleteFromServer(uid); // borramos file del sevidor
        }
      });
 }
 fileTrash_ConfirmDialog(idx: number, uuid: string): void {

  const id = idx;
  const uid = uuid;

  const dialogConfig = new MatDialogConfig();
  dialogConfig.disableClose = true;
  dialogConfig.autoFocus = true;
  dialogConfig.height = '200px';
  dialogConfig.width = '300px';

  dialogConfig.data = {
    name: 'File ' + this.filesTrashList[idx].unix_name,
    msg: 'Confirmamos borrarla?'
};

  const dialogRef = this.dialog.open(ConfirmDialogComponent, dialogConfig);

  dialogRef.afterClosed().subscribe(
      data => {
        if (data === true) {
          this.notify = false;
          this.filesTrashList.splice(id, 1); // borramos del array local
          this.fileService.file_trash_deleteFromServer(uid); // borramos file del sevidor
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
    if (tYpe === 'trash') {
      dialogConfig.data = {
        name: 'Está apunto de borrar definitivamente una selección de archivos. ',
        msg: 'Confirmamos borrarlos?'
      };
    } else {
      dialogConfig.data = {
        name: 'Está apunto de borrar una selección de archivos. ',
        msg: 'Confirmamos borrarlos?'
      };
    }
  } else {
    if (tYpe === 'trash') {
      dialogConfig.data = {
        name: 'Está apunto de borrar definitivamente un archivo.',
        msg: 'Confirmamos borrarlo?'
      };
    } else {
      dialogConfig.data = {
        name: 'Está apunto de borrar un archivo.',
        msg: 'Confirmamos borrarlo?'
      };
    }
    // console.log('uno');
  }


  const dialogRef = this.dialog.open(ConfirmDialogComponent, dialogConfig);

  dialogRef.afterClosed().subscribe(
      data => {
        if (data === true) {
          for (const uuid of this.selected) {

            if (tYpe === 'trash') {
              index = this.filesTrashList.findIndex(file => file.uuid === uuid ); // leemos el index de la uuid
              this.filesTrashList.splice(index, 1); // borramos del array local
              this.fileService.file_trash_deleteFromServer(uuid); // borramos del servidor
            } else {
              index = this.filesList.findIndex(file => file.uuid === uuid ); // leemos el index de la uuid
              this.filesList.splice(index, 1); // borramos del array local
              this.fileService.file_deleteFromServer(uuid); // borramos del servidor
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
      name: 'Está apunto de recuperar una selección de archivos.',
      msg: 'Confirmamos recuperarlos?'
    };
  } else {
    // console.log('uno');
    dialogConfig.data = {
      name: 'Está apunto de recuperar un archivo.',
      msg: 'Confirmamos recuperarlo?'
    };
  }


  const dialogRef = this.dialog.open(ConfirmDialogComponent, dialogConfig);

  dialogRef.afterClosed().subscribe(
      data => {
        if (data === true) {
          for (const uuid of this.selected) {
              index = this.filesTrashList.findIndex(file => file.uuid === uuid ); // leemos el index de la uuid
              this.filesTrashList.splice(index, 1); // borramos del array local
              this.fileService.file_restoreFromServer(uuid); // recuperamos del servidor
           }

        }
      });
 }

 // actualizando las listas
 updateFileList(): void {
  if (this.notify) {
    const options = {
      autoClose: true
    };
    this.alertService.success('Lista de archivos actualizada', options);
  }
  this.fileService.files_List();
 }
 updateFileTrashList(): void {
  this.fileService.files_Trash_List();
  if (this.notify) {
    console.log(this.notify);
    const options = {
      autoClose: true
    };
    this.alertService.success('Lista de archivos en papelera actualizada', options);
  }
 }

 // carga de archivos
 cargarArchivos(): void {
    this.uploadService.cargarArchivos( this.archivosComponent );
 }
 limpiarArchivos(): void {
    this.archivosComponent = [];
 }

}
