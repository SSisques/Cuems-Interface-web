import { Injectable, Output } from '@angular/core';
import { WebsocketService } from './websocket.service';
import { BehaviorSubject } from 'rxjs';
import { v1 as uuidv1 } from 'uuid'; // importamos el generador v1 de uuid https://www.npmjs.com/package/uuid


@Injectable({
  providedIn: 'root'
})
export class ProyectosService {

  private editProject = new BehaviorSubject<any>({});
  editingProject = this.editProject.asObservable(); // creamos obsevable para compartir contennido

  changeEditing(status: {}): void { // función para compartir datos entre componentes
    this.editProject.next(status);
}



  constructor( private wsService: WebsocketService ) {
  }


  saveProject(value): void { // función llamada desde el navbar
    this.editProject.next(value);
  }

  project_List(): void {
    this.wsService.ws.next({action: 'project_list'}); // llamamos a la lista
  }
  project_Trash_List(): void {
    this.wsService.ws.next({action: 'project_trash_list'}); // llamamos a la lista de files en la papelera
  }
  project_trash_deleteFromServer(uuid: string): void{
    // añadir el aviso de proyecto borrado
    this.wsService.wsEmit({action: 'project_trash_delete', value: uuid});
  }
  project_restoreFromServer(uuid: string): void{
    // añadir el aviso de proyecto borrado
    this.wsService.wsEmit({action: 'project_restore', value: uuid});
  }

saveToServer( NAME: string, UNIX_NAME: string, DESC: string ): void {
  const proyectoSave: CuemsProject = {
    CuemsScript: {
      uuid: null,
      unix_name: UNIX_NAME,
      name: NAME,
      description: DESC,
      created: null,
      modified: null,
      CueList: {
        uuid: uuidv1(),
        id: '0',
        name: 'root',
        description: '',
        enabled: true,
        loaded: false,
        timecode: false,
        offset: '',
        loop: 1,
        prewait: { CTimecode: '00:00:00.000' },
        postwait: { CTimecode: '00:00:00.000' },
        post_go: 'pause',
        target: '',
        UI_properties: null,
        contents: []
        }
    }
};
  this.wsService.wsEmit( {action: 'project_save', value: proyectoSave} );

}
saveProjectToServer(project: CuemsProject): void {
  // añadir el aviso de proyecto guardado
  // console.log(project);
  this.wsService.wsEmit( {action: 'project_save', value: project} );
}

loadFromServer(uuid: string): void { // cargamos el proyecto del servidor
  this.wsService.wsEmit({action: 'project_load', value: uuid});
  // console.log('Cargamos desde el servidor el proyecto uuid', uuid);
}
projectReady(uuid: string): void { // nos ponemos en modo ejecución
  this.wsService.wsEmit({action: 'project_ready', value: uuid});
  // console.log('Cargamos desde el servidor el proyecto uuid', uuid);
}
projectLoad(uuid: string): void { // nos ponemos en modo edit
  this.wsService.wsEmit({action: 'project_load', value: uuid});
  // console.log('Cargamos desde el servidor el proyecto uuid', uuid);
}
duplicateFromServer(uuid: string): void {
  this.wsService.wsEmit({action: 'project_duplicate', value: uuid});
}

deleteFromServer(uuid: string): void{
  // añadir el aviso de proyecto borrado
  this.wsService.wsEmit({action: 'project_delete', value: uuid});
}
forceCloseFromServer(): void {
console.log('enviamos el forzado de cierre');
}

}

