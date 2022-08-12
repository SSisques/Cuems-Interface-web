import { Injectable } from '@angular/core';
import { webSocket } from 'rxjs/webSocket';
 

@Injectable()
export class OscService {


    constructor() {
     //   console.log('servicio osc listo para usarse');
     }
    
     FULL_PATH: any[] = [];
     nextCue; 

     envioInit(){

     }

    // Conexion websocket deserialized
    public wsRealtime = webSocket({
    // url: 'wss://dev.stagelab.net/realtime',
    url: 'wss://192.168.6.1/realtime',
    deserializer: (data: any) => this.in_message(data),
    serializer: (msg: any) => msg,
    binaryType: 'arraybuffer'
    });

    in_message(mess: any) {
      
      if (mess.data instanceof ArrayBuffer) {
        let dataView = new DataView(mess.data);
        const msg = new OSC.Message();
        msg.unpack(dataView);
        // console.log(msg.args[0]);
       
          // console.log(msg.address);
        switch (msg.address) {
          case '/engine/status/currentcue':
            // console.log('current cue');
            // console.log(msg.args[0]);
          break;
          case '/engine/status/nextcue':
            // console.log('next cue');
            // console.log(msg.args[0]);
            this.nextCue = msg.args[0];
            console.log(msg.args[0]);
            
          break;
        
          default:
            break;
        }

      } else {
        let json = JSON.parse(mess.data);
        this.FULL_PATH = json;
        // console.log(this.FULL_PATH.CONTENTS.engine.CONTENTS.status.CONTENTS.nextcue);
        // this.nextCue = this.FULL_PATH.CONTENTS.engine.CONTENTS.status.CONTENTS.nextcue.VALUE; // actualizamos la next cue desde el full_path cuando lo pedimos
      }
    }

     // conectamos
realTime(){
  
this.wsRealtime.subscribe( // escuchamos el obsevable editinsProject
  data => {
    // const msg = new OSC.Message();
    // msg.unpack(data);
    // console.log(msg.args);
    // console.log(data);
    
  });
// console.log('realtime');


this.wsRealtime.next('/'); // emitimos el mensage por el ws

}
barra(){
  this.wsRealtime.next('/');
}

stop(){
  console.log('stop');
  const messageStop = new OSC.Message('/engine/command/stop');
  const binaryStop = messageStop.pack();
  this.wsRealtime.next(binaryStop);
}

     envioLoad(): void{ // sentencia Go
      
     }

     envioGo(): void{ // sentencia Go
      console.log('go');
      const messageGo = new OSC.Message('/engine/command/go');
      const binaryGo = messageGo.pack();
      this.wsRealtime.next(binaryGo);
      // console.log(nextCue);
      
      }
       recivoMsg(): void{
        // return Msg;
    }
    nextcueUuid(): string{
      // console.log('variable next cue');
      
      // console.log(this.nextCue);
      
      return this.nextCue;
    }
}
