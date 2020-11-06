import { Component, Inject, OnInit } from '@angular/core';
import { FormGroup, FormBuilder } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialogConfig, MatDialog } from '@angular/material/dialog';
import { ConfirmDialogComponent } from '../confirm-dialog/confirm-dialog.component';

@Component({
  selector: 'app-edit-cue',
  templateUrl: './edit-cue.component.html',
  styleUrls: ['./edit-cue.component.css']
})
export class EditCueComponent implements OnInit {

  editForm: FormGroup;

  mediaList: any[] = [];

  mediaName: string;
  mediaContent: false;

  loop: string;
  loopTimes: number;

  constructor(
    private fb: FormBuilder,
    private dialog: MatDialog,
    private dialogRef: MatDialogRef<EditCueComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
    ) {
      this.mediaContent = data.mediaContent;
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

      if (this.mediaContent) {
          for ( const media of data.mediaList) { // extraemos el nombre del archivo asociado a la cue
            if (data.media === media.unix_name) {
              this.mediaName = media.unix_name; // cuando el archivo tenga name lo cambiamos aqui
            }
            }
          this.editForm = this.fb.group({  // group es un objeto de javascript literal
              name      : [data.name, ],
              prewait   : [data.prewait, ],
              postwait  : [data.postwait, ],
              loop      : [data.loop, ],
              loop_times: [this.loopTimes, ],
              post_go   : [data.post_go, ],
              media     : [this.mediaName, ]
            });
          this.mediaList = data.mediaList;
        } else {
          this.editForm = this.fb.group({  // group es un objeto de javascript literal
            name      : [data.name, ],
            prewait   : [data.prewait, ],
            postwait  : [data.postwait, ],
            loop      : [data.loop, ],
            loop_times: [this.loopTimes, ],
            post_go   : [data.post_go, ]
          });
        }

      if ( this.loopTimes === Infinity ) {
        this.editForm.controls.loop_times.setValue( '∞' );
      }
    }

  ngOnInit(): void {

   // console.log(this.mediaList);

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

}
