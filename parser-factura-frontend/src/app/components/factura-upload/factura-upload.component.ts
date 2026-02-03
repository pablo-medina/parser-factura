import { Component, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FacturaService, FacturaResponse } from '../../services/factura.service';

@Component({
  selector: 'app-factura-upload',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './factura-upload.component.html',
  styleUrl: './factura-upload.component.scss'
})
export class FacturaUploadComponent {
  private facturaService = inject(FacturaService);
  
  selectedFile = signal<File | null>(null);
  previewUrl = signal<string | null>(null);
  isProcessing = signal(false);
  resultado = signal<FacturaResponse | null>(null);
  error = signal<string | null>(null);

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      const file = input.files[0];
      this.selectedFile.set(file);
      this.error.set(null);
      this.resultado.set(null);

      // Crear preview para imágenes
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = (e) => {
          this.previewUrl.set(e.target?.result as string);
        };
        reader.readAsDataURL(file);
      } else {
        this.previewUrl.set(null);
      }
    }
  }

  procesarFactura(): void {
    const file = this.selectedFile();
    if (!file) {
      this.error.set('Por favor selecciona un archivo');
      return;
    }

    this.isProcessing.set(true);
    this.error.set(null);
    this.resultado.set(null);

    this.facturaService.procesarFactura(file).subscribe({
      next: (response) => {
        this.resultado.set(response);
        this.isProcessing.set(false);
      },
      error: (err) => {
        this.error.set(err.error?.motivo || 'Error al procesar la factura. Verifica que el backend esté corriendo.');
        this.isProcessing.set(false);
      }
    });
  }

  reset(): void {
    this.selectedFile.set(null);
    this.previewUrl.set(null);
    this.resultado.set(null);
    this.error.set(null);
    this.isProcessing.set(false);
  }

  formatCurrency(value: number | undefined): string {
    if (value === undefined) return '-';
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS'
    }).format(value);
  }

  formatDate(dateString: string | undefined): string {
    if (!dateString) return '-';
    try {
      const date = new Date(dateString);
      return new Intl.DateTimeFormat('es-AR', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
      }).format(date);
    } catch {
      return dateString;
    }
  }

  formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  }
}
