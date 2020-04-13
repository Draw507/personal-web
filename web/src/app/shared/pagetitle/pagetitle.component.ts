import { Component, OnInit } from '@angular/core';
import { Title, Meta, MetaDefinition } from '@angular/platform-browser';
import { Router, ActivationEnd } from '@angular/router';
import { map, filter } from 'rxjs/operators';

@Component({
  selector: 'app-pagetitle',
  templateUrl: './pagetitle.component.html',
  styles: []
})
export class PagetitleComponent implements OnInit {

  titulo: string;
  descripcion: string = 'lorem ipsum dolor sit amet, consectetur adipisicing elit';

  constructor(
    private router: Router,
    private title: Title,
    private meta: Meta) {
      this.getDataRoute().subscribe(data => {
        this.titulo = data.titulo;
        this.title.setTitle(this.titulo);

        const metaTag: MetaDefinition = {
          name: 'description',
          content: this.titulo
        };

        this.meta.updateTag(metaTag);

      });
  }

  ngOnInit(): void {
  }

  getDataRoute() {
    return this.router.events
    .pipe(
      filter(evento => evento instanceof ActivationEnd),
      filter((evento: ActivationEnd) => evento.snapshot.firstChild === null),
      map((evento: ActivationEnd) => evento.snapshot.data)
    );
  }

}
