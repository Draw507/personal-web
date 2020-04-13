import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HeaderComponent } from './header/header.component';
import { NopageFoundComponent } from './nopage-found/nopage-found.component';
import { SidebarComponent } from './sidebar/sidebar.component';
import { PagetitleComponent } from './pagetitle/pagetitle.component';
import { FooterComponent } from './footer/footer.component';
import { RouterModule } from '@angular/router';

@NgModule({
  declarations: [
    HeaderComponent,
    NopageFoundComponent,
    SidebarComponent,
    PagetitleComponent,
    FooterComponent
  ],
  imports: [
    CommonModule,
    RouterModule
  ],
  exports: [
    HeaderComponent,
    SidebarComponent,
    NopageFoundComponent,
    PagetitleComponent,
    FooterComponent
  ]
})
export class SharedModule { }
