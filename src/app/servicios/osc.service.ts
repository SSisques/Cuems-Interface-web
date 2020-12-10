import { Injectable } from '@angular/core';
import { OscCompomnent } from 'osc-js'; // https://github.com/colinbdclark/osc.js
import { getLocaleNumberSymbol } from '@angular/common';

declare var osc: any;
let Msg;

// configuramos servidor y conexión websocket
const oscPort = new osc.WebSocketPort({
    url: 'wss://dev.stagelab.net/realtime', // URL to your Web Socket server.
    metadata: true
  });

// conectamos
oscPort.open(); // atención!!! está muteado.

// Primero enviar la / y esperar la contestación y me envia Go - engine stutus - timecode - next cue al principio la primera vez. 
// despues tenemos el current cue y  next

// leemos el mensaje de entrada y lo iomprimimos
oscPort.on('message', function (oscMsg) {
  Msg = oscMsg;
  // console.log(Msg.args[0].value);
  
  });
 

@Injectable()
export class OscService {

    constructor() {
     //   console.log('servicio osc listo para usarse');
     }

     envioInit(){

     }

     envioLoad(): void{ // sentencia Go
      // console.log('envio Go osc service');

       oscPort.send({
         address: '/engine/command/load',
         args: [
           {
             type: 's',
             value: 'dddd'
           }
         ]
       });
     }

     envioGo(): void{ // sentencia Go
       // console.log('envio Go osc service');

        oscPort.send({
          address: '/engine/command/go',
          args: [
            {
              type: 'I',
              value: 1
            }
          ]
        });
        // oscPort.send({
        //   address: '/engine/command/load',
        //   args: [
        //     {
        //       type: 's',
        //       value: 'dddd'
        //     }
        //   ]
        // });
        // oscPort.send({
        //   address: '/node0/videoplayer0/start',
        //   args: [
        //     {
        //       type: 'T',
        //       value: 1
        //     }
        //   ]
        // });
      }
       recivoMsg(): void{
        return Msg;
    }
}





/* import { OscCompomnent } from 'osc-js';

declare var osc: any;   

var oscPort = new osc.WebSocketPort({
  url: "wss://dev.stagelab.net/realtime", // URL to your Web Socket server.
  metadata: true
});

//abrmos el puerto
oscPort.open(); 

oscPort.send({
      address: "/node0/videoplayer1/start",
      args: [
        {
          type: "T",
          value: 1
        }
      ]
    });
*/