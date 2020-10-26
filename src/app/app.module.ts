import { BrowserModule } from '@angular/platform-browser';
import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClientModule, HttpClient } from '@angular/common/http'; // * uploads
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

// Translation https://github.com/ngx-translate/core#sharedmodule
import { TranslateLoader, TranslateModule } from '@ngx-translate/core';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';


// Alerts
import { AlertModule } from './_alert/alert.module'; // modulo importado de https://github.com/cornflourblue/angular-10-alert-notifications

// Material * uploads https://material.angular.io/
import { MatDialogModule } from '@angular/material/dialog';
import { MatTabsModule } from '@angular/material/tabs';
import { MatCardModule } from '@angular/material/card';
import {MatButtonModule} from '@angular/material/button';
import {MatProgressBarModule} from '@angular/material/progress-bar';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatInputModule} from '@angular/material/input';
import {MatSelectModule} from '@angular/material/select';
import {MatCheckboxModule} from '@angular/material/checkbox';
import { DragDropModule } from '@angular/cdk/drag-drop';
import {A11yModule} from '@angular/cdk/a11y';
import {PortalModule} from '@angular/cdk/portal';
import {ScrollingModule} from '@angular/cdk/scrolling';
import {CdkStepperModule} from '@angular/cdk/stepper';
import {CdkTableModule} from '@angular/cdk/table';
import {CdkTreeModule} from '@angular/cdk/tree';
import {MatTreeModule} from '@angular/material/tree';
import {MatIconModule} from '@angular/material/icon';
import {MatListModule} from '@angular/material/list';
import {MatDividerModule} from '@angular/material/divider';
import {MatMenuModule} from '@angular/material/menu';
import {MatTooltipModule} from '@angular/material/tooltip';
import {MatExpansionModule} from '@angular/material/expansion';
import {MatRadioModule} from '@angular/material/radio';



// hotkeys https://www.npmjs.com/package/ng-keyboard-shortcuts
import { KeyboardShortcutsModule } from 'ng-keyboard-shortcuts';

// Rutas
import { APP_ROUTING } from './app.routes';


// Servicios
import { OscService } from './servicios/osc.service';
import { WebsocketService } from './servicios/websocket.service';
import { ProyectosService } from './servicios/proyectos.service';
import { UploadService } from './servicios/upload.service';
import { FilesService } from './servicios/files.service';
import { PreferenciasService } from './servicios/preferencias.service';



// Componentes
import { AppComponent } from './app.component';
import { NavbarComponent } from './components/shared/navbar/navbar.component';
import { HomeComponent } from './components/home/home.component';
import { AboutComponent } from './components/about/about.component';
import { CueListComponent } from './components/cuelist/cuelist.component';
import { CueComponent } from './components/cue/cue.component';
import { ConsolaOscComponent } from './components/consola-osc/consola-osc.component';
import { FooterComponent } from './components/footer/footer.component';
import { MainNavbarComponent } from './components/shared/main-navbar/main-navbar.component';
import { ProyectosComponent } from './components/proyectos/proyectos.component';
import { MediaComponent } from './components/media/media.component';
import { EditCueComponent } from './components/edit-cue/edit-cue.component';
import { ConfirmDialogComponent } from './components/confirm-dialog/confirm-dialog.component';
import { DropComponent } from './components/drop/drop.component';
import { TreeComponent } from './components/tree/tree.component';
import { PreferencesComponent } from './components/preferences/preferences.component';

// Directivas
import { NgDropFilesDirective } from './directives/ng-drop-files.directive';
import { ClickOutsideDirective } from './click-outside.directive';
import { UnixNamePipe } from './pipes/unix-name.pipe';
import { NewProjectComponent } from './components/new-project/new-project.component'; // click outside




@NgModule({
  declarations: [
    AppComponent,
    NavbarComponent,
    HomeComponent,
    AboutComponent,
    CueListComponent,
    CueComponent,
    ConsolaOscComponent,
    FooterComponent,
    MainNavbarComponent,
    ProyectosComponent,
    ClickOutsideDirective,
    MediaComponent,
    EditCueComponent,
    ConfirmDialogComponent,
    DropComponent,
    TreeComponent,
    PreferencesComponent,
    NgDropFilesDirective,
    UnixNamePipe,
    NewProjectComponent
  ],
  imports: [
    BrowserModule,
    CommonModule,
    HttpClientModule,
    FormsModule,
    ReactiveFormsModule,
    APP_ROUTING,
    TranslateModule.forRoot({
      loader: {
        provide: TranslateLoader,
        useFactory: (http: HttpClient) => {
          return new TranslateHttpLoader(http);
        },
        deps: [ HttpClient ]
      }
    }),
    AlertModule,
    BrowserAnimationsModule,
    KeyboardShortcutsModule.forRoot(),
    
    MatDialogModule, MatTabsModule, MatCardModule, MatButtonModule, MatProgressBarModule,
    MatFormFieldModule, MatInputModule, MatSelectModule, MatCheckboxModule, MatTreeModule,
    MatIconModule, MatListModule, MatDividerModule, MatMenuModule, MatTooltipModule,
    MatExpansionModule, MatRadioModule,
    CdkTreeModule, A11yModule, DragDropModule, PortalModule, ScrollingModule, CdkStepperModule, CdkTableModule

  ],
  providers: [
    OscService,
    WebsocketService,
    ProyectosService,
    UploadService,
    FilesService,
    PreferenciasService
  ],
  bootstrap: [AppComponent],
  entryComponents: [
    EditCueComponent,
    ConfirmDialogComponent
  ],
  schemas: [ 
    CUSTOM_ELEMENTS_SCHEMA
  ]
})
export class AppModule { }
