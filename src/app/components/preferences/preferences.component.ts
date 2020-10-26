import { Component, Inject, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, RequiredValidator, Validators, FormControl, FormGroupDirective, NgForm } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';


@Component({
  selector: 'app-preferences',
  templateUrl: './preferences.component.html',
  styleUrls: ['./preferences.component.css']
})
export class PreferencesComponent implements OnInit {

  editForm: FormGroup;

  // projectData: string;

  constructor(
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<PreferencesComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    this.editForm = this.fb.group({  // group es un objeto de javascript literal
      name : [data.name, [Validators.required, Validators.minLength(3), Validators.maxLength(60)]],
      description: [data.description, Validators.maxLength(256)]
    });
  }

  ngOnInit(): void {
    // console.log(this.editForm.value);
  }


  save(): void {
  // console.log(this.editForm);
  if ( this.editForm.invalid ){ // validación formulario al enviar
    return Object.values( this.editForm.controls ).forEach( control => {
      control.markAllAsTouched(); // marco como tocado
    });
  } else {
      this.dialogRef.close(this.editForm.value);
  }
}

close(): void {
  this.dialogRef.close('close');
}
handleKeyUp(e): void{ // grabamos al presionar el enter
  if (e.keyCode === 13){
     this.save();
  }
}

}
