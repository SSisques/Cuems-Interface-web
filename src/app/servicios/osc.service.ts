import { Injectable } from '@angular/core';
import { OscCompomnent } from 'osc-js'; // https://github.com/colinbdclark/osc.js
import { getLocaleNumberSymbol } from '@angular/common';

declare var osc: any;
var Msg;

//configuramos servidor y conexión websocket
var oscPort = new osc.WebSocketPort({
    url: "wss://dev.stagelab.net/realtime", // URL to your Web Socket server.
    metadata: true
  });

//conectamos
//oscPort.open(); //atención!!! está muteado. 

//leemos el mensaje de entrada y lo iomprimimos
oscPort.on("message", function (oscMsg) {
  Msg = oscMsg;
  });
 

@Injectable()
export class OscService {


    
    constructor() {
     //   console.log('servicio osc listo para usarse');
     }

     envioGo(){ //sentencia Go
       // console.log('envio Go osc service');
        oscPort.send({
          address: "/node0/videoplayer1/start",
          args: [
            {
              type: "T",
              value: 1
            }
          ]
        });  
      }
       recivoMsg(){
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