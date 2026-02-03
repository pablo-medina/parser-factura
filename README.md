# Parser Factura

Sistema completo para procesamiento de facturas y comprobantes argentinos utilizando IA local (LM Studio).

## Descripción

Parser Factura es una aplicación full-stack que permite procesar y extraer información de facturas, recibos y tickets argentinos utilizando modelos de IA locales. El sistema está compuesto por un backend Node.js/TypeScript y un frontend Angular 21.

## Características Principales

- ✅ Procesamiento de imágenes (JPG, PNG) y PDFs
- ✅ Extracción automática de datos de comprobantes
- ✅ Soporte para múltiples tipos de comprobantes:
  - Facturas fiscales (A, B, C)
  - Recibos de servicios públicos (luz, gas, agua)
  - Tickets de farmacia, supermercado, etc.
- ✅ Interfaz web moderna y responsive
- ✅ Captura de fotos desde dispositivos móviles
- ✅ Arquitectura extensible para múltiples proveedores de IA
- ✅ Configuración externa sin hardcodeo

## Estructura del Proyecto

```
parser-factura/
├── parser-factura-backend/    # Backend Node.js + TypeScript
│   ├── src/                   # Código fuente
│   ├── config.json            # Configuración
│   └── package.json
├── parser-factura-frontend/   # Frontend Angular 21
│   ├── src/                   # Código fuente
│   └── package.json
└── README.md                  # Este archivo
```

## Requisitos

- Node.js LTS 24.13.0 o superior
- LM Studio instalado y corriendo
- Modelo de visión compatible con LM Studio (recomendado: gemma-3-12b o superior)

## Instalación Rápida

### Backend

```bash
cd parser-factura-backend
npm install
```

Edita `config.json` y configura el modelo de LM Studio.

```bash
npm run dev
```

### Frontend

```bash
cd parser-factura-frontend
npm install
npm start
```

## Configuración

### Backend

Edita `parser-factura-backend/config.json`:

```json
{
  "server": {
    "port": 9401
  },
  "ai": {
    "lmstudio": {
      "baseUrl": "http://127.0.0.1:1234",
      "model": "google/gemma-3-12b"
    }
  }
}
```

### Frontend

Por defecto se conecta a `http://localhost:9401`. Para cambiarlo, edita `parser-factura-frontend/src/app/services/factura.service.ts`.

## Uso

1. Iniciá LM Studio y cargá un modelo de visión
2. Iniciá el backend: `cd parser-factura-backend && npm run dev`
3. Iniciá el frontend: `cd parser-factura-frontend && npm start`
4. Abrí `http://localhost:9400` en el navegador
5. Subí una imagen o PDF de una factura/recibo/ticket
6. Visualizá los resultados extraídos

## Endpoints del Backend

- `GET /status` - Health check
- `POST /procesar-factura` - Procesa un documento y extrae información

Ver documentación detallada en `parser-factura-backend/README.md`

## Tecnologías Utilizadas

### Backend
- Node.js 24.13.0
- TypeScript
- Express
- Winston (logging)
- Multer (upload de archivos)
- Axios (cliente HTTP)
- pdf-parse (procesamiento de PDFs)

### Frontend
- Angular 21
- TypeScript
- SCSS
- RxJS

## Arquitectura

El sistema está diseñado con una arquitectura modular y extensible:

- **Backend**: Cliente de IA abstracto que permite agregar nuevos proveedores fácilmente
- **Frontend**: Componentes standalone de Angular 21
- **Configuración**: Todo configurable externamente sin hardcodeo

## Licencia

MIT

## Autor

Pablo Medina

## Contribuciones

Las contribuciones son bienvenidas. Por favor, abrí un issue o pull request.
