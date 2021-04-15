import { Injectable } from '@angular/core';
import { FileItem } from '../models/file-item';
import { webSocket } from 'rxjs/webSocket';
import * as CryptoJS from 'crypto-js';

// import { nuevoArchivo } from '../components/media/media.component';



@Injectable({
  providedIn: 'root'
})
export class UploadService {


  private wsUpload = 'wss://dev.stagelab.net/upload';
  // private wsUpload = 'wss://master.local/upload';

  constructor( ) { }

  cargarArchivos( archivos: FileItem[] ): void {

    for (const item of archivos) {

      if (item.progreso >= 100) { // si lo hemos cargado no lo subas de nuevo
        continue;
      }

      this.subidaArchivo(item);
}

}

subidaArchivo(item): void {
  const subject = webSocket({
    url: this.wsUpload,
    serializer: (msg: any) => msg
  });
  const estaSubiendo = false;

  let status: any;
  const md5 = CryptoJS.algo.MD5.create();
  const fiLe = item.file;
  const params: Params = {
     file: fiLe,
     progressbar: 0,
     chunksize: 500000,
     onerror: undefined,
     onchunk: undefined,
     onsuccess: undefined,
     onfailure: undefined
   };

  subject.subscribe(); // nos conectamos al ws

  const reader = new FileReader();
  const file = params.file;

  const filedata = { action: 'upload', value: { name: file.name, size: file.size }};

  const chunksize = params.chunksize;
  let sliceStart = 0;
  const end = file.size;
  let finished = false;
  const errorMessages: any[] = [];
  let success = false;


  subject.next(JSON.stringify(filedata));

  reader.onload = (event) => {
  subject.next(event.target.result);
  md5.update(CryptoJS.lib.WordArray.create(event.target.result));
  };



  subject.subscribe(
(msg) => {

status = msg;

// got close signal
if ( status.close ) {
console.log('close');

if ( finished ) {
success = true;
}
subject.complete(); // cerramos la conexión websocket
return;
}
// server reports error
if ( status.error ) {
if ( params.onerror ) {
params.onerror( status );
}
errorMessages.push( status );
if ( status.fatal ) {
subject.complete();
}
return;
}
// anything else but ready signal is ignored
if ( !status.ready ) {
return;
}
// upload already successful, inform server
if ( finished ) {
item.progreso = 100;
const hash = md5.finalize();
const hashHex = hash.toString(CryptoJS.enc.Hex);
subject.next(JSON.stringify({ action: 'finished' , value: hashHex}));
console.log('Archivo cargado correctamente');
// tenemos que añadirlo al listado local
return ;
}
// server is ready for next chunk
let sliceEnd = sliceStart + ( status.chunksize || chunksize );
if ( sliceEnd >= end ) {
sliceEnd = end;
finished = true;
}
const chunk = file.slice(sliceStart, sliceEnd); // se trocea
reader.readAsArrayBuffer(chunk);

if ( params.onchunk ) {
params.onchunk( sliceEnd / end );  // send ratio completed
}

item.progreso = Math.round(sliceStart * 100 / end); // incremento barra de progreso

sliceStart = sliceEnd;

return;

},
(err) => {

console.log('errores ' + err);


if ( success ) {
if (params.onsuccess) {
params.onsuccess();
}
return;
}
if ( errorMessages.length === 0 ) {
errorMessages[0] = {
error: 'Unknown upload error'
};
}
if (params.onfailure) {
params.onfailure(errorMessages);
} else {
console.log(errorMessages);
}


});
}




}

export interface Params {
  file: File;
  progressbar: number;
  chunksize: number;
  onerror: any;
  onchunk: any;
  onsuccess: any;
  onfailure: any;
}