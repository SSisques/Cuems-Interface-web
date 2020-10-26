import { Injectable } from '@angular/core';
import { webSocket } from 'rxjs/webSocket';


@Injectable({
  providedIn: 'root'
})
export class WebsocketService {

  private host = 'wss://dev.stagelab.net/ws'; // dirección del servidor
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

  constructor() {
    this.ws.subscribe(); // nos subscribimos al servidor
}

  wsEmit(msg: any): void {
  this.ws.next(msg); // emitimos el mensage por el ws
}

  }