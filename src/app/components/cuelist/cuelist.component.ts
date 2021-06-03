import { AfterViewInit, Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ActivatedRoute } from '@angular/router'; // ActivatedRoute lo importamos para traernos la id
import { OscService } from '../../servicios/osc.service'; // importamos el servicio osc
import { WebsocketService } from '../../servicios/websocket.service';
import { ProyectosService, CuemsProject, CuemsScript, CueList, AudioCue, Contents } from '../../servicios/proyectos.service';
import { FilesService, FileList} from '../../servicios/files.service';
import { NodesService, NodeList } from '../../servicios/nodes.service'; // importamos el servicio osc
import { v1 as uuidv1 } from 'uuid'; // importamos el generador v1 de uuid https://www.npmjs.com/package/uuid
import { FormGroup, FormBuilder } from '@angular/forms';
import { AlertService } from '../../_alert';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { ShortcutInput, ShortcutEventOutput } from 'ng-keyboard-shortcuts'; // hotkeys
import { EditCueComponent } from '../edit-cue/edit-cue.component';
import { ConfirmDialogComponent } from '../confirm-dialog/confirm-dialog.component';
import { PreferencesComponent } from '../preferences/preferences.component';
import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
// import * as Cookies from 'js-cookie'; // https://github.com/js-cookie/js-cookie

import { webSocket } from 'rxjs/webSocket';


@Component({
  selector: 'app-cuelist',
  templateUrl: './cuelist.component.html'

})

export class CueListComponent implements OnInit, AfterViewInit {

 constructor( private router: Router,
              private activatedRoute: ActivatedRoute,
              private oscService: OscService,
              private wsService: WebsocketService,
              private proService: ProyectosService,
              private fileService: FilesService,
              private nodesService: NodesService,
              private fb: FormBuilder,
              public alertService: AlertService,
              private dialog: MatDialog
                ) {
                  this.activatedRoute.params.subscribe( params => { // nos subscribimos a la recepción por url
                    // if (this.edit.uuid) {
                    //   console.log('la uuid existe');
                    //   console.log(this.edit.uuid);
                    // }
                    this.edit.uuid = params.uuid;
                    this.proService.loadFromServer( params.uuid ); // llamamos al servidor con la uuid
                    this.initMode(params.mode); // recogemos el modo de la url
                  });
                  this.fileService.files_List(); // llamamos a la listado multimedia
                  this.recibimosEdit(); // recivimos datos del servicio proyectos comunicación con navbar
                  this.recibimosWs(); // recibimos la respuesta del servidor
                }
    FULL_PATH: any[] = [];
    nextCue;
    timecode;
   // Conexion websocket deserialized

  wsRealtime = webSocket({
    url: 'wss://dev.stagelab.net/realtime',
    deserializer: (data: any) => this.in_message(data),
    serializer: (msg: any) => msg,
    binaryType: 'arraybuffer'
    });

    in_message(mess: any) {

      if (mess.data instanceof ArrayBuffer) {
        let dataView = new DataView(mess.data);
        const msg = new OSC.Message();
        msg.unpack(dataView);

          // console.log(msg);
        switch (msg.address) {
          case '/engine/status/currentcue':
            // console.log('current cue');
            // console.log(msg.args[0]);
          break;
          case '/engine/status/nextcue':
            console.log(msg.args[0]);
            for (let index = 0; index < this.cueMs.CueList.contents.length; index++) {
              const element = this.cueMs.CueList.contents[index];
              const uuid = element[this.tipoCue[index]].uuid;
              // console.log(index);
              if (uuid === msg.args[0]) {
                this.idCueSelected = index; // asignamos la nueva posición del cursor en el cuelist
                // console.log(msg.args[0]);
              }
            }
            // si recibo blanco hemos llegado al final
            if (msg.args[0] === '') {
              this.unselectCue();
            }

          break;
          case '/engine/status/timecode':
            this.timecode = parseInt(msg.args[0], 10);
            this.timecode = this.timecode / 1000;
            // console.log(this.timecode);
          break;

          default:
            break;
        }

      } else {
        let json = JSON.parse(mess.data);
        this.FULL_PATH = json;
        // console.log(this.FULL_PATH.CONTENTS.engine.CONTENTS);
        // this.nextCue = this.FULL_PATH.CONTENTS.engine.CONTENTS.status.CONTENTS.nextcue.VALUE; // actualizamos la next cue desde el full_path cuando lo pedimos
      }
    }

    realTime(){

      this.wsRealtime.subscribe( // nos conectamos al realtime
        data => {
        });
      // console.log('realtime');


      // this.wsRealtime.next('/'); // emitimos el mensage por el ws

      }

  // objeto que compartimos con el navbar
  edit = {
    editing: true, // true cuando lo hallan editado
    // edited: false,
    uuid: '',
    name: '',
    mode: true, // true que será show y false edit
    estiloGuardar: '',
    guardar: false,
    preferences: false
  };


  shortcuts: ShortcutInput[] = []; // teclas hotkeys
  myFileUuid: any[] = [];
  mediaList: FileList [] = [];

  // mode: string; // Variable modo edit/show
  // editing: boolean; // valor para esconder o mostrar contenido al cambiar el modo

readyGo = false;
 claseGo = 'btn h-100 btn-outline-primary btn-block'; // clase del botton go
 color_despligue = 'primary'; // clase del botón despliegue
despligue_state = false;
 cueSelected = false;
 idCueSelected: number = undefined;
 idCueFordelete: number = undefined;
 idEditingCue: number = undefined;

//  private notify: boolean; // mesanajes recibidos del servidor

 public cargado = false; // variable para saber si hemos recibido los datos del servidor

