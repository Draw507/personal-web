import { Component, OnInit } from '@angular/core';
import { CuentaService } from '../../services/cuenta/cuenta.service';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styles: []
})
export class DashboardComponent implements OnInit {

  mes: any;
  loading = true;

  constructor(public cuentaService: CuentaService) {
    cuentaService.getCuenta().subscribe((resp: any) => {
      this.mes = resp;
      this.loading = false;
      console.log('Cuenta datos: ', this.mes);
    });
  }

  ngOnInit(): void {
  }

}
