import { Injectable } from '@angular/core';
import { WebsocketService } from './websocket.service';

@Injectable({
  providedIn: 'root'
})
export class FilesService {

  constructor(private wsService: WebsocketService) { }

  files_List(): void {
    this.wsService.ws.next({action: 'file_list'}); // llamamos a la lista de files
  }
  files_Trash_List(): void {
    this.wsService.ws.next({action: 'file_trash_list'}); // llamamos a la lista de files en la papelera
  }
  // files_LoadThumbnail(uuid): void {
  //   this.wsService.wsBlob.next({action: 'file_load_thumbnail', value: uuid}); // llamamos al thumbnail del archivo
  // }
  file_LoadMeta(uuid): void {
    this.wsService.ws.next({action: 'file_load_meta', value: uuid}); // llamamos al la metadata del archivo
  }

  file_trash_deleteFromServer(uuid: string): void{
    // añadir el aviso de proyecto borrado
    this.wsService.wsEmit({action: 'file_trash_delete', value: uuid});
  }
  file_restoreFromServer(uuid: string): void{
    // añadir el aviso de proyecto borrado
    this.wsService.wsEmit({action: 'file_restore', value: uuid});
  }
  file_deleteFromServer(uuid: string): void{
    // añadir el aviso de proyecto borrado
    this.wsService.wsEmit({action: 'file_delete', value: uuid});
  }

}

export interface Files {
  uuid: string;
  name: string;
  unix_name: string;
  created: string;
  modified: string;
  in_projects?: number;
  in_trash_projects?: number;
}

export interface FileList {
  uuid: string;
  name: string;
  unix_name: string;
  created: string;
  modified: string;
  in_projects: number;
  in_trash_projects: number;
  type: string; // video, audio, image
  }
  // load_meta
export interface FileMeta {
    name: string;
    unix_name: string;
    description: string;
    created: string;
    modified: string;
    duration: string;
    type: string; // video, audio, image
    in_trash: boolean;
    in_projects: In[];
    in_trash_projects: In[];
  }
export interface In {
    uuid: string;
  }
  // {"action" : "file_load_thumbnail", "value" : "file_uuid"}
export interface FileLoadThumbnail { // mensage binario que del thumb
    Blob;
  }
  // websocket.onmessage = function (event) {
  //   if (
  // event.data
  // instanceof Blob){
  //       var objectURL = URL.createObjectURL(
  // event.data
  // );
  //       document.querySelector("#thumbnail").src = objectURL;
