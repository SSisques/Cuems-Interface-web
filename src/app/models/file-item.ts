

export class FileItem {

    public file: File;
    public nombreArchivo: string;
    public estaSubiendo: boolean;
    public progreso: number;
    public chunksize: number;

    constructor( archivo: File ){

        this.file = archivo;
        this.nombreArchivo = archivo.name;
        this.estaSubiendo = false;
        this.progreso = 0;
        this.chunksize = 500000;
    }

}