 private project: CuemsProject; // el proyecto entero, lo usamos para grabar de nuevo en el servidor

 public cueMs: CuemsScript = { // extraemos cuemsscript del proyecto para usarlo
  uuid: '',
  unix_name: '',
  name: '',
  description: '',
  created: '', // aplicar la zona horaria
  modified: '',
  CueList: {
      uuid: '',
      id: '',
      name: '',
      description: '',
      enabled: true,
      loaded: false, // * cue cargada y ready
      timecode: false, // *
      offset: '', // * Si timecode es true tiene un offset
      loop: 0, // -1 infinito, 0 desactivado o número de loops
      prewait: { CTimecode: '00:00:00.000' },
      postwait: { CTimecode: '00:00:00.000' },
      post_go: '', // pause , go, go_at_end
      target: '', // uuid de la cue a la que apunta si no la define el susuario apunta a la siguiente
      UI_properties: {
        timeline_position: {
          x: 0,
          y: 0
        },
        warning: 0
      },
    contents: []
    }
 }; // objeto del contenido del proyecto

 public cueMsCookie: CuemsScript = { // extraemos cuemsscript del proyecto para usarlo
  uuid: '',
  unix_name: '',
  name: '',
  description: '',
  created: '', // aplicar la zona horaria
  modified: '',
  CueList: {
      uuid: '',
      id: '',
      name: '',
      description: '',
      enabled: true,
      loaded: false, // * cue cargada y ready
      timecode: false, // *
      offset: '', // * Si timecode es true tiene un offset
      loop: 0, // -1 infinito, 0 desactivado o número de loops
      prewait: { CTimecode: '00:00:00.000' },
      postwait: { CTimecode: '00:00:00.000' },
      post_go: '', // pause , go, go_at_end
      target: '', // uuid de la cue a la que apunta si no la define el susuario apunta a la siguiente
      UI_properties: {
        timeline_position: {
          x: 0,
          y: 0
        },
        warning: 0
      },
    contents: []
    }
 };

 public nodeList: NodeList = { // Listado de nodos y salidas

  number_of_nodes: 0,
	default_audio_input: '',
	default_audio_output: '',
	default_video_input: '',
	default_video_output: '',
	default_dmx_input: '',
	default_dmx_output: '',
	nodes: []
 };

 audioOutputList: any[] = [];
 videoOutputList: any[] = [];

 contents: Contents[] = [];

 tipoCue: string[] = []; // el tipo de las cues por id

 forma: FormGroup; // creamos formulario para la parte de cuelist


 ngOnInit(): void {
  this.operatingSytem(); // detectamos el OS del usuario
 }

 ngAfterViewInit(): void { // esta funcion se ejecuta una vez cargada la pag
  this.recibimosEdit(); // recivimos datos del servicio proyectos comunicación con navbar
  // this.updateNavbar(); // enviamos al inicio información al navBar
 }


 dragEnd(event, i): void { // prueba para timeline
  // console.log(event.distance.x, i);
  // calcualr la posición absoluta - nos envia la relativa
  let x: number;
  const eVent: number = Math.sign(event.distance.x);
  if (eVent === 1 ) {
    this.contents[i][this.tipoCue[i]].UI_properties.timeline_position.x += event.distance.x;
  } else if (eVent === -1){
    x = - event.distance.x;
    this.contents[i][this.tipoCue[i]].UI_properties.timeline_position.x -= x;
  }
  this.proyectoEditado(); // marcamos como proyecto editado
  // console.log(this.contents[i][this.tipoCue[i]].common_properties.ui_properties.timeline_position.x);

}
// dragPosition = {x: 0, y: 0};

// changePosition() {
//   this.dragPosition = {x: this.dragPosition.x + 50, y: this.dragPosition.y + 50};
// }

 updateNavbar(): void { // así enviamos datos al navBar por medio del servicio

   setTimeout(() => { this.proService.changeEditing(this.edit); }, 1000); // ejemplo de settimeout
}

 recibimosEdit(): void {

  this.proService.editingProject.subscribe( // escuchamos el obsevable editinsProject
    msg => {
      this.edit = msg;
      if (this.edit.guardar) { // sin guardar es true
        this.saveProject();
        // this.edit.editing = false;
        // console.log('sin guardar');
      } else if (this.edit.preferences) {
        this.preferencesDialog();
      }
      // console.log(this.edit);
    });

 }

