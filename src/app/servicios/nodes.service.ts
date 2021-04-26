import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class NodesService {

  constructor() { }
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
