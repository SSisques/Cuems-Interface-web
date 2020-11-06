import { Component, Inject, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, RequiredValidator, Validators, FormControl, FormGroupDirective, NgForm } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-new-project',
  templateUrl: './new-project.component.html',
  styleUrls: ['./new-project.component.css']
})
export class NewProjectComponent implements OnInit {

  // projectData: string;

  constructor(
    private fb: FormBuilder,
    private translate: TranslateService,
    private dialogRef: MatDialogRef<NewProjectComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {

    // this.translate.setDefaultLang('en');
    // the lang to use, if the lang isn't available, it will use the current loader to get them
    // this.translate.use('en');

    for (const project of data.projectList) {
      this.unixNameList.push(project.unix_name); // asignamos los unix_name actuales para compararlos
      this.nameList.push(project.name); // asignamos el name a el array para comprobar duplicidad
    }
    // console.log(this.nameList);

    this.accion = data.accion; // recibimos accion a ejecutar

    this.editForm = this.fb.group({  // group es un objeto de javascript literal
      name : [data.name, [Validators.required, Validators.minLength(3), Validators.maxLength(60), this.noDuplicated.bind(this)]],
      unix_name: [data.unix_name, [Validators.required, Validators.minLength(3), Validators.maxLength(60), Validators.pattern('[a-z0-9_]{3,236}')]],
      description: [data.description, Validators.maxLength(255)]
    });
  }

  editForm: FormGroup;
  unixNameList: string[] = [];
  private nameList: string[] = [];
  stepOne = true;
  stepTwo = false;
  duplicated = false;
  nMb: string; // recogemos el número de terminación una en caso de proyecto duplicado

  accion: string;

  panelOpenState = false;
// private nombre = 'ddd';

  ngOnInit(): void {
    // console.log(this.editForm.value);
  }

  getNameErrorMessage(): string { // errores a mostrar en la validación del nombre

    if (this.editForm.controls.name.hasError('required')) {
      return this.translate.instant('new.project.name.error.required');
    }
    if (this.editForm.controls.name.hasError('minlength')) {
      return this.translate.instant('new.project.name.error.minlength');
    }
    if (this.editForm.controls.name.hasError('maxlength')) {
      return this.translate.instant('new.project.name.error.maxlength');
    }
    if (this.editForm.controls.name.hasError('duplicated')) {
      return this.translate.instant('new.project.name.error.duplicated');
    }

  }
  getUnix_nameErrorMessage(): string { // errores a mostrar en la validación del nombre

    if (this.editForm.controls.unix_name.hasError('required')) {
      return this.translate.instant('new.project.unix_name.error.required');
    }
    if (this.editForm.controls.unix_name.hasError('minlength')) {
      return this.translate.instant('new.project.unix_name.error.minlength');
    }
    if (this.editForm.controls.unix_name.hasError('maxlength')) {
      return this.translate.instant('new.project.unix_name.error.maxlength');
    }
    if (this.editForm.controls.unix_name.hasError('pattern')) {
      return this.translate.instant('new.project.unix_name.error.pattern');
    }

  }
  getDescriptionErrorMessage(): string { // errores a mostrar en la validación del nombre

    if (this.editForm.controls.description.hasError('maxlength')) {
      return this.translate.instant('new.project.description.error.maxlength');
    }

  }
  noDuplicated( control: FormControl ): {[s: string]: boolean } { // custom validación - this.noDuplicated.bind(this)

    if ( this.nameList.includes(control.value) ){
      return {
        duplicated: true
      };
    }
    return null;
  }
  toUnixName(): void  {

    if (this.editForm.get('name').valid) {

      const str = this.editForm.value.name;
      const strNoSpace = str.trim();

      this.editForm.controls['name'].setValue( strNoSpace ); // borramos los espacios en blaco añadidos antes y después

      const unixName = this.sanetizando(strNoSpace);

      // if (this.duplicated) { // si esta duplicado no incluimos los -001 en el input
      //   unixName = unixName.substring(0, unixName.length - 4);
      // }

      this.editForm.controls['unix_name'].setValue( unixName );

      this.stepTwo = true;

    }

}
editUnixName(): void  {

  if (this.stepTwo) {

    // this.stepOne = false;

    const unixName = this.sanetizando(this.editForm.value.unix_name);

    // if (this.duplicated) {
    //   unixName = unixName.substring(0, unixName.length - 4);
    // }

    this.editForm.controls['unix_name'].setValue( unixName );

  }

}

sanetizando(str: string): any {

      // let nmb: number;
      // let nMb: string;

      str = str.replace(/-/g, '_');     // change "-" to "_"
      str = str.replace(/\s+/g, '_');   // change spaces to "_"
      str =  str.replace(/[\W]/g, '');  // remove non allpanumeric
      str = str.toLowerCase();          // change to lowecase

      // if (this.unixNameList.includes(str)) { // si existe en el array

      //   this.duplicated = true;

      //   if (this.unixNameList.includes(str + '-001')) {

      //     // console.log(this.find_last(this.unixNameList, str));

      //     let guion: string;
      //     str = this.find_last(this.unixNameList, str); // nos da el último archivo de la serie de duplicados - Gracias a Ion ;)
      //     guion = str.substring(0, str.length - 3); // cogemos las tres últimas letras
      //     guion = guion.slice(-1); // seleccionamos la posición de un posible guión -

      //     if (guion === '-') { // existe un guion leemos el número final

      //       nmb = parseFloat(str.slice(-3)) + 1; // leer el numero de la 3 ultimas cifras pasarlo a número y sumarle uno
      //       nMb = this.zfill(nmb, 3); // añadirle los 00 correspondientes y pasarla a string
      //       nMb = '-' + nMb; // le añadimos el guión de nuevo
      //       str = str.substring(0, str.length - 4); // separamos el string del guión
      //       str = str + nMb;
      //       this.nMb = nMb; // asignamos los -001 en esta variable para mostrarla en el html

      //       return str; // retornamos el nombre sanetizado con el número correspondiente
      //     }

      // } else { // si no existe número es la primera vez que lo duplica
      //   nMb = '-001';
      //   this.nMb = nMb;
      //   return str + nMb ; // retornamos el númeromsanetizado con el -001

      // }


      // }
      // console.log(str);
      // this.nMb = '';
      // this.duplicated = false;
      return str; // si no está duplicado lo retornamos sanetizado
}
// find_last(stringArray: string[], searchString: string): string {
//   const results = [];

//   for (const unixName of stringArray) {
//    const result = unixName.match(/([a-z_]+)-([0-9]{03})?/);
//    if (result){
//     if (searchString === result[1] ) {
//       results.push(result);
//     }
//    }
//   }

//   const numbers = [];
//   for (const nmb of results){
//     if (nmb[2]){
//       numbers.push(nmb[2]);
//     }
//   }

//   numbers.sort();

//   let ultimo;

//   if (numbers.length !== 0) {
//     ultimo = searchString + '-' + numbers.pop();
//   } else if (results.length !== 0){
//     ultimo = searchString;
//   } else {
//     ultimo = false;
//   }

//   return ultimo;

//   }

// zfill(nmb: number, width: number): string  {
//   const numberOutput = Math.abs(nmb); // Valor absoluto del número
//   const length = nmb.toString().length; // Largo del número
//   const zero = '0'; // String de cero

//   if (width <= length) {
//       if (nmb < 0) {
//            return ('-' + numberOutput.toString());
//       } else {
//            return numberOutput.toString();
//       }
//   } else {
//       if (nmb < 0) {
//           return ('-' + (zero.repeat(width - length)) + numberOutput.toString());
//       } else {
//           return ((zero.repeat(width - length)) + numberOutput.toString());
//       }
//   }
// }

save(): void {
  // console.log(this.editForm);
  if ( this.editForm.invalid ){ // validación formulario al enviar
    return Object.values( this.editForm.controls ).forEach( control => {
      control.markAllAsTouched(); // marco como tocado
    });
  } else {
    if (this.duplicated) { // si esta duplicado no incluimos los -001 en el input
      const unixName = this.editForm.value.unix_name + this.nMb;
      this.editForm.controls['unix_name'].setValue( unixName );
      this.dialogRef.close(this.editForm.value);
    } else {
      this.dialogRef.close(this.editForm.value);
    }
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
