import { Component, OnInit } from '@angular/core';

declare function init_plugins();
declare function init_plugins2();

@Component({
  selector: 'app-pages',
  templateUrl: './pages.component.html',
  styles: []
})
export class PagesComponent implements OnInit {

  constructor() { }

  ngOnInit(): void {
    init_plugins();
    init_plugins2();
  }

}