 recibimosWs(): void {
    this.wsService.ws.subscribe(msg => { // nos suscribimos a la conexión
      const recibo: any = msg; // le añadimos tipado a la variable ;) xapucilla

      switch (recibo.type) {
        case 'project': {
          // console.log(this.edit);
          const msScript = recibo.value; // parseamos la entada
          this.project = msScript;
          this.cueMs = this.project.CuemsScript; // asignamos a un objeto el contenido de CuemsScript
          // this.updateCookie(this.cueMs);
          this.edit.name = this.cueMs.name; // enviamos el nombre hacia el navBar
          this.cargado = true; // pagina cargada
          if (this.cueMs.CueList.contents !== null) { // si tiene cues el proyecto
          this.contents = this.cueMs.CueList.contents;
          this.tipoCues();
          }
          break;
       }
       case 'file_list': {
        this.myFileUuid = []; // limpiamos arrays
        this.mediaList = [];
        for (let index = 0; index < recibo.value.length; index++) {
          let myKeys: any;
          myKeys = Object.keys(recibo.value[index]);
          this.myFileUuid.push(myKeys[0]); // listado de uuids

          this.mediaList.push({ // hacemos el push de los proyectos al listado
            uuid             : myKeys[0],
            name             : recibo.value[index][this.myFileUuid[index]].name,
            unix_name        : recibo.value[index][this.myFileUuid[index]].unix_name,
            created          : recibo.value[index][this.myFileUuid[index]].created,
            modified         : recibo.value[index][this.myFileUuid[index]].modificated,
            in_projects      : recibo.value[index][this.myFileUuid[index]].in_projects,
            in_trash_projects: recibo.value[index][this.myFileUuid[index]].in_thras_projects,
            type             : recibo.value[index][this.myFileUuid[index]].type
           });
      }
        break;
    }
        case 'initial_mappings': {
          // console.log(recibo.value);
          const nodeList = recibo.value; // parseamos la entada

          for (let index = 0; index < recibo.value.nodes.length; index++) {

            this.audioOutputList.push({
              // uuid: recibo.value.nodes[index].uuid,
              output: recibo.value.default_audio_output,
              name: 'Nodo ' + index + ' salida por defecto'  });

            this.videoOutputList.push({
              // uuid: recibo.value.nodes[index].uuid,
              output: recibo.value.default_video_output,
              name: 'Nodo ' + index + ' salida por defecto'});

            for (let index2 = 0; index2 < recibo.value.nodes[index].audio.outputs.length; index2++) {

              this.audioOutputList.push({ // hacemos el push de los proyectos al listado
              //uuid: recibo.value.nodes[index].uuid,
              output   : recibo.value.nodes[index].uuid + '_' + recibo.value.nodes[index].audio.outputs[index2].name,
              name: 'Nodo ' + index + ' salida ' + index2
              });

            }
            for (let index2 = 0; index2 < recibo.value.nodes[index].video.outputs.length; index2++) {

              this.videoOutputList.push({ // hacemos el push de los proyectos al listado
              //uuid: recibo.value.nodes[index].uuid,
              output   : recibo.value.nodes[index].uuid + '_' + recibo.value.nodes[index].video.outputs[index2].name,
              name: 'Nodo ' + index + ' salida ' + index2
              });

            }
        }

          // console.log(this.audioOutputList);
          // console.log(this.videoOutputList);

      // }
          break;
     }
        case 'project_save': {

          const options = {
            autoClose: true
          };
          this.alertService.success('Proyecto guardado correctamente ', options);
         // alert( recibo.value ); // quizás cambiarlo por un mensaje en el interface
          // this.notify = false; // reseteamos la variable
          break;
        }
        case 'project_update': {
          // console.log(recibo.value);
          const options = {
            autoClose: false
          };
          this.alertService.success('Proyecto actualizado ', options);
          this.proService.loadFromServer( recibo.value );
          break;
       }
       case 'project_ready': {
        // console.log(recibo.value);
        if (recibo.value === this.cueMs.uuid){
          this.proService.changeEditing(this.edit); // enlace con navbar posicionamiento en modo edit
          this.edit.mode = true; // conmutamos al modo en modo edit
          this.realTime(); // ya podemos conectarnos al realtime
          // this.recibimosRealtime();
          this.readyGo = true; // activar la posibilidad de hacer go cuando reciba ok
          this.idCueSelected = 0; // seleccionar la cue 0 resetall
          this.claseGo = 'btn h-100 btn-primary btn-block';
        }
        const options = {
          autoClose: true
        };
        this.alertService.success('Engine Activo ', options);
        break;
     }
     case 'project_deploy': {
      // console.log(recibo.value);
      const options = {
        autoClose: false
      };
      if (recibo.vale === this.cueMs.uuid) {
        this.alertService.success('Despliqgue realizado ', options);
        this.despligue_state = true;
      }

      break;
   }
  //    case 'project_load': {

  //     // console.log(recibo.value);
  //     // if (recibo.value.uuid === this.cueMs.uuid){
  //       // this.proService.changeEditing(this.edit); // enlace con navbar posicionamiento en modo edit
  //       // this.edit.mode = !this.edit.mode; // conmutamos al modo en modo edit
  //       // this.readyGo = false;
  //       // this.recibimosRealtime();
  //     // }
  //     const options = {
  //       autoClose: false
  //     };
  //     this.alertService.success('Engine Activo ', options);
  //     break;
  //  }
       case 'error': {
        const options = {
          autoClose: false
        };
        this.alertService.error('Error: ' + recibo.value, options);
        break;
     }
        default: {
           // statements;
           // console.log(recibo.type);
           break;
        }
     }

     });
 }

//  updateCookie(obj): void{
//   Cookies.set('cueMsCookie', obj);
//   this.cueMsCookie = JSON.parse(Cookies.get('cueMsCookie'));
//   console.log(this.cueMsCookie.CueList);
//  }

