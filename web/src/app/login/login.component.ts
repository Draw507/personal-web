import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { NgForm } from '@angular/forms';
import { UsuarioService } from '../services/services.index';
import { Usuario } from '../models/usuario.model';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {

  recuerdame = false;
  loading = false;
  year: number;
  email: string;
  password: string;

  constructor(
    private router: Router,
    private usuarioService: UsuarioService) { }

  ngOnInit(): void {
    this.year = new Date().getFullYear();
  }

  ingresar(forma: NgForm) {
    if (forma.invalid) {
      return;
    }

    const usuario = {
      email: forma.value.email,
      password: forma.value.password
    };

    this.loading = true;

    this.usuarioService.login(usuario, forma.value.recuerdame)
    .subscribe(resp => {
      window.location.href = '#/dashboard';
    }, (err) => {
      this.loading = false;
      console.log('usuarioService.login', err);
    });

  }

}
