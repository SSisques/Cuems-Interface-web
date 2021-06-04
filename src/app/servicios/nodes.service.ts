import { Injectable } from '@angular/core';
import { WebsocketService } from '../servicios/websocket.service';

@Injectable({
  providedIn: 'root'
})
export class NodesService {

  constructor(
    private wsService: WebsocketService
  ) {
    this.recibimosWs();
    console.log(this.audioOutputList);
    console.log(this.videoOutputList);
   }

  audioOutputList: any[] = [];
  videoOutputList: any[] = [];
  
  recibimosWs(): void {
    this.wsService.ws.subscribe(msg => { // nos suscribimos a la conexión
      const recibo: any = msg; // le añadimos tipado a la variable ;) xapucilla
      switch (recibo.type) {
        case 'initial_mappings': 
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
           
      // }
          break;
      
     default: 
      break;
     
      }
      

    });
  

}
}
  
export interface NodeList {
  number_of_nodes: number;
	default_audio_input: string; 
	default_audio_output: string; 
	default_video_input: string; 
	default_video_output: string; 
	default_dmx_input: string; 
	default_dmx_output: string;
  nodes: Nodes[];
}

export interface Nodes {
  uuid: string; 
	mac: string;
  audio: Conexions;
  video: Conexions;
  dmx?: string;
}
export interface Conexions {
  outputs: Outputs[];
	inputs?: Inputs[];
}
export interface Outputs {
  name: string;
	mappings: Mappings[];
}
export interface Inputs {
  name: string;
	mappings: Mappings[];
}
export interface Mappings {
  mapped_to: string;
}