 tipoCues(): void{
  this.tipoCue = [];
     // tslint:disable-next-line: prefer-for-of
  for (let index = 0; index < this.contents.length; index++) {
      const tipo = Object.keys(this.contents[index])[0];
      this.tipoCue.push(tipo);
      // console.log(tipo);
  }

 //  console.log(this.tipoCue);
}

// detectamos OS
 operatingSytem(): void {
    // let OSName = 'Unknown OS';
    // if (navigator.appVersion.indexOf('Win') !== -1) { OSName = 'Windows'; }
    if (navigator.appVersion.indexOf('Mac') !== -1) {
     this.ngAfterViewMac();
    } else {
      this.ngAfterViewResto();
    }
    // if (navigator.appVersion.indexOf('X11') !== -1) { OSName  = 'UNIX'; }
    // if (navigator.appVersion.indexOf('Linux') !== -1) { OSName = 'Linux'; }

 }

// shorcuts
// si es mac
 ngAfterViewMac(): void {
    this.shortcuts.push(
      {
        key: 'cmd + j',
        label: 'Atajos',
        description: 'Preferencias del proyecto',
        command: (e) => this.preferencesDialog(),
        preventDefault: true
      },
      {
        key: 'cmd + s',
        label: 'Atajos',
        description: 'Guardar proyecto',
        command: (e) => this.saveProject(),
        preventDefault: true
      },
      {
        key: 'cmd + backspace',
        label: 'Atajos',
        description: 'Borrar cue seleccionada',
        command: (e) => this.delCueSelect(),
        preventDefault: true
      },
      {
        key: 'space',
        label: 'Atajos',
        description: 'Go',
        command: (e) => this.go(),
        preventDefault: true
      },
      {
        key: 'q',
        label: 'Atajos',
        description: 'Editar cue selecionada',
        command: (e) => this.editCueDialog()
        ,
        preventDefault: true
      },
      {
        key: 'up',
        label: 'Atajos',
        description: 'Navegar por la cues',
        command: (e) => this.cueSelectedMove('menos'),
        preventDefault: true
      },
      {
        key: 'left',
        label: 'Atajos',
        description: 'Navegar por la cues',
        command: (e) => this.cueSelectedMove('menos'),
        preventDefault: true
      },
      {
        key: 'down',
        label: 'Atajos',
        description: 'Navegar por la cues',
        command: (e) => this.cueSelectedMove('mas'),
        preventDefault: true
      },
      {
        key: 'c',
        label: 'Atajos',
        description: 'Conmutar continue',
        command: (e) => this.continueSwich()
        ,
        preventDefault: true
      },
      {
        key: ['up up down down left right left right b a enter'],
        label: 'Sequences',
        description: 'Premio!',
        command: (output: ShortcutEventOutput) =>
          console.log('Yeahh!!!', output)
      }
    );
 }
// el resto
 ngAfterViewResto(): void {
    this.shortcuts.push(
      {
        key: 'ctrl + j',
        label: 'Atajos',
        description: 'Preferencias del proyecto',
        command: (e) => this.preferencesDialog(),
        preventDefault: true
      },
      {
        key: 'ctrl + s',
        label: 'Atajos',
        description: 'Guardar proyecto',
        command: (e) => this.saveProject(),
        preventDefault: true
      },
      {
        key: 'ctrl + backspace',
        label: 'Atajos',
        description: 'Borrar cue seleccionada',
        command: (e) => this.delCueSelect(),
        preventDefault: true
      },
      {
        key: 'space',
        label: 'Atajos',
        description: 'Go',
        command: (e) => this.go(),
        preventDefault: true
      },
      {
        key: 'q',
        label: 'Atajos',
        description: 'Editar cue selecionada',
        command: (e) => this.editCueDialog()
        ,
        preventDefault: true
      },
      {
        key: 'up',
        label: 'Atajos',
        description: 'Navegar por la cues',
        command: (e) => this.cueSelectedMove('menos'),
        preventDefault: true
      },
      {
        key: 'left',
        label: 'Atajos',
        description: 'Navegar por la cues',
        command: (e) => this.cueSelectedMove('menos'),
        preventDefault: true
      },
      {
        key: 'down',
        label: 'Atajos',
        description: 'Navegar por la cues',
        command: (e) => this.cueSelectedMove('mas'),
        preventDefault: true
      },
      {
        key: 'c',
        label: 'Atajos',
        description: 'Conmutar continue',
        command: (e) => this.continueSwich()
        ,
        preventDefault: true
      },
      {
        key: ['up up down down left right left right b a enter'],
        label: 'Sequences',
        description: 'Premio!',
        command: (output: ShortcutEventOutput) =>
          console.log('Yeahh!!!', output)
      }
    );
}

// drop
drop(event: CdkDragDrop<string[]>): void {
  moveItemInArray(this.contents, event.previousIndex, event.currentIndex);
  this.tipoCues(); // actualizamos el listado de tipos de cues
  this.proyectoEditado(); // marcamos como proyecto editado
}

saveProject(): void{
  // this.notify = true;
  this.cueMs.CueList.contents = this.contents;
  this.proService.saveProjectToServer(this.project); // lo añadimos en el servidor

  this.edit.estiloGuardar = ''; // reseteamos estilo botón guardar
  this.edit.guardar = false; // reseteamos el valor que compartimos con navbar
  this.edit.estiloGuardar = ''; // reseteamos el estilo que compartimos con navbar
}
preferences(): void {
  this.edit.preferences = true;
  this.proService.changeEditing(this.edit);
}
duration(cue): string{
  if (this.contents[cue][this.tipoCue[cue]].Media !== null) { // si Media no es null

    const End = this.toMillis(this.contents[cue][this.tipoCue[cue]].Media.regions[0]['region'].out_time.CTimecode);
    const In = this.toMillis(this.contents[cue][this.tipoCue[cue]].Media.regions[0]['region'].in_time.CTimecode);

    const resta = End - In;

    // console.log(resta);

    return this.toTime(resta);

  } else {
    return '00:00:00.000';
  }
}
 addCue(type: string): void{

  let Warning = 0;
  const idCue = this.idCueSelected;
  let Media;

  const dialogConfig = new MatDialogConfig();
  dialogConfig.disableClose = true;
  dialogConfig.autoFocus = true;
  dialogConfig.height = 'auto';
  dialogConfig.width = '800px';

  dialogConfig.data = {
      loop: 1,
      newCue: true,
      typeCue: type,
      mediaContent: true,
      mediaList: this.mediaList,
      audioOutputList: this.audioOutputList,
      videoOutputList: this.videoOutputList
   };

  const dialogRef = this.dialog.open(EditCueComponent, dialogConfig);

  dialogRef.afterClosed().subscribe(
    data => {
      if (data === 'close') {
        // console.log('close sin guardar');
        return;
      } else {

        this.color_despligue = 'warn'; // resaltamos alerta de despligue

        const newName = data.name;
        const newDescription = data.description;
        const newPrewait = data.prewait;
        const newPostwait = data.postwait;
        const newLoop = data.loop;
        const newPostgo = data.post_go;
        const newMediaName = data.media;
        const newInTime = data.in_time;
        const newOutTime = data.out_time;
        const newOutputName = data.output_name;


        if (newMediaName !== null) {
          Media = {
            file_name: newMediaName,
            regions: [{
              region: {
              id: 0,
              loop: newLoop, // 0 infinito, 1 desactivado o número de loops - implementarlo
              in_time: { CTimecode: newInTime }, // tiempo de inicio de cue - leo el metadata y pasa y lo aplico al in out
              out_time: { CTimecode: newOutTime }
            }
          }]
          };
        } else {
          Warning = 1;
          Media = null;
        }

        // comprobar duplicidad de uuids
        const checkedUuid = uuidv1();
        let uuidDuplicada = false;
        let id;
        for (let index = 0; index < this.contents.length; index++) {
        const actualUuid = this.contents[index][this.tipoCue[index]].uuid;
        // if ( actualUuid === checkedUuid || actualUuid === this.cueMs.cuelist.common_properties.uuid) {
        if ( actualUuid === checkedUuid ) {
            uuidDuplicada = true;
        }
        // console.log(actualUuid);
        }
        if ( uuidDuplicada ) {
        console.log('error uuids duplicadas');
        const options = {
          autoClose: true
        };
        this.alertService.error('Error al crear la cue. uuids duplicadas ', options);
        } else {

        const array = this.contents.length;
        let newx: number;
        if (array === 0) {
          newx = 0;
        } else {
        // tslint:disable-next-line: max-line-length
        const xactual = this.contents[array - 1][this.tipoCue[array - 1]].UI_properties.timeline_position.x - 50; // margen css
        newx = xactual - -25; // otro marges css
        // console.log(newx);
        }

        let newCue: Contents;

        switch (type) {
        case 'AudioCue':
        newCue = {
          AudioCue: {
              uuid: checkedUuid,
              id: '',
              name: newName,
              description: newDescription,
              enabled: true,
              loaded: false, // * cue cargada y ready
              timecode: false, // *
              offset: '', // * Si timecode es true tiene un offset
              loop: newLoop, // 0 infinito, 1 desactivado o número de loops
              prewait: { CTimecode: newPrewait },
              postwait: { CTimecode: newPostwait },
              post_go: newPostgo, // pause , go, go_at_end
              target: '', // uuid de la cue a la que apunta si no la define el susuario apunta a la siguiente
              UI_properties: {
                timeline_position: {
                  x: newx,
                  y: 0
                },
                warning: Warning
              },
              Media,
            master_vol: 80, // 0 a 100 que afecta a todas las salidas
            Outputs: [
              { AudioCueOutput: {
                output_name: newOutputName,
                output_vol: 80,
                channels: [{
                  channel: {
                    channel_num: 0,
                    channel_vol: 80
                  }
                }],
              }
            }
            ]
          }
        };

        break;
        case 'VideoCue':
        newCue = {
          VideoCue: {
              uuid: checkedUuid,
              id: '',
              name: newName,
              description: '',
              enabled: true,
              loaded: false, // * cue cargada y ready
              timecode: false, // *
              offset: '', // * Si timecode es true tiene un offset
              loop: newLoop,
              prewait: { CTimecode: newPrewait },
              postwait: { CTimecode: newPostwait },
              post_go: newPostgo, // pause , go, go_at_end
              target: '', // uuid de la cue a la que apunta si no la define el susuario apunta a la siguiente
              UI_properties: {
                timeline_position: {
                  x: newx,
                  y: 0
                },
                warning: Warning
              },
              Media,
            Outputs: [
              { VideoCueOutput: {
                output_name: newOutputName,
                output_geometry: {
                  x_scale: 0, // * Bloquearlo en la ui para poder editarlos unidos o independientes
                  y_scale: 0, // *
                  corners: {
                    top_left: {
                      x: 0,
                      y: 0
                    },
                    top_right: {
                      x: 0,
                      y: 0
                    },
                    bott_left: {
                      x: 0,
                      y: 0
                    },
                    bott_right: {
                      x: 0,
                      y: 0
                    }
                  }
                }
              }
              }
            ]
          }
        };
        break;
        case 'DmxCue':
        newCue = {
          DmxCue: {
              uuid: checkedUuid,
              id: '', // generar un string basado en las anteriores strings que se han podido convertir a números.
              name: 'New Dmx Cue',
              description: '',
              enabled: true,
              loaded: false,
              timecode: false,
              offset: '',
              loop: 1,
              prewait: null,
              postwait: null,
              post_go: 'pause', // pause , go, go_at_end
              target: '', // uuid de la cue a la que apunta si no la define el susuario apunta a la siguiente
              UI_properties: {
                timeline_position: {
                  x: newx,
                  y: 0
                },
                warning: 0
              },
              Media: null,
            // Media: {
            //   file_name: '',
            //   regions: [{
            //     region: {
            //     id: 0,
            //     loop: 1, // 0 infinito, 1 desactivado o número de loops - implementarlo
            //     in: 0, // tiempo de inicio de cue - leo el metadata y pasa y lo aplico al in out
            //     out: 100
            //   }
            // }]
            // },
            fadein_time: 5,
            fadeout_time: 5
          }
        };
        break;
        case 'action':
        newCue = {
          Action: {
              uuid: checkedUuid,
              id: '',
              name: 'New Action Cue',
              description: '',
              enabled: true,
              loaded: false,
              timecode: false,
              offset: '',
              loop: 1,
              prewait: null,
              postwait: null,
              post_go: 'pause', // pause , go, go_at_end
              target: '', // uuid de la cue a la que apunta si no la define el susuario apunta a la siguiente
              UI_properties: {
                timeline_position: {
                  x: newx,
                  y: 0
                },
                warning: 0
              },
            action_type: '', // tipo de accion a realizar
            action_target: '' // uuid de la cue a la que apunta
          }
        };
        break;
        case 'cuelist':
        newCue = {
          CueList: {
              uuid: checkedUuid,
              id: '',
              name: 'New Group Cue',
              description: '',
              enabled: true,
              loaded: false,
              timecode: false,
              offset: '',
              loop: 1,
              prewait: null,
              postwait: null,
              post_go: 'pause', // pause , go, go_at_end
              target: '', // uuid de la cue a la que apunta si no la define el susuario apunta a la siguiente
              UI_properties: {
                timeline_position: {
                  x: newx,
                  y: 0
                },
                warning: 0
              },
            contents: []
          }
        };
        break;
        default:
          break;
        }
// console.log(newCue);


        if (idCue !== undefined) {
          id = idCue + 1;
          this.contents.splice(id, 0, newCue); // agregamos cue después de la cue seleccionada
          this.tipoCues(); // actualizamos el listado de tipos de cues
          this.proyectoEditado();
        } else {
          // console.log(this.contents);
          this.contents.push(newCue);
          // id = this.contents.length - 1;
          this.proyectoEditado();
          // console.log(Object.keys(this.contents[0])[0]);
          this.tipoCues(); // actualizamos el listado de tipos de cues
          return;
        }

  }



          // const fileAsigned = this.mediaList.find( file => file.unix_name === data.media );
          // console.log(fileAsigned.uuid);
          // this.fileService.file_LoadMeta(fileAsigned.uuid); // llamamos la metadata del file

          // commonProperties.Media = {
          //     file_name: data.media,
          //     regions: [{
          //       region: {
          //       id: 0,
          //       loop: 1, // 0 infinito, 1 desactivado o número de loops - implementarlo
          //       in: 0, // tiempo de inicio de cue - leo el metadata y pasa y lo aplico al in out
          //       out: 10
          //     }
          //   }]
          //   };
          // console.log(this.contents);

          // Media.file_name = data.media;

          // this.proyectoEditado();
      //  console.log('la media que llega al cuelist' + data.media);
        // console.log(this.contents);
      }

    });



 }

