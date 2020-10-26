import { Component, OnInit } from '@angular/core';
import { WebsocketService } from '../../servicios/websocket.service';

@Component({
  selector: 'app-footer',
  templateUrl: './footer.component.html'
})
export class FooterComponent implements OnInit {

  users;

  constructor(
    public wsService: WebsocketService
  ) {

     this.wsService.ws.subscribe(msg => {// nos suscribimos a la conexión
      const recibo: any = msg;

      switch (recibo.type) {
        case 'users': {
          this.users = recibo.value;
          // console.log(this.users);
          break;
        }
        default: {
           // statements;
           break;
        }
     }

      });
   }

  ngOnInit(): void {
  }

}
