import { Injectable } from '@angular/core';


@Injectable({
  providedIn: 'root'
})
export class NodesService {

  constructor(
  ) { }

  nodeList: NodeList[] = [];

  add_mappings(initial_mappings) {

    // console.log(initial_mapping.default_audio_input);

    // this.nodeList = initial_mappings;

    // for (let index = 0; index < initial_mapping.length; index++) {

    this.nodeList.push({
      number_of_nodes:      initial_mappings.number_of_nodes,
      default_audio_input:  initial_mappings.default_audio_input,
      default_audio_output: initial_mappings.default_audio_output,
    	default_video_input:  initial_mappings.default_video_input, 
	    default_video_output: initial_mappings.default_video_output, 
	    default_dmx_input:    initial_mappings.default_dmx_input, 
	    default_dmx_output:   initial_mappings.default_dmx_output,
      nodes:                initial_mappings.nodes

    });

    // console.log(this.nodeList);
  
  // }

  // clear() {
  //   this.nodeList = [];
  // }
}




// getnodeList(): Observable<NodeList[]>{
//   return this.nodeList.asObservable();
// }

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