 delCueSelect(): void{ // borrado con teclado comando borrar
    if (this.idCueSelected >= 0) { // si tenemos una cue seleccionada
    this.contents.splice(this.idCueSelected, 1); // borramos la cue del array cueList
    // this.sortableComponent.writeValue(this.cueList); // la borramos del drop
    this.tipoCues(); // actualizamos el listado de tipos de cues
    this.proyectoEditado();
    this.idCueSelected = undefined; // reseteamos la id seleccionada
    }
 }

// Osc

 Leo(): void{ return this.oscService.recivoMsg(); }

// Ejecución

 go(): void{ // cuando hacemos go

  if (this.edit.mode === true) { // si estamos en modo show
    // this.oscService.envioGo();
console.log('go'); // añadir el runig cue aquí
const messageGo = new OSC.Message('/engine/command/go');
const binaryGo = messageGo.pack();
this.wsRealtime.next(binaryGo);
// console.log(this.cueMs.CueList.contents);

  } else {
    this.claseGo = 'btn h-100 btn-danger btn-block'; // Go en color rojo
    setTimeout(() => { this.claseGo = 'btn h-100 btn-outline-danger btn-block'; }, 500);
  }
 }
 resetGo(): void{ // no implementada por ahora
    console.log('reset');
    this.idCueSelected = 0;
    this.claseGo = 'btn h-100 btn-primary btn-block'; // mostramos la class de go como cargada
 }
 stop(){
  // this.oscService.stop();
  console.log('stop');
  const messageStop = new OSC.Message('/engine/command/stop');
  const binaryStop = messageStop.pack();
  this.wsRealtime.next(binaryStop);
 }
 resetAll(){
  // this.oscService.stop();
  console.log('resetAll');
  const messageReset = new OSC.Message('/engine/command/resetall');
  const binaryReset = messageReset.pack();
  this.wsRealtime.next(binaryReset);
 }
 despliegue(){
   if (this.despligue_state) {
    console.log('despliegue en teario realizado, volvemos a enviar la orden');
    this.wsService.wsEmit({action: 'project_deploy', value: this.cueMs.uuid});

   } else {
    console.log('despliegue');
    this.wsService.wsEmit({action: 'project_deploy', value: this.cueMs.uuid});
   }


 }
 hw_discovery(){
  console.log('forzamos busqueda de nodos');
  this.wsService.wsEmit({action: 'hw_discovery'});

 }

