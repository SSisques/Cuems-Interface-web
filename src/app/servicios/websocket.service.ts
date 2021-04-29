import { Injectable } from '@angular/core';
import { webSocket } from 'rxjs/webSocket';


@Injectable({
  providedIn: 'root'
})
export class WebsocketService {

  // private host = 'wss://dev.stagelab.net/ws'; // dirección del servidor - wss://master.local/ws
  private host = 'wss://192.168.6.1/ws';
  public isConnected = false;

// Monitorizamos el estado de la conexión ws
  public ws = webSocket({
    url: this.host,
    openObserver: {
      next: () => this.isConnected = true
    },
    closeObserver: {
      next: () => this.isConnected = false
    }
  });

// // Conexion websocket deserialized
//   public wsRealtime = webSocket({
//     url: this.hostRealtime
//   });
  constructor() {
    this.ws.subscribe(); // nos subscribimos al servidor
    // this.wsRealtime.subscribe();
}

  wsEmit(msg: any): void {
  this.ws.next(msg); // emitimos el mensage por el ws
}
// barra(): void {
//   this.ws.next('/'); // emitimos el mensage por el ws
// }
// wsBlobEmit(msg: any): void {
//   this.wsBlob.next(msg); // emitimos el mensage por el ws
// }

  }