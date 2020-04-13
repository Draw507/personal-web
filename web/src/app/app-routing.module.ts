import { Routes, RouterModule } from '@angular/router';
import { NopageFoundComponent } from './shared/nopage-found/nopage-found.component';
import { LoginComponent } from './login/login.component';


const routes: Routes = [
  { path: 'login', component: LoginComponent },
  { path: '**', component: NopageFoundComponent }
];

export const APP_ROUTES = RouterModule.forRoot( routes, { useHash: true } );