 selectCue( id: number ): void{ // cuando seleccionamos una cue
  if (this.edit.mode === true) { // si estamos en modo show

    this.idCueSelected = id; // asignamos la id de la cue a actualizar para usarla en el submit
    this.claseGo = 'btn h-100 btn-primary btn-block'; // mostramos la class de go como cargada

  } else {

    this.idCueSelected = id; // asignamos la id de la cue a actualizar para usarla en el submit
    // this.claseGo = 'btn h-100 btn-primary btn-block'; // mostramos la class de go como cargada

  }


 }
 cueSelectedMove(operacion: string): void { // seleccion con las flechas del treclado
  if ( this.idCueSelected >= this.contents.length ) {
    if ( operacion === 'menos'){
      --this.idCueSelected;
      // console.log('menos ' + this.idCueSelected);
    }
  } else if ( this.idCueSelected <= -1 ) {
    if ( operacion === 'mas' ) {
      ++this.idCueSelected;
      // console.log('mas ' + this.idCueSelected);
    }
  } else {
    if ( operacion === 'mas' ) {
      ++this.idCueSelected;
      // console.log('mas ' + this.idCueSelected);
    }
    if ( operacion === 'menos'){
      --this.idCueSelected;
      // console.log('menos ' + this.idCueSelected);
    }
  }

 }
 unselectCue(): void{
    this.claseGo = 'btn h-100 btn-outline-primary btn-block'; // volvemos la class al estado normal
    this.cueSelected = false; // reseteamos el go
    this.idCueSelected = undefined; // reseteamos la id seleccionada
 }

