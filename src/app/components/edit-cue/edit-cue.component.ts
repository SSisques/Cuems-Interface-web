import { Component, Inject, OnInit } from '@angular/core';
import { FormGroup, FormBuilder } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialogConfig, MatDialog } from '@angular/material/dialog';
import { ConfirmDialogComponent } from '../confirm-dialog/confirm-dialog.component';
import { FilesService } from '../../servicios/files.service';
import { WebsocketService } from '../../servicios/websocket.service';

@Component({
  selector: 'app-edit-cue',
  templateUrl: './edit-cue.component.html',
  styleUrls: ['./edit-cue.component.css']
})
export class EditCueComponent implements OnInit {

  editForm: FormGroup;

  mediaList: any[] = [
    { 
    unix_name: 'Sin media'
    }
  ];

  isMedia;
  mediaContent: false;

  loop: string;
  loopTimes: number;
  typeCue: string;
  newCue: boolean;

  constructor(
    private fb: FormBuilder,
    private dialog: MatDialog,
    private wsService: WebsocketService,
    private fileService: FilesService,
    private dialogRef: MatDialogRef<EditCueComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
    ) {
      this.recibimosWs();
      this.newCue = data.newCue;
      this.typeCue = data.typeCue;
      this.isMedia = data.media;

      if ( data.loop === 0 ) {
        this.loop = 'cero';
        this.loopTimes = Infinity;
        }
      if ( data.loop === 1 ) {
        this.loop = 'uno';
        this.loopTimes = 1;
        }
      if ( data.loop > 1 ) {
          this.loop = 'uno';
          this.loopTimes = data.loop;
        }

      switch (this.typeCue) {
          case 'AudioCue':
            for (const file of data.mediaList) {
              if (file.type === 'AUDIO') {
                this.mediaList.push( file );
              }
            }
            break;
          case 'VideoCue':
            for (const file of data.mediaList) {
              if (file.type === 'MOVIE' || file.type === 'IMAGE') {
                this.mediaList.push( file );
              }
            }
            break;
          case 'DmxCue':
            console.log('Esperando a listar las memorias de luces');
            break;
          default:
            break;
        }
      // console.log(this.mediaList);

      if (this.newCue) {

      this.editForm = this.fb.group({  // group es un objeto de javascript literal
          name       : ['New ' + data.typeCue, ],
          description: ['', ],
          prewait    : ['00:00:00.000', ],
          postwait   : ['00:00:00.000', ],
          loop       : ['uno', ],
          loop_times : [1, ],
          post_go    : ['pause', ],
          media      : [null, ],
          in_time    : ['00:00:00.000', ],
          out_time   : ['', ],
          duration      : ['', ]
      });

      } else {
        let fileName = 'Sin media';
        let inTime;
        let outTime = '00:00:00.000';

        if (data.media !== null) {
          this.file_LoadMeta(data.media.file_name);
          fileName = data.media.file_name;
          inTime = data.media.regions[0]['region'].in_time.CTimecode;
          outTime = data.media.regions[0]['region'].out_time.CTimecode;
          // console.log(inTime);
        } else {
          inTime = '00:00:00.000';
        }

        // this.mediaConent = data.mediaContent;

        // if (this.mediaContent) {

        this.editForm = this.fb.group({  // group es un objeto de javascript literal
              name       : [data.name, ],
              description: [data.description, ],
              prewait    : [data.prewait, ],
              postwait   : [data.postwait, ],
              loop       : [data.loop, ],
              loop_times : [this.loopTimes, ],
              post_go    : [data.post_go, ],
              media      : [fileName, ],
              in_time    : [inTime, ],
              out_time   : [outTime, ],
              duration   : ['', ]
            });

        // } else {
        //   this.editForm = this.fb.group({  // group es un objeto de javascript literal
        //     name      : [data.name, ],
        //     prewait   : [data.prewait, ],
        //     postwait  : [data.postwait, ],
        //     loop      : [data.loop, ],
        //     loop_times: [this.loopTimes, ],
        //     post_go   : [data.post_go, ]
        //   });
        // }

        if ( this.loopTimes === Infinity ) {
        this.editForm.controls.loop_times.setValue( '∞' );
      }

      }

    }

