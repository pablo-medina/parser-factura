import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { FacturaUploadComponent } from './components/factura-upload/factura-upload.component';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, FacturaUploadComponent],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App {}
