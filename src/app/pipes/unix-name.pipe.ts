import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'unixName'
})
export class UnixNamePipe implements PipeTransform {
  

  transform( str: string ): string {

    str = str.replace(/-/g, '_');     // change "-" to "_"
    str = str.replace(/\s+/g, '_');   // change spaces to "_"
    str =  str.replace(/[\W]/g, '');  // remove non allpanumeric
    str = str.toLowerCase();          // change to lowecase
    return str;

  }

}