 // continue

 continueSwich(): void{ // conmutar el continue de las cues
    if (this.idCueSelected !== undefined) { // si tenemos una cue seleccionada

      const post_go = this.contents[this.idCueSelected][this.tipoCue[this.idCueSelected]].post_go;

      if (post_go === 'pause') {
        this.contents[this.idCueSelected][this.tipoCue[this.idCueSelected]].post_go = 'go';
        return;
      } else if (post_go === 'go') {
        this.contents[this.idCueSelected][this.tipoCue[this.idCueSelected]].post_go = 'go_at_end';
        return;
      } else if (post_go === 'go_at_end') {
        this.contents[this.idCueSelected][this.tipoCue[this.idCueSelected]].post_go = 'pause';
        return;
      }

    }
 }
 pause(idx): void {
  if (this.idCueSelected !== undefined) {
    this.contents[idx][this.tipoCue[idx]].post_go = 'pause';
  }
 }
 auto_go(idx): void {
  if (this.idCueSelected !== undefined) {
    // console.log(idx + 1);

    this.contents[idx][this.tipoCue[idx]].post_go = 'go';
    // this.cueList[index + 1].position.x = this.cueList[index].position.x;
    // this.cueList[index + 1].position.y = 40;

    // console.log(this.cueList[index].position);
    // console.log(this.cueList[index + 1].position);

    // añadir en el timeline la sosición de la siguiente
  }
 }
 post_go(idx): void {
  if (this.idCueSelected !== undefined) {
    this.contents[idx][this.tipoCue[idx]].post_go = 'go_at_end';
  }
 }

// modes

initMode(value): void{
  // console.log('imprimo edit');
  if (value === 'edit') {
    this.edit.mode = false;
    this.proService.changeEditing(this.edit);
    this.claseGo = 'btn h-100 btn-outline-danger btn-block';
  } else if (value === 'show') {
    this.proService.projectReady(this.edit.uuid);
  }
}
 Mode(): void{
  if (this.edit.mode) {
    this.proService.projectLoad(this.cueMs.uuid);
    // console.log('edit');
    // this.wsRealtime.unsubscribe(); // desuscribimos del realtime
    this.proService.changeEditing(this.edit);
    this.edit.mode = !this.edit.mode;
    this.readyGo = false;
    this.claseGo = 'btn h-100 btn-outline-danger btn-block';
    // console.log(this.edit.mode);

  } else {
    this.proService.projectReady(this.cueMs.uuid);
  }

 }
 loadTmp(): void{
   this.oscService.envioLoad();
 }

// Dialog
 confirmDialog(idx: number): void {

   const id = idx;

   const dialogConfig = new MatDialogConfig();
   dialogConfig.disableClose = true;
   dialogConfig.autoFocus = true;
   //dialogConfig.height = '200px';
   //dialogConfig.width = '300px';

   dialogConfig.data = {
    name: 'Delete: '+this.contents[idx][this.tipoCue[idx]].name,
    msg: 'This will delete this cue. Are you sure?',
    btnmsg: 'Delete',
    btnclass: 'btn-danger'
 };

   const dialogRef = this.dialog.open(ConfirmDialogComponent, dialogConfig);

   dialogRef.afterClosed().subscribe(
       data => {
         if (data === true) {
          this.contents.splice(id, 1); // borramos la cue del array cueList
          // this.sortableComponent.writeValue(this.cueList);
          this.tipoCues(); // actualizamos el listado de tipos de cues
          this.proyectoEditado();
         }
       });
 }

