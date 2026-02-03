import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface FacturaResponse {
  status: 'OK' | 'ERROR';
  motivo?: string;
  nombre?: string;
  entidad?: string;
  fecha?: string;
  tipoComprobante?: 'Factura' | 'Recibo' | 'Ticket' | 'Otros';
  tipo_factura?: 'A' | 'B' | 'C';
  nro_factura?: string;
  items?: Array<{
    cantidad: number;
    descripcion: string;
    importe: number;
  }>;
  importe?: number;
}

@Injectable({
  providedIn: 'root'
})
export class FacturaService {
  private http = inject(HttpClient);
  private apiUrl = 'http://localhost:9401';

  procesarFactura(archivo: File): Observable<FacturaResponse> {
    const formData = new FormData();
    formData.append('documento', archivo);

    return this.http.post<FacturaResponse>(`${this.apiUrl}/procesar-factura`, formData);
  }
}