  ngOnInit(): void {

   // console.log(this.mediaList);

  }
  file_LoadMeta(file): void{
    // console.log(this.mediaList);
    if (file !== 'Sin media') {
    const fileAsigned = this.mediaList.find( File => File.unix_name === file );
    // console.log(fileAsigned.uuid);
    this.fileService.file_LoadMeta(fileAsigned.uuid); // llamamos la metadata del file
    } else {
      this.editForm.controls['duration'].setValue( '00:00:00.000' );
      this.editForm.controls['in_time'].setValue( '00:00:00.000' );
      this.editForm.controls['out_time'].setValue( '00:00:00.000' );
    }
  }
  duration(inTime, outTime): void{

      const End = this.toMillis(outTime);
      const In = this.toMillis(inTime);

      const resta = End - In;

      // console.log(resta);

      // return this.toTime(resta);
      this.editForm.controls['duration'].setValue(this.toTime(resta));

  }

  recibimosWs(): void {
    this.wsService.ws.subscribe(msg => { // nos suscribimos a la conexión
      const recibo: any = msg; // le añadimos tipado a la variable ;) xapucilla

      switch (recibo.type) {
        case 'file_load_meta': {
          let myKeys: any;
          myKeys = Object.keys(recibo.value);
          if (this.isMedia) {
            if (this.isMedia.file_name !== recibo.value[myKeys[0]].name) {
              // console.log('no es igual');
              this.editForm.controls['out_time'].setValue( recibo.value[myKeys[0]].duration );
              this.isMedia = recibo.value[myKeys[0]]; // reasignamos el contenido del media a la variable
            }
          } else {
          this.editForm.controls['in_time'].setValue( '00:00:00.000' );
          this.editForm.controls['out_time'].setValue( recibo.value[myKeys[0]].duration );
          }
          this.duration(this.editForm.value.in_time, this.editForm.value.out_time);
          break;
       }
    //    case 'error': {
    //     const options = {
    //       autoClose: false
    //     };
    //     this.alertService.error('Error: ' + recibo.value, options);
    //     break;
    //  }
        default: {
           // statements;
           // console.log(recibo.type);
           break;
        }
     }

     });
 }

loopChange(str): void{
  if (str === 'inf') {
    this.editForm.controls.loop_times.setValue( '∞' );
  } else {
    this.editForm.controls.loop_times.setValue( 1 );
  }
}

save(): void {
  if (this.mediaContent) {
    for ( const media of this.mediaList) { // asignamos la uuid del archivo asociado a la cue
      if (this.editForm.value.media === media.unix_name) { // cuando el archivo tenga name lo cambiamos aqui
        this.editForm.value.media = media.unix_name;
      }
    }
  }
  if (this.editForm.value.loop === 'cero'){
      this.editForm.value.loop = 0;
    }
  if (this.editForm.value.loop === 'uno') {
      if (this.editForm.value.loop_times > 1) {
        this.editForm.value.loop = this.editForm.value.loop_times;
      } else {
        this.editForm.value.loop = 1;
      }
    }
    // console.log(this.editForm.value);
  this.dialogRef.close(this.editForm.value);
}
close(): void {
  this.dialogRef.close('close');
  // console.log('esto graba por ahora');
}
msgClose(): void {
  const dialogConfig = new MatDialogConfig();
  dialogConfig.disableClose = true;
  dialogConfig.autoFocus = true;
  dialogConfig.height = '150px';
  dialogConfig.width = 'auto';

  dialogConfig.data = {
    name: 'Cerramos sin aplicar cambios?',
    msg: ''
 };

  const dialogRef = this.dialog.open(ConfirmDialogComponent, dialogConfig);

  dialogRef.afterClosed().subscribe(
       data => {
         if (data === true) {
          this.dialogRef.close('close');
         }
       });
}
handleKeyUp(e): void{ // grabamos al presionar el enter
  if (e.keyCode === 13){
     this.save();
  }
}

// CTimecode
// pasar milisegundos a time me devuelde time
toTime(ms): string {
  return new Date(ms).toISOString().slice(11, -1);
}
// pasar de time a milisegundos - me devuelve milisegundos
toMillis(ctimecode): number{
  return Date.parse('01 Jan 1970 ' + ctimecode + ' GMT');
}

}
