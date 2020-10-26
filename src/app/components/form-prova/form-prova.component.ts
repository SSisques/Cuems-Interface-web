 import { Component } from '@angular/core';
 import { FormGroup, FormArray, FormBuilder, FormControl } from '@angular/forms';
 import { ProyectosService, listaProyectos } from '../../servicios/proyectos.service';

 @Component({
     selector: 'app-form-prova',
     templateUrl: './form-prova.component.html'
   })

export class FormProvaComponent {
    title = 'Nested FormArray Example Add Form Fields Dynamically';

    empForm  : FormGroup;


    constructor(private fb:FormBuilder,
                private ps:ProyectosService) {
      this.empForm=this.fb.group({  //creamos el formulario 
        employees: this.fb.array([]), //con el array de los employees
      });
    }


    employees(): FormArray {
      return this.empForm.get("employees") as FormArray; // creamos un alias para usar los comonentes del array employees
    }


    newEmployee(): FormGroup { // estructura del empleado nuevo
    console.log('añadimos un empleado');
    
      return this.fb.group({
        firstName: '',
        lastName: '',
        skills:this.fb.array([]) // añadiendo un subarray
      })
    }


    addEmployee() { //creamos empleado
      console.log("Adding a employee");
      this.employees().push(this.newEmployee()); //creamos un employee llamando al alias y push del nuevoempleado
    }


    removeEmployee(empIndex:number) { //para borrar un empleado, necesitamos el index que ha sido asignado en el html
      this.employees().removeAt(empIndex);
    }


    employeeSkills(empIndex:number) : FormArray { //el alias para crear este sub arreglo, necesitamos la id del employee
      return this.employees().at(empIndex).get("skills") as FormArray;
    }

    newSkill(): FormGroup { //cuando creemos un skill para el empleado
      return this.fb.group({
        skill: '',
        exp: '',
      })
    }

    addEmployeeSkill(empIndex:number) { //creamos un skil asignado a un empleado
    console.log("Adding a skill");
      this.employeeSkills(empIndex).push(this.newSkill());
    }



    removeEmployeeSkill(empIndex:number,skillIndex:number) { //borramos un skill
      this.employeeSkills(empIndex).removeAt(skillIndex);
    }

    onSubmit() { //cuando enviemos
      console.log(this.empForm.value);
    }


  }
  export class country {
      id: string;
      name: string;
     
      constructor(id: string, name: string) {
        this.id = id;
        this.name = name;
      }
    }