 editCueDialog(): void {
//  console.log(this.mediaList);
if (this.edit.mode === true) { // si no estamos en modo edit

} else {
  let Media;

 if (this.idCueSelected !== undefined) {
  const tipo = this.tipoCue[this.idCueSelected];
  const commonProperties = this.contents[this.idCueSelected][this.tipoCue[this.idCueSelected]];
  const callMedia = this.contents[this.idCueSelected][this.tipoCue[this.idCueSelected]].Media;
  const outPuts = this.contents[this.idCueSelected][this.tipoCue[this.idCueSelected]].Outputs[0];
  let output_name;

  // console.log(commonProperties.description);
  // let cueMedia = false;

// console.log(audioOutput_name);
    if (tipo === 'AudioCue' ) {
      output_name = outPuts.AudioCueOutput.output_name;
    } else if (tipo === 'VideoCue' ) {
      output_name = outPuts.VideoCueOutput.output_name;
    }
// console.log(output_name);


  // if (tipo === 'AudioCue' || tipo === 'VideoCue' || tipo === 'DmxCue') {
  //   Media = this.contents[this.idCueSelected][this.tipoCue[this.idCueSelected]].Media;
  //   if (Media === null) {
  //     cueMedia = true;
  //   } else {
  //     Media = this.contents[this.idCueSelected][this.tipoCue[this.idCueSelected]].Media.file_name;
  //     cueMedia = true;
  //   }
  // }

  const dialogConfig = new MatDialogConfig();
  dialogConfig.disableClose = true;
  dialogConfig.autoFocus = true;
  dialogConfig.height = 'auto';
  dialogConfig.width = '800px';

  // if (cueMedia) {

  dialogConfig.data = {
      // mediaContent: true,
      name        : commonProperties.name,
      description : commonProperties.description,
      prewait     : commonProperties.prewait.CTimecode,
      postwait    : commonProperties.postwait.CTimecode,
      loop        : commonProperties.loop,
      post_go     : commonProperties.post_go,
      media       : callMedia,
      output_name : output_name,

      // in_time     : region.in_time.CTimecode,
      // out_time    : region.out_time.CTimecode,
      mediaList   : this.mediaList,
      audioOutputList: this.audioOutputList,
      videoOutputList: this.videoOutputList,
      typeCue     : tipo
  };


  // } else {

  //   dialogConfig.data = {
  //     mediaContent: false,
  //     name        : commonProperties.name,
  //     prewait     : commonProperties.prewait,
  //     postwait    : commonProperties.postwait,
  //     loop        : commonProperties.loop,
  //     post_go     : commonProperties.post_go
  // };

  // }

  const dialogRef = this.dialog.open(EditCueComponent, dialogConfig);


  dialogRef.afterClosed().subscribe(
      data => {
        if (data === 'close') {
          // console.log('close sin guardar');
          return;
        } else {

          this.color_despligue = 'warn'; // resaltamos alerta de despligue

          // console.log(data.output_name);


          if (data.media !== null && data.media !== 'Sin media') {
            Media = {
              file_name: data.media,
              regions: [{
                region: {
                id: 0,
                loop: data.loop, // 0 infinito, 1 desactivado o número de loops - implementarlo
                in_time: { CTimecode: data.in_time }, // tiempo de inicio de cue - leo el metadata y pasa y lo aplico al in out
                out_time: { CTimecode: data.out_time }
              }
            }]
            };
            commonProperties.UI_properties.warning = 0;
          } else {
            Media = null;
            commonProperties.UI_properties.warning = 1;
          }

          // if (cueMedia) {
          commonProperties.name = data.name;
          commonProperties.description = data.description;
          commonProperties.prewait.CTimecode = data.prewait;
          commonProperties.postwait.CTimecode = data.postwait;
          commonProperties.loop = data.loop;
          commonProperties.post_go = data.post_go;
          commonProperties.Media = Media;
          if (tipo === 'AudioCue' ) {
            outPuts.AudioCueOutput.output_name = data.output_name;
          } else if (tipo === 'VideoCue' ) {
            outPuts.VideoCueOutput.output_name = data.output_name;
          }

            // Media.file_name = data.media;
          // } else {
          //   commonProperties.name = data.name;
          //   commonProperties.prewait = data.prewait;
          //   commonProperties.postwait = data.postwait;
          //   commonProperties.loop = data.loop;
          //   commonProperties.post_go = data.post_go;
          // }
          this.proyectoEditado();
        //  console.log('la media que llega al cuelist' + data.media);
          console.log(this.contents);
        }

      });
 }
}

 }

preferencesDialog(): void {

   this.edit.preferences = false; // reseteamos el valor
   const dialogConfig = new MatDialogConfig();
   dialogConfig.disableClose = true;
   dialogConfig.autoFocus = true;
   //dialogConfig.height = '400px';
   //dialogConfig.width = '800px';

   dialogConfig.data = {
    accion : 'edit',
    name : this.project.CuemsScript.name,
    about: this.project.CuemsScript.description
 };

   const dialogRef = this.dialog.open(PreferencesComponent, dialogConfig);

   dialogRef.afterClosed().subscribe(
       data => {
        this.project.CuemsScript.name = data.name;
        this.project.CuemsScript.description = data.description;
        this.edit.name = data.name;
        // this.proService.changeEditing(this.edit);
        this.proyectoEditado();
       });

 }

proyectoEditado(): void {
    this.cueMs.CueList.contents = this.contents;
    // this.updateCookie(this.cueMs);
    this.edit.estiloGuardar = 'warn';
    // this.edit.edited = true;
    this.proService.changeEditing(this.edit);
 }

 // CTimecode
// pasar milisegundos a time me devuelde time
toTime(ms): string {
  return new Date(ms).toISOString().slice(11, -1);
}
// pasar de time a milisegundos - me devuelve milisegundos
toMillis(ctimecode): number{
  return Date.parse('01 Jan 1970 ' + ctimecode + ' GMT');
}

}





// console.log( time(12345 * 1000) );  // "03:25:45.000"



// setTimeout(() => { }, 500); // ejemplo de settimeout

// este ejemplo de cargar datos en el formulario array

// cargarDataAlFormulario(){ //cargamos lod datos del servidor

//   if (this.listaProyectos[0]) {
//     for (let index = 0; index < this.listaProyectos.length; index++) {
//       this.proyectos.push(this.fb.group({
//         uuid: this.listaProyectos[index].uuid,
//         name: this.listaProyectos[index].name,
//         date: this.listaProyectos[index].date
//        }))
//      }
//   } else {
//     console.warn('Sin conexión, recarga la pag...');
//   }

//   }

  // pipe para hacer un listado ordenado por cualquier elemento del array
  // sortBy(prop: string) { // pipe para ordenar el cuelist
  //   return this.cues.sort((a, b) => a[prop] > b[prop] ? 1 : a[prop] === b[prop] ? 0 : -1);
  // }