export interface ListaProyectos {
  uuid: string;
  name: string;
  unix_name: string;
  date: string;
}
export interface CuemsProject {
  CuemsScript: CuemsScript;
}
export interface CuemsScript {
  uuid?: any;
  unix_name: string;
  name: string;
  description: string;
  created: string; // aplicar la zona horaria
  modified: string; // formato de tiempo ISO YYYY-MM-DDTHH:MM:SS
  CueList: CueList; // el primer cuelist es el script
}
export interface CueList extends CommonProperties {
  uuid: string;
  id: string; // generar un string basado en las anteriores strings que se han podido convertir a números.
  name: string;
  description: string;
  enabled: boolean; // mute de cue, desactivada
  loaded: boolean; // cue cargada y ready
  timecode: boolean;
  offset?: string; // Si timecode es true tiene un offset
  loop: number; // 0 infinito, 1 desactivado o número de loops
  prewait: CTimecode;
  postwait: CTimecode;
  post_go: string; // pause , go, go_at_end
  target?: string; // uuid de la cue a la que apunta si no la define el susuario apunta a la siguiente
  contents: Contents[];
}
export interface Contents {
  AudioCue?: AudioCue;
  VideoCue?: VideoCue;
  DmxCue?: DmxCue;
  Action?: ActionCue; // cue de acciones
  CueList?: CueList; // son grupos
}
export interface AudioCue extends CommonProperties {
  Media: Media;
  master_vol: number; // 0 a 100 que afecta a todas las salidas
  Outputs: Outputs[]; // * salidas virtuales
}
export interface VideoCue extends CommonProperties {
  Media: Media;
  Outputs: Outputs[]; // salidas virtuales
}
export interface Outputs {
  AudioCueOutput?: AudioCueOutput;
  VideoCueOutput?: VideoCueOutput;
}
export interface AudioCueOutput {
  output_name: string;
  output_vol: number;
  channels: Channels[]; // número de canales de la salida virtual
}
export interface Channels {
  channel: Channel;
}
export interface Channel {
  channel_num: number;
  channel_vol: number;
}
export interface VideoCueOutput {
  output_name: string;
  output_geometry: OutputGeometry;
}
export interface OutputGeometry {
  x_scale: number; // Bloquearlo en la ui para poder editarlos unidos o independientes
  y_scale: number;
  corners: Corner;
}
export interface Corner {
  top_left: Coordenates;
  top_right: Coordenates;
  bott_left: Coordenates;
  bott_right: Coordenates;
}
export interface Coordenates {
  x: number; // en el video de 0 a 1
  y: number;
}
export interface DmxCue extends CommonProperties {
  Media: Media;
  fadein_time: number;
  fadeout_time: number;
}
export interface Media {
  file_name: string;
  regions: Regions[];
}
export interface Regions {
 region: Region;
}
export interface Region {
  id: number; // 0 por defecto
  loop: number; // 0 infinito, 1 desactivado o número de loops - implementarlo
  in_time: CTimecode; // tiempo de inicio de cue - leo el metadata y pasa y lo aplico al in out
  out_time: CTimecode; //  tiempo de final de cue formato HH/MM/SS/MMM - máxsimo aplicable a la diracuión de la media
}
export interface ActionCue extends CommonProperties {
  action_type: string; // tipo de accion a realizar
  action_target: string; // uuid de la cue a la que apunta
}
export interface CommonProperties {
  uuid: string;
  id: string; // generar un string basado en las anteriores strings que se han podido convertir a números.
  name: string;
  description: string;
  enabled: boolean; // mute de cue, desactivada
  loaded: boolean; // cue cargada y ready
  timecode: boolean;
  offset?: string; // Si timecode es true tiene un offset
  loop: number; // 0 infinito, 1 desactivado o número de loops
  prewait: CTimecode;
  postwait: CTimecode; // HH/MM/SS/MMM Crear campos separados
  post_go: string; // pause , go, go_at_end
  target?: string; // uuid de la cue a la que apunta si no la define el susuario apunta a la siguiente
  UI_properties: UiProperties; // propiedades de la ui
}
export interface UiProperties {
  warning: number; // 0 por defecto - 1 activado
  timeline_position?: Coordenates;
}
export interface TimelinePosition {
  x: number;
  y: number;
 }
export interface CTimecode {
  CTimecode: string;
 }


 // export interface DmxScene {
//   uuid: string; // *
//   name: string; // *
//   description: string; // *
//   dmx_universes: DmxUniverse[];
// }
// export interface DmxUniverse {
//   id: number;
//   dmx_channels: DmxChannel[];
// }
// export interface DmxChannel {
//   id: number; // número de canal
//   value: number; // 0 a 255 intensidad
// }


