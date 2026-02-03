# Parser Factura - Frontend

Aplicación Angular 21 para procesamiento de facturas y comprobantes argentinos.

## Características

- Interfaz moderna y responsive
- Soporte para subida de imágenes y PDFs
- Captura de fotos desde dispositivos móviles
- Visualización de resultados estructurada
- Diseño simple y elegante con SCSS

## Requisitos

- Node.js LTS 24.13.0 o superior
- npm 11.6.2 o superior

## Instalación

```bash
npm install
```

## Desarrollo

```bash
npm start
```

La aplicación estará disponible en `http://localhost:9400`

## Build

```bash
npm run build
```

## Estructura del Proyecto

```
src/
├── app/
│   ├── components/
│   │   └── factura-upload/      # Componente principal
│   ├── services/
│   │   └── factura.service.ts   # Servicio de comunicación con backend
│   ├── app.config.ts            # Configuración de la app
│   ├── app.routes.ts            # Rutas
│   └── app.ts                   # Componente raíz
└── styles.scss                  # Estilos globales
```

## Uso

1. Abrí la aplicación en el navegador
2. Subí una imagen o PDF de una factura/recibo/ticket
3. Click en "Procesar Factura"
4. Visualizá los resultados extraídos

## Soporte Mobile

La aplicación soporta captura de fotos directamente desde dispositivos móviles usando el atributo `capture="environment"` en el input de archivos.

## Configuración

El backend por defecto está configurado en `http://localhost:9401`. Para cambiarlo, edita `src/app/services/factura.service.ts`:

```typescript
private apiUrl = 'http://localhost:9401';
```

## Licencia

MIT

## Autor

Pablo Medina
