import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { UsuarioService } from '../usuario/usuario.service';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class CuentaService {

  constructor(
    private http: HttpClient,
    private usuarioService: UsuarioService) { }

  getCuentas() {

  }

  getCuenta() {
    // const url = `${environment.url}/cuentas/${this.usuarioService.userId}`;
    const url = `${environment.url}/cuentas/HCTY0s3jGig67bYmGv7I`;

    return this.http.get(url);
  }
}
