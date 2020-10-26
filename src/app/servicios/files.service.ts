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
