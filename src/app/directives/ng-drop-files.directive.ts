import { Directive, EventEmitter, ElementRef, HostListener, Input, Output } from '@angular/core';
import { FileItem } from '../models/file-item';

@Directive({
  selector: '[appNgDropFiles]'
})
export class NgDropFilesDirective {



  status: any;

  @Input() archivos: FileItem[] = [];
  @Output() mouseSobre: EventEmitter<boolean> = new EventEmitter();

  constructor() { }

  @HostListener('dragover', ['$event'])
  public onDragEnter( event: any ) {
    this.mouseSobre.emit( true );
    this._prevenirDetener( event );
  }

  @HostListener('dragleave', ['$event'])
  public onDragLeave( event: any ) {
    this.mouseSobre.emit( false );
  }

  @HostListener('drop', ['$event'])
  public onDrop( event: any ) {

    const transferencia = this._getTransferencia( event );

    if (!transferencia) {
      return;
    }

    this._extraerArchivos( transferencia.files );
    this._prevenirDetener( event );
    this.mouseSobre.emit( false );

  }

  private _getTransferencia(event: any) { // compatibilidad con los navegadores
    return event.dataTransfer ? event.dataTransfer : event.orininalEvent.dataTransfer;
  }

  private _extraerArchivos(  archivosLista: FileList  ) {

    // tslint:disable-next-line: forin
    for (const propiedad in Object.getOwnPropertyNames( archivosLista ) ) {

      const archivoTemporal = archivosLista[propiedad];


      if ( this._archivoPuedeSerCargado( archivoTemporal )) {

        const nuevoArchivo = new FileItem( archivoTemporal );
        this.archivos.push( nuevoArchivo );

      }
    }

  }

   //  Validaciones

  private _archivoPuedeSerCargado( archivo: File ): boolean {

    if (!this._archivoYaFueBorrado( archivo.name ) && this._esImagen( archivo.type )) {
      return true;
    } else {
      return false;
    }
  }

  private _prevenirDetener( event ): void {
    event.preventDefault();
    event.stopPropagation();
  }

  private _archivoYaFueBorrado( nombreArchivo: string ): boolean {

    for (const archivo of this.archivos) {
      if ( archivo.nombreArchivo === nombreArchivo ) {
        console.log('El archivo ' + nombreArchivo + ' ya existe.');
        return true;
      }
    }
    return false;
  }

  private _esImagen( tipoArchivo: string ): boolean {
    // return ( tipoArchivo === '' || tipoArchivo === undefined ) ? false : tipoArchivo.startsWith('image');
    return true;
  }


}
