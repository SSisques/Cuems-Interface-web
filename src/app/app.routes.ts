// en esta aerchivo definimos las rutas a nuestras paginas

import { RouterModule, Routes } from '@angular/router';
import { HomeComponent } from './components/home/home.component'; // proyectos list
import { CueListComponent } from './components/cuelist/cuelist.component'; // cue list
import { CueComponent } from './components/cue/cue.component'; // edit cue
import { AboutComponent } from './components/about/about.component'; // notas de la versión
import { ProyectosComponent } from './components/proyectos/proyectos.component';
import { MediaComponent } from './components/media/media.component';
import { DropComponent } from './components/drop/drop.component';
import { TreeComponent } from './components/tree/tree.component';
import { DessingComponent } from "./components/dessing/dessing.component";




const APP_ROUTES: Routes = [
    { path: 'home', component: HomeComponent },
    { path: 'proyectos', component: ProyectosComponent },
    { path: 'about', component: AboutComponent },
    { path: 'cuelist/:uuid/:mode', component: CueListComponent }, // enviamos la uuid y el modo
    { path: 'media', component: MediaComponent },
    { path: 'drop', component: DropComponent },
    { path: 'tree', component: TreeComponent },
    { path: 'dessing', component: DessingComponent },
    // le enviamos recibimos el id del componente con /:
    { path: '**', pathMatch: 'full', redirectTo: 'proyectos' }
];

// export const APP_ROUTING = RouterModule.forRoot(APP_ROUTES, {useHash: true} ); //sin el useHash no marca la ruta 
export const APP_ROUTING = RouterModule.forRoot( APP_ROUTES, {useHash: true} );